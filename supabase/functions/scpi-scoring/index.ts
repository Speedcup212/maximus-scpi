import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

type SectorMap = Record<string, number>;
type GeoMap = Record<string, number>;

type ScpiInput = {
  id?: string | number;
  nom: string;
  societe_gestion?: string | null;
  rendement?: number | null;
  tof?: number | null;
  endettement?: number | null;
  label_isr?: string | null;
  sfdr?: string | null;
  capitalisation?: number | null;
  delai_jouissance?: number | null;
  prix_souscription?: number | null;
  valeur_reconstitution?: number | null;
  frais_gestion?: number | null;
  frais_souscription?: number | null;
  repartitionSector?: SectorMap | null;
  repartitionGeo?: GeoMap | null;
  repartition_sectorielle?: SectorMap | null;
  repartition_geographique?: GeoMap | null;
};

type ScpiScores = {
  id?: string | number;
  nom: string;
  societe_gestion?: string | null;
  score_rendement: number;
  score_secteur: number;
  score_geo: number;
  score_qualite: number;
  score_taille: number;
  score_total: number;
  audit_trail: string[];
};

type ScoringParams = {
  barèmes: {
    secteur: Record<string, number>;
    geo: { france: number; europe: number; international: number };
  };
  seuils: {
    tof: { haut: number; moyen: number };
    ltv: { tres_faible: number; faible: number; moyen: number };
    ecart_reconst: { bonus: number; neutre: number };
  };
  fallbacks: {
    secteur_unknown: number;
    geo_missing_is_france: boolean;
    capi_null_points: number;
  };
};

const defaultParams: ScoringParams = {
  barèmes: {
    secteur: {
      "sant": 1.00, "health": 1.00, "éduc": 1.00, "educ": 1.00,
      "commerce": 0.85, "retail": 0.85,
      "bureau": 0.70, "office": 0.70,
      "résident": 0.75, "residen": 0.75,
      "logist": 0.80, "activit": 0.80, "entrep": 0.80, "industrial": 0.80,
      "hôtel": 0.60, "hotel": 0.60, "loisir": 0.60,
      "autre": 0.70, "other": 0.70
    },
    geo: { france: 1.0, europe: 0.8, international: 0.6 }
  },
  seuils: {
    tof: { haut: 95, moyen: 90 },
    ltv: { tres_faible: 15, faible: 30, moyen: 40 },
    ecart_reconst: { bonus: -0.02, neutre: 0.02 }
  },
  fallbacks: {
    secteur_unknown: 0.70,
    geo_missing_is_france: true,
    capi_null_points: 3
  }
};

const clamp = (x: number, min: number, max: number) => Math.max(min, Math.min(max, x));

function normaliseWeights(map?: Record<string, number> | null): Record<string, number> {
  if (!map || Object.keys(map).length === 0) return {};
  const total = Object.values(map).reduce((a, b) => a + (Number(b) || 0), 0);
  if (total <= 0) return {};
  const out: Record<string, number> = {};
  for (const k of Object.keys(map)) out[k] = (Number(map[k]) || 0) / total;
  return out;
}

function percentRank(values: number[], v: number): number {
  const valid = values.filter(x => Number.isFinite(x)).sort((a, b) => a - b);
  if (valid.length === 0) return 0;
  if (valid.length === 1) return 1;
  const min = valid[0], max = valid[valid.length - 1];
  if (v <= min) return 0;
  if (v >= max) return 1;
  const idx = valid.findIndex(x => x >= v);
  return idx / (valid.length - 1);
}

function getSectorMap(s: ScpiInput): SectorMap | null {
  return s.repartition_sectorielle ?? s.repartitionSector ?? null;
}

function getGeoMap(s: ScpiInput): GeoMap | null {
  return s.repartition_geographique ?? s.repartitionGeo ?? null;
}

function scoreRendement(scpi: ScpiInput, allRendements: number[], audit: string[]): number {
  const r = Number(scpi.rendement);
  if (!Number.isFinite(r)) {
    audit.push(`Rendement manquant → percentile=0 → score 0`);
    return 0;
  }
  const p = percentRank(allRendements, r);
  let score = 40 * p;
  const fg = Number(scpi.frais_gestion) || 0;
  const malus = Math.max(fg - 10, 0) * 0.5;
  score -= malus;
  const fs = Number(scpi.frais_souscription) || 0;
  if (fs === 0) score += 1;
  audit.push(`Rendement p=${p.toFixed(2)} → 40*p=${(40*p).toFixed(2)} ; frais_gestion=${fg} ⇒ −${malus.toFixed(2)} ; frais_souscription=${fs} ⇒ ${fs===0?'+1':'0'}`);
  return clamp(score, 0, 40);
}

function scoreSecteur(scpi: ScpiInput, params: ScoringParams, audit: string[]): number {
  const raw = getSectorMap(scpi);
  const weights = normaliseWeights(raw);
  let acc = 0, explained: string[] = [];
  if (Object.keys(weights).length === 0) {
    const base = 20 * params.fallbacks.secteur_unknown;
    audit.push(`Secteur manquant → fallback ${(params.fallbacks.secteur_unknown*20).toFixed(2)}`);
    return clamp(base, 0, 20);
  }
  for (const k of Object.keys(weights)) {
    const key = k.toLowerCase();
    let coef = params.fallbacks.secteur_unknown;
    for (const probe in params.barèmes.secteur) {
      if (key.includes(probe)) { coef = params.barèmes.secteur[probe]; break; }
    }
    acc += weights[k] * coef;
    explained.push(`${(weights[k]*100).toFixed(0)}% ${k}(${coef.toFixed(2)})`);
  }
  const score = 20 * acc;
  audit.push(`Secteur: ${explained.join(' + ')} ⇒ ${(acc*20).toFixed(2)}`);
  return clamp(score, 0, 20);
}

function scoreGeo(scpi: ScpiInput, params: ScoringParams, audit: string[]): number {
  const raw = getGeoMap(scpi);
  if (!raw || Object.keys(raw).length === 0) {
    if (params.fallbacks.geo_missing_is_france) {
      audit.push(`Géo manquante → France (fallback) ⇒ ${15 * params.barèmes.geo.france}`);
      return 15 * params.barèmes.geo.france;
    }
    return 15 * params.barèmes.geo.europe;
  }
  const w = normaliseWeights(raw);
  let wFR = 0, wEU = 0, wINT = 0;
  for (const k of Object.keys(w)) {
    const key = k.toLowerCase();
    const v = w[k];
    if (/(paris|france|île|ile|idf|région|metropole|province)/.test(key)) wFR += v;
    else if (/(allemagne|germany|espagne|spain|pays-bas|netherlands|irlande|ireland|belg|pologne|poland|italie|italy|royaume-uni|uk|londres|london|suisse|switzerland|autriche|austria|suede|sweden|norv|denmark|danemark|finlande|finland|portugal|tche|czech|hongrie|hungary)/.test(key)) wEU += v;
    else wINT += v;
  }
  const { france, europe, international } = params.barèmes.geo;
  const coef = wFR*france + wEU*europe + wINT*international;
  const score = 15 * coef;
  audit.push(`Géo: FR ${(wFR*100).toFixed(0)}% (1.00), EU ${(wEU*100).toFixed(0)}% (0.80), INT ${(wINT*100).toFixed(0)}% (0.60) ⇒ ${(coef*15).toFixed(2)}`);
  return clamp(score, 0, 15);
}

function scoreQualite(scpi: ScpiInput, params: ScoringParams, audit: string[]): number {
  const { tof, endettement, prix_souscription, valeur_reconstitution, label_isr, sfdr } = scpi;
  let pts = 0;
  if (tof == null) { pts += 2; audit.push(`Qualité/TOF: null → +2`); }
  else if (tof >= params.seuils.tof.haut) { pts += 7; audit.push(`Qualité/TOF: ${tof}% ≥ ${params.seuils.tof.haut}% → +7`); }
  else if (tof >= params.seuils.tof.moyen) { pts += 4; audit.push(`Qualité/TOF: ${tof}% ∈ [${params.seuils.tof.moyen}; ${params.seuils.tof.haut}) → +4`); }
  else { pts += 1; audit.push(`Qualité/TOF: ${tof}% < ${params.seuils.tof.moyen}% → +1`); }

  if (endettement == null) { pts += 2; audit.push(`Qualité/LTV: null → +2`); }
  else if (endettement <= params.seuils.ltv.tres_faible) { pts += 4; audit.push(`Qualité/LTV: ${endettement}% ≤ ${params.seuils.ltv.tres_faible}% → +4`); }
  else if (endettement <= params.seuils.ltv.faible) { pts += 3; audit.push(`Qualité/LTV: ${endettement}% ≤ ${params.seuils.ltv.faible}% → +3`); }
  else if (endettement <= params.seuils.ltv.moyen) { pts += 2; audit.push(`Qualité/LTV: ${endettement}% ≤ ${params.seuils.ltv.moyen}% → +2`); }
  else { pts += 1; audit.push(`Qualité/LTV: ${endettement}% > ${params.seuils.ltv.moyen}% → +1`); }

  let ecartUsed = false;
  if (valeur_reconstitution && valeur_reconstitution > 0 && prix_souscription != null) {
    const e = (prix_souscription - valeur_reconstitution) / valeur_reconstitution;
    ecartUsed = true;
    if (e <= params.seuils.ecart_reconst.bonus) { pts += 2; audit.push(`Qualité/Ecart: décote ${(e*100).toFixed(2)}% ≤ ${params.seuils.ecart_reconst.bonus*100}% → +2`); }
    else if (Math.abs(e) <= params.seuils.ecart_reconst.neutre) { pts += 1; audit.push(`Qualité/Ecart: |${(e*100).toFixed(2)}%| ≤ ${params.seuils.ecart_reconst.neutre*100}% → +1`); }
    else { pts += 0; audit.push(`Qualité/Ecart: surcote ${(e*100).toFixed(2)}% > ${params.seuils.ecart_reconst.neutre*100}% → +0`); }
  }
  if (!ecartUsed) { pts += 1; audit.push(`Qualité/Ecart: données manquantes → +1 (fallback)`); }

  if ((label_isr || '').toLowerCase() === 'oui') { pts += 1; audit.push(`Qualité/ISR: oui → +1`); }
  const sfdrNorm = (sfdr || '').trim();
  if (sfdrNorm.includes('9')) { pts += 1; audit.push(`Qualité/SFDR: 9 → +1`); }
  else if (sfdrNorm.includes('8')) { pts += 0.5; audit.push(`Qualité/SFDR: 8 → +0.5`); }

  const score = clamp(pts, 0, 15);
  audit.push(`Qualité total (cap 15) = ${score.toFixed(2)}`);
  return score;
}

function scoreTaille(scpi: ScpiInput, params: ScoringParams, audit: string[]): number {
  const cap = Number(scpi.capitalisation);
  let pts = 0;
  if (!Number.isFinite(cap)) { pts += params.fallbacks.capi_null_points; audit.push(`Taille: capi=null → +${params.fallbacks.capi_null_points}`); }
  else if (cap >= 1000) { pts += 9; audit.push(`Taille: capi=${cap} ≥ 1000 → +9`); }
  else if (cap >= 500) { pts += 7; audit.push(`Taille: capi=${cap} ∈ [500;999] → +7`); }
  else if (cap >= 100) { pts += 5; audit.push(`Taille: capi=${cap} ∈ [100;499] → +5`); }
  else if (cap >= 50) { pts += 3; audit.push(`Taille: capi=${cap} ∈ [50;99] → +3`); }
  else { pts += 1; audit.push(`Taille: capi=${cap} < 50 → +1`); }

  const dj = Number(scpi.delai_jouissance);
  if (Number.isFinite(dj)) {
    if (dj <= 1) { pts += 1; audit.push(`Taille: délai=${dj} mois ≤1 → +1`); }
    else if (dj <= 6) { pts += 0.5; audit.push(`Taille: délai=${dj} mois ∈ [2;6] → +0.5`); }
    else { audit.push(`Taille: délai=${dj} mois >6 → +0`); }
  } else {
    audit.push(`Taille: délai=null → +0`);
  }

  const score = clamp(pts, 0, 10);
  audit.push(`Taille total (cap 10) = ${score.toFixed(2)}`);
  return score;
}

function scoreScpiBatch(items: ScpiInput[], params: ScoringParams = defaultParams): ScpiScores[] {
  const rList = items.map(x => Number(x.rendement)).filter(x => Number.isFinite(x)) as number[];
  return items.map(scpi => {
    const audit: string[] = [];
    const sr = scoreRendement(scpi, rList, audit);
    const ss = scoreSecteur(scpi, params, audit);
    const sg = scoreGeo(scpi, params, audit);
    const sq = scoreQualite(scpi, params, audit);
    const st = scoreTaille(scpi, params, audit);
    const total = clamp(sr + ss + sg + sq + st, 0, 100);
    audit.push(`Total = ${total.toFixed(2)}`);

    return {
      id: scpi.id,
      nom: scpi.nom,
      societe_gestion: scpi.societe_gestion ?? null,
      score_rendement: +sr.toFixed(2),
      score_secteur: +ss.toFixed(2),
      score_geo: +sg.toFixed(2),
      score_qualite: +sq.toFixed(2),
      score_taille: +st.toFixed(2),
      score_total: +total.toFixed(2),
      audit_trail: audit
    };
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { scpi_data, save_to_db = false } = await req.json();

    if (!scpi_data || !Array.isArray(scpi_data)) {
      return new Response(
        JSON.stringify({ error: "scpi_data array required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const scores = scoreScpiBatch(scpi_data, defaultParams);

    if (save_to_db) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const dbRecords = scores.map(s => ({
        scpi_id: s.id,
        nom: s.nom,
        societe_gestion: s.societe_gestion,
        score_rendement: s.score_rendement,
        score_secteur: s.score_secteur,
        score_geo: s.score_geo,
        score_qualite: s.score_qualite,
        score_taille: s.score_taille,
        score_total: s.score_total,
        audit_trail: s.audit_trail,
        params_version: 'v1.0'
      }));

      const { error } = await supabase.from('scores_scpi').insert(dbRecords);
      if (error) {
        return new Response(
          JSON.stringify({ error: error.message, scores }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(
      JSON.stringify({ scores, count: scores.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});