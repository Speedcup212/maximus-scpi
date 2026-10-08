import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { classifyTofOccupation } from '../utils/surveillanceSignals';
import { getEffectiveRiskLevel } from '../utils/analysisReliability';

const trajectory = readFileSync(new URL('../components/trajectory/TrajectorySurveillanceTable.tsx', import.meta.url), 'utf8');
const analyses = readFileSync(new URL('../components/AnalysesLiveFeed.tsx', import.meta.url), 'utf8');
const bulletin = readFileSync(new URL('../components/ScpiQuarterlyAnalysis.tsx', import.meta.url), 'utf8');
const surveillance = readFileSync(new URL('../components/SurveillancePage.tsx', import.meta.url), 'utf8');

describe('Cohérence TOF entre Surveillance, Analyses, Trajectoires et bulletins', () => {
  it('classe 94,31 % comme satisfaisant, même avec une variation négative', () => {
    expect(classifyTofOccupation(94.31)).toBe('satisfaisant');
    expect(classifyTofOccupation(100)).toBe('eleve');
    expect(classifyTofOccupation(89.99)).toBe('fragile');
    expect(classifyTofOccupation(84.99)).toBe('faible');
    expect(classifyTofOccupation(79.99)).toBe('critique');
    expect(classifyTofOccupation(null)).toBe('inconnu');
  });
  it('ne surclasse pas en risque élevé une simple baisse de TOF à 94,31 %', () => {
    const signal = {
      metric: 'tof', severity: 'info' as const,
      message: 'TOF en baisse de 0,71 point, de 95,02% à 94,31%.',
    };
    expect(getEffectiveRiskLevel('low', [signal])).toBe('low');
  });
  it('affiche le niveau de TOF et nuance la couleur d’un recul dans Trajectoires', () => {
    expect(trajectory).toContain('classifyTofOccupation(row.tof)');
    expect(trajectory).toContain('deltaTone(row.tofDelta, row.tof)');
    expect(trajectory).toContain("tier === 'eleve' || tier === 'satisfaisant'");
    expect(trajectory).toContain("return 'text-sky-300'");
    expect(trajectory).toContain("return 'text-amber-300'");
    expect(trajectory).toContain("return 'text-rose-300'");
  });
  it('ne réétiquette pas une dégradation dans Analyses sans valeur datée concordante', () => {
    expect(analyses).toContain('contextualizeTofBulletinSignal');
    expect(analyses).toContain('normalizePeriod(h.source_period) === normalizePeriod(row.current_period)');
    expect(analyses).toContain('Math.abs(recordedTof - statedTof) > 0.3');
    expect(analyses).toContain("tone: 'info'");
    expect(analyses).toContain('Mouvements et informations de suivi');
    expect(analyses).toContain('signalToneClasses.info');
  });
  it('dans le bulletin détaillé, distingue tendance et niveau sans supprimer les autres signaux', () => {
    expect(bulletin).toContain('Informations de suivi — occupation satisfaisante');
    expect(bulletin).toContain('const actualAlerts = alerts.filter');
    expect(bulletin).toContain('const actualWatchPoints = watchPoints.filter');
    expect(bulletin).toContain('const actualDeteriorations = deteriorations.filter');
    expect(bulletin).toContain('classifyTofOccupation(signal.current)');
  });
  it('Surveillance distingue informations, vigilances et absence de signal', () => {
    expect(surveillance).toContain('Informations de suivi');
    expect(surveillance).toContain('Sans signal détecté');
    expect(surveillance).toContain("filter === 'information'");
    expect(surveillance).toContain("row.level === 'info'");
    expect(surveillance).toContain("row.level === 'clear'");
  });
});
