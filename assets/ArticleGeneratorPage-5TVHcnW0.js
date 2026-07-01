import{r as d,j as e,s as y}from"./index-DoWiKje_.js";import{P as L,f as T,H as E,ag as g,F,a1 as G,W as O,ah as b}from"./App-AS35pcip.js";import{C as k}from"./check-5-0WlR7a.js";import{C as _}from"./clock-Bcc45gfh.js";import{Z as H}from"./zap-Dxio23VA.js";import{E as V}from"./eye-C4gyswE2.js";/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const D=L("Download",[["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["polyline",{points:"7 10 12 15 17 10",key:"2ggqvy"}],["line",{x1:"12",x2:"12",y1:"15",y2:"3",key:"1vk2je"}]]);function w(t){const a=K(t).join(`

`),u=ge(a),x=Math.ceil(u/200);return{html:a,wordCount:u,readTime:x}}function K(t){const s=[];return s.push(U(t)),t.category==="comparatifs"?s.push(...Q(t)):t.category==="fiscalite"?s.push(...ee()):t.category==="strategies"?s.push(...ae(t)):t.category==="marche"?s.push(...le(t)):t.category==="guides"&&s.push(...ie(t)),s.push(oe()),s.push(de()),s.push(ce(t)),s.push(ue()),s}function U(t){return`
<div class="prose prose-lg max-w-none mb-12">
  <p class="text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
    ${B(t)}
  </p>
  <p class="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
    Dans cet article, nous analysons en détail ${t.mainKeyword} pour vous aider à prendre la meilleure décision selon votre situation patrimoniale, votre TMI et vos objectifs d'investissement.
  </p>
</div>
`}function B(t){return{1:"Vous détenez une assurance-vie avec un capital conséquent sur un fonds euros et vous vous demandez s'il est temps de diversifier vers les SCPI ? Avec des rendements du fonds euros qui stagnent autour de 2 % tandis que l'inflation reste à 2 %, votre épargne peine à progresser réellement. Les SCPI, qui affichent des performances moyennes de 5 % en France et jusqu'à 6,5 % pour les SCPI européennes, représentent-elles une alternative pertinente ?",2:"Vous envisagez d'investir en SCPI et vous hésitez entre la souscription en direct ou via votre contrat d'assurance-vie ? Cette question est fondamentale car elle impacte directement votre fiscalité, vos frais, votre capacité de transmission et la liquidité de votre investissement. Comprendre ces différences concrètes est essentiel pour optimiser votre patrimoine.",3:"Avec des taux de crédit immobilier autour de 3-4 % en 2025, est-il encore judicieux d'investir en SCPI à crédit pour bénéficier de l'effet de levier ? L'équation rentabilité SCPI (5-6,5 %) moins coût du crédit (3,5-4 %) reste-t-elle favorable, surtout après prise en compte de la déductibilité des intérêts d'emprunt pour les TMI élevés ?"}[t.id]||`${t.searchIntent}. Ce guide complet vous apporte toutes les clés pour comprendre et décider en toute connaissance de cause.`}function Q(t){return[`
<section class="mb-16">
  <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
    <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
    </svg>
    Vue d'ensemble : les deux solutions en présence
  </h2>

  <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
    <p class="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
      ${W(t)}
    </p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      ${Z()}
    </div>
  </div>
</section>
`,J(),Y()]}function W(t){return`Pour bien comprendre ${t.mainKeyword}, il est essentiel de comparer objectivement les caractéristiques, avantages et inconvénients de chaque solution. Voici une analyse détaillée basée sur des critères concrets.`}function Z(t){return`
    <div class="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
      <h3 class="text-xl font-bold text-blue-900 dark:text-blue-200 mb-4">Option 1</h3>
      <ul class="space-y-3 text-blue-800 dark:text-blue-300">
        <li class="flex items-start gap-2">
          <span class="text-blue-600 dark:text-blue-400">✓</span>
          <span>Avantage clé 1</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-blue-600 dark:text-blue-400">✓</span>
          <span>Avantage clé 2</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-blue-600 dark:text-blue-400">✓</span>
          <span>Avantage clé 3</span>
        </li>
      </ul>
    </div>

    <div class="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
      <h3 class="text-xl font-bold text-green-900 dark:text-green-200 mb-4">Option 2</h3>
      <ul class="space-y-3 text-green-800 dark:text-green-300">
        <li class="flex items-start gap-2">
          <span class="text-green-600 dark:text-green-400">✓</span>
          <span>Avantage clé 1</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-green-600 dark:text-green-400">✓</span>
          <span>Avantage clé 2</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-green-600 dark:text-green-400">✓</span>
          <span>Avantage clé 3</span>
        </li>
      </ul>
    </div>
  `}function J(t){return`
<section class="mb-16">
  <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">
    Tableau comparatif détaillé
  </h2>

  <div class="overflow-x-auto">
    <table class="w-full text-left bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <thead>
        <tr class="border-b-2 border-gray-300 dark:border-gray-600">
          <th class="py-4 px-4 font-bold text-gray-900 dark:text-white">Critère</th>
          <th class="py-4 px-4 font-bold text-blue-600 dark:text-blue-400">Option 1</th>
          <th class="py-4 px-4 font-bold text-green-600 dark:text-green-400">Option 2</th>
        </tr>
      </thead>
      <tbody class="text-gray-700 dark:text-gray-300">
        ${X()}
      </tbody>
    </table>
  </div>
</section>
`}function X(t){return[{name:"Rendement moyen",col1:"2%",col2:"5-6,5%"},{name:"Garantie capital",col1:"✅ Oui",col2:"❌ Non"},{name:"Liquidité",col1:"✅ Immédiate",col2:"⚠️ Différée"},{name:"Fiscalité",col1:"17,2% minimum",col2:"Variable selon enveloppe"},{name:"Frais d'entrée",col1:"0%",col2:"8-12% (direct)"}].map(a=>`
    <tr class="border-b border-gray-200 dark:border-gray-700">
      <td class="py-4 px-4 font-semibold">${a.name}</td>
      <td class="py-4 px-4">${a.col1}</td>
      <td class="py-4 px-4">${a.col2}</td>
    </tr>
  `).join("")}function Y(t){return`
<section class="mb-16">
  <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
    <svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
    </svg>
    Exemple chiffré concret
  </h2>

  <div class="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-2xl p-8 border-2 border-orange-200 dark:border-orange-800">
    <h3 class="text-2xl font-bold text-orange-900 dark:text-orange-200 mb-4">
      Simulation sur 15 ans
    </h3>

    <div class="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6">
      <h4 class="font-bold text-gray-900 dark:text-white mb-3">Hypothèses</h4>
      <ul class="space-y-2 text-gray-700 dark:text-gray-300">
        <li>• Capital initial : 100 000 €</li>
        <li>• Durée : 15 ans</li>
        <li>• TMI : 30%</li>
        <li>• Inflation : 2% par an</li>
      </ul>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6">
        <h4 class="font-bold text-blue-600 dark:text-blue-400 mb-3">Scénario 1</h4>
        <ul class="space-y-2 text-gray-700 dark:text-gray-300">
          <li>• Revenus bruts cumulés : 30 000 €</li>
          <li>• Revenus nets après fiscalité : 24 900 €</li>
          <li>• Capital final : 124 900 €</li>
        </ul>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl p-6">
        <h4 class="font-bold text-green-600 dark:text-green-400 mb-3">Scénario 2</h4>
        <ul class="space-y-2 text-gray-700 dark:text-gray-300">
          <li>• Revenus bruts cumulés : 75 000 €</li>
          <li>• Revenus nets après fiscalité : 53 600 €</li>
          <li>• Capital final : 153 600 €</li>
        </ul>
      </div>
    </div>

    <div class="mt-6 p-6 bg-orange-100 dark:bg-orange-900/30 rounded-xl border-2 border-orange-300 dark:border-orange-700">
      <p class="text-lg font-bold text-orange-900 dark:text-orange-200">
        💡 Différence : +28 700 € sur 15 ans, soit +23% de performance
      </p>
    </div>
  </div>
</section>
`}function ee(t){return[`
<section class="mb-16">
  <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
    <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
    Comprendre la fiscalité : calculs détaillés
  </h2>

  <div class="space-y-6">
    ${te()}
  </div>
</section>
`,re()]}function te(t){return`
    <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
      <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Calcul de l'imposition selon votre TMI
      </h3>

      <div class="space-y-6">
        <div class="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <h4 class="font-bold text-blue-900 dark:text-blue-200 mb-3">TMI 11%</h4>
          <ul class="space-y-2 text-blue-800 dark:text-blue-300">
            <li>• Revenus bruts SCPI : 5 000 €</li>
            <li>• IR (11%) : 550 €</li>
            <li>• Prélèvements sociaux (17,2%) : 860 €</li>
            <li><strong>• Revenus nets : 3 590 € (71,8%)</strong></li>
          </ul>
        </div>

        <div class="p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
          <h4 class="font-bold text-green-900 dark:text-green-200 mb-3">TMI 30%</h4>
          <ul class="space-y-2 text-green-800 dark:text-green-300">
            <li>• Revenus bruts SCPI : 5 000 €</li>
            <li>• IR (30%) : 1 500 €</li>
            <li>• Prélèvements sociaux (17,2%) : 860 €</li>
            <li><strong>• Revenus nets : 2 640 € (52,8%)</strong></li>
          </ul>
        </div>

        <div class="p-6 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
          <h4 class="font-bold text-orange-900 dark:text-orange-200 mb-3">TMI 41%</h4>
          <ul class="space-y-2 text-orange-800 dark:text-orange-300">
            <li>• Revenus bruts SCPI : 5 000 €</li>
            <li>• IR (41%) : 2 050 €</li>
            <li>• Prélèvements sociaux (17,2%) : 860 €</li>
            <li><strong>• Revenus nets : 2 090 € (41,8%)</strong></li>
          </ul>
        </div>
      </div>
    </div>
  `}function re(t){return`
<section class="mb-16">
  <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">
    Stratégies d'optimisation fiscale
  </h2>

  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div class="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
      <h3 class="text-xl font-bold text-blue-900 dark:text-blue-200 mb-4">Stratégie 1 : Assurance-vie</h3>
      <p class="text-blue-800 dark:text-blue-300 mb-4">
        Logez vos SCPI dans une assurance-vie pour bénéficier de l'abattement après 8 ans (4 600 € / 9 200 € pour un couple).
      </p>
      <p class="font-bold text-blue-900 dark:text-blue-200">
        → Économie fiscale : jusqu'à 2 700 €/an
      </p>
    </div>

    <div class="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
      <h3 class="text-xl font-bold text-green-900 dark:text-green-200 mb-4">Stratégie 2 : SCPI européennes</h3>
      <p class="text-green-800 dark:text-green-300 mb-4">
        Privilégiez les SCPI investies en Europe pour limiter l'imposition (pas de micro-foncier, fiscalité spécifique).
      </p>
      <p class="font-bold text-green-900 dark:text-green-200">
        → Rendement net optimisé pour TMI élevés
      </p>
    </div>

    <div class="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
      <h3 class="text-xl font-bold text-orange-900 dark:text-orange-200 mb-4">Stratégie 3 : Crédit déductible</h3>
      <p class="text-orange-800 dark:text-orange-300 mb-4">
        Investissez à crédit pour déduire les intérêts d'emprunt de vos revenus fonciers et réduire votre assiette taxable.
      </p>
      <p class="font-bold text-orange-900 dark:text-orange-200">
        → Effet levier fiscal + patrimonial
      </p>
    </div>
  </div>
</section>
`}function ae(t){return[`
<section class="mb-16">
  <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">
    Quelle stratégie adopter selon votre profil ?
  </h2>

  <div class="space-y-6">
    ${se()}
  </div>
</section>
`,ne(t)]}function se(t){return[{name:"Profil prudent (aversion au risque forte)",color:"blue",recommendation:"Conservez 70-80% sur fonds euros, testez les SCPI avec 20-30% de votre capital",allocation:"70% fonds euros / 30% SCPI",expectedReturn:"2,8% net"},{name:"Profil équilibré (acceptation risque modéré)",color:"green",recommendation:"Répartissez équitablement : 50% fonds euros pour la sécurité, 50% SCPI pour le rendement",allocation:"50% fonds euros / 50% SCPI",expectedReturn:"3,7% net"},{name:"Profil dynamique (recherche de performance)",color:"orange",recommendation:"Privilégiez les SCPI (70-80%) avec une poche de sécurité minimale (20-30%) en fonds euros",allocation:"30% fonds euros / 70% SCPI",expectedReturn:"4,4% net"}].map(a=>`
    <div class="bg-${a.color}-50 dark:bg-${a.color}-900/20 rounded-2xl p-8 border-2 border-${a.color}-200 dark:border-${a.color}-800">
      <h3 class="text-2xl font-bold text-${a.color}-900 dark:text-${a.color}-200 mb-4 flex items-center gap-2">
        <span>👤</span>
        ${a.name}
      </h3>
      <p class="text-${a.color}-800 dark:text-${a.color}-300 mb-4 font-semibold">
        ${a.recommendation}
      </p>
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Allocation recommandée</div>
            <div class="text-lg font-bold text-${a.color}-600 dark:text-${a.color}-400">${a.allocation}</div>
          </div>
          <div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Rendement espéré</div>
            <div class="text-lg font-bold text-${a.color}-600 dark:text-${a.color}-400">${a.expectedReturn}</div>
          </div>
        </div>
      </div>
    </div>
  `).join(`
`)}function ne(t){return`
<section class="mb-16">
  <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">
    Plan d'action en 5 étapes
  </h2>

  <div class="space-y-4">
    ${[1,2,3,4,5].map(s=>`
      <div class="flex items-start gap-4 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div class="flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">
          ${s}
        </div>
        <div class="flex-1">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Étape ${s}</h3>
          <p class="text-gray-700 dark:text-gray-300">
            Description de l'étape ${s} pour mettre en œuvre votre stratégie ${t.mainKeyword}.
          </p>
        </div>
      </div>
    `).join(`
`)}
  </div>
</section>
`}function le(t){return[`
<section class="mb-16">
  <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">
    État du marché en 2025
  </h2>

  <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
    <p class="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
      Analyse détaillée du marché pour ${t.mainKeyword} avec les dernières tendances et perspectives.
    </p>
  </div>
</section>
`]}function ie(t){return[`
<section class="mb-16">
  <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">
    Guide pratique étape par étape
  </h2>

  <div class="space-y-6">
    <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
      Suivez ce guide complet pour ${t.mainKeyword} de manière optimale.
    </p>
  </div>
</section>
`]}function oe(t){return`
<section class="mb-16">
  <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">
    Visualisation des données
  </h2>

  <div class="space-y-8">
    <div class="bg-gray-100 dark:bg-gray-800 rounded-2xl p-8 border-2 border-dashed border-gray-300 dark:border-gray-600">
      <div class="text-center">
        <div class="text-6xl mb-4">📊</div>
        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
          [FIGURE 1 – Camembert : Répartition d'allocation recommandée]
        </h3>
        <p class="text-gray-600 dark:text-gray-400">
          Ce graphique illustre la répartition optimale entre fonds euros et SCPI selon votre profil de risque.
        </p>
      </div>
    </div>

    <div class="bg-gray-100 dark:bg-gray-800 rounded-2xl p-8 border-2 border-dashed border-gray-300 dark:border-gray-600">
      <div class="text-center">
        <div class="text-6xl mb-4">📈</div>
        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
          [FIGURE 2 – Histogramme : Évolution du capital sur 15 ans]
        </h3>
        <p class="text-gray-600 dark:text-gray-400">
          Comparaison de l'évolution du capital selon la stratégie choisie, illustrant le coût d'opportunité.
        </p>
      </div>
    </div>
  </div>
</section>
`}function de(){return`
<section class="mb-16">
  <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
    <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
    </svg>
    Points de vigilance et risques
  </h2>

  <div class="bg-red-50 dark:bg-red-900/20 rounded-2xl p-8 border-2 border-red-200 dark:border-red-800">
    <div class="space-y-6">
      <div>
        <h3 class="text-xl font-bold text-red-900 dark:text-red-200 mb-3">Capital non garanti</h3>
        <p class="text-red-800 dark:text-red-300 leading-relaxed">
          Contrairement au fonds euros, le capital investi en SCPI n'est pas garanti. La valeur de vos parts peut fluctuer à la baisse selon l'évolution du marché immobilier.
        </p>
      </div>

      <div>
        <h3 class="text-xl font-bold text-red-900 dark:text-red-200 mb-3">Liquidité limitée</h3>
        <p class="text-red-800 dark:text-red-300 leading-relaxed">
          Les SCPI ne se revendent pas instantanément. Comptez plusieurs semaines, voire quelques mois en période de tension. Horizon de placement recommandé : 8-10 ans minimum.
        </p>
      </div>

      <div>
        <h3 class="text-xl font-bold text-red-900 dark:text-red-200 mb-3">Risques locatifs</h3>
        <p class="text-red-800 dark:text-red-300 leading-relaxed">
          Vacance locative, défaillance locataires, baisse des loyers : ces risques peuvent impacter négativement les dividendes distribués.
        </p>
      </div>
    </div>
  </div>
</section>
`}function ce(t){const s=[{question:"Quel est le rendement moyen des SCPI en 2025 ?",answer:"Le rendement moyen des SCPI françaises s'établit autour de 5% en 2025, tandis que les SCPI européennes affichent des performances de 6 à 6,5%. Ces rendements sont nets de frais de gestion mais bruts de fiscalité."},{question:"Quelle est la fiscalité applicable aux revenus de SCPI ?",answer:"Les revenus de SCPI sont imposés à l'impôt sur le revenu selon votre TMI (11%, 30%, 41% ou 45%) plus les prélèvements sociaux de 17,2%. En assurance-vie, la fiscalité est différente avec possibilité d'abattement après 8 ans."},{question:"Peut-on perdre de l'argent avec les SCPI ?",answer:"Oui, le capital investi en SCPI n'est pas garanti. La valeur des parts peut baisser en cas de crise immobilière, et les dividendes peuvent diminuer si le taux d'occupation baisse. C'est pourquoi un horizon de placement long (8-10 ans minimum) est recommandé."}];return`
<section class="mb-16">
  <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">
    FAQ : vos questions sur ${t.mainKeyword}
  </h2>

  <div class="space-y-6">
    ${s.map(a=>`
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">
          ${a.question}
        </h3>
        <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
          ${a.answer}
        </p>
      </div>
    `).join(`
`)}
  </div>
</section>
`}function ue(){return`
<section class="mb-12">
  <div class="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-8 text-white">
    <h2 class="text-3xl font-bold mb-6 text-center">
      Passez à l'action : utilisez nos outils gratuits
    </h2>
    <p class="text-xl text-center mb-8 text-blue-100 max-w-3xl mx-auto">
      Vous avez maintenant toutes les clés pour faire les bons choix. Nos outils vous aident à concrétiser votre stratégie.
    </p>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div class="text-4xl mb-4">🔍</div>
        <h3 class="text-xl font-bold mb-3">Comparateur SCPI</h3>
        <p class="text-blue-100 mb-4">
          Comparez 63 SCPI : rendements, secteurs, zones géographiques, frais. Trouvez les SCPI adaptées à votre profil.
        </p>
        <button class="w-full px-6 py-3 bg-white text-blue-600 rounded-lg font-bold hover:bg-blue-50 transition-all">
          Accéder au comparateur
        </button>
      </div>

      <div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div class="text-4xl mb-4">💻</div>
        <h3 class="text-xl font-bold mb-3">Simulateur Fonds euros → SCPI</h3>
        <p class="text-blue-100 mb-4">
          Simulez l'impact d'un arbitrage de votre fonds euros vers des SCPI sur 10, 15 ou 20 ans.
        </p>
        <button class="w-full px-6 py-3 bg-white text-blue-600 rounded-lg font-bold hover:bg-blue-50 transition-all">
          Lancer une simulation
        </button>
      </div>

      <div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div class="text-4xl mb-4">👨‍💼</div>
        <h3 class="text-xl font-bold mb-3">Rendez-vous avec un CGP</h3>
        <p class="text-blue-100 mb-4">
          Échangez gratuitement 30 minutes en visio avec un conseiller spécialisé SCPI pour un diagnostic personnalisé.
        </p>
        <button class="w-full px-6 py-3 bg-white text-blue-600 rounded-lg font-bold hover:bg-blue-50 transition-all">
          Prendre rendez-vous
        </button>
      </div>
    </div>
  </div>
</section>

<div class="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 border border-gray-300 dark:border-gray-700">
  <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
    <strong>Important :</strong> Les SCPI sont des placements à long terme dont le capital n'est pas garanti. Les performances passées ne préjugent pas des performances futures. Les informations présentées dans cet article sont fournies à titre pédagogique et ne constituent pas un conseil en investissement personnalisé. Consultez un professionnel pour une recommandation adaptée à votre situation.
  </p>
</div>
`}function ge(t){return t.replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim().split(" ").length}const fe=({onNavigateHome:t,onNavigateToFaq:s,onNavigateToAbout:a,onNavigateToUnderstanding:u,onContactClick:x,onSimulateurClick:C,onComparateurClick:S,onAnalyseActuClick:j})=>{const[o,I]=d.useState(null),[c,P]=d.useState(""),[m,p]=d.useState(!1),[v,h]=d.useState(!1),[f,N]=d.useState(new Set),[$,q]=d.useState(!1),M=async r=>{const n=b(r);if(n){p(!0),I(r);try{await new Promise(i=>setTimeout(i,1e3));const l=w(n);P(l.html),q(!0)}catch(l){console.error("Erreur génération article:",l),alert("Erreur lors de la génération de l'article")}finally{p(!1)}}},z=async()=>{if(!o||!c)return;if(!y){alert("Supabase non configuré. Impossible de sauvegarder.");return}const r=b(o);if(r){h(!0);try{const n=w(r),{error:l}=await y.from("articles_generated").upsert({article_id:r.id,slug:r.slug,title:r.title,meta_description:r.metaDescription,keywords:r.keywords,category:r.category,content:n.html,word_count:n.wordCount,read_time:n.readTime,main_keyword:r.mainKeyword,search_intent:r.searchIntent,target_audience:r.targetAudience,featured:r.featured||!1,status:"draft",published_at:null,generated_at:new Date().toISOString()},{onConflict:"article_id"});if(l)throw l;N(i=>new Set(i).add(r.id)),alert(`Article "${r.title}" sauvegardé avec succès !`)}catch(n){console.error("Erreur sauvegarde Supabase:",n),alert("Erreur lors de la sauvegarde de l'article")}finally{h(!1)}}},A=()=>{if(!c||!o)return;const r=b(o);if(!r)return;const n=new Blob([c],{type:"text/html"}),l=URL.createObjectURL(n),i=document.createElement("a");i.href=l,i.download=`${r.slug}.html`,document.body.appendChild(i),i.click(),document.body.removeChild(i),URL.revokeObjectURL(l)},R=r=>({comparatifs:"blue",fiscalite:"green",strategies:"orange",marche:"purple",guides:"cyan"})[r]||"gray";return e.jsxs("div",{className:"min-h-screen bg-gray-50 dark:bg-gray-900",children:[e.jsx(T,{title:"Générateur d'Articles SEO - MaximusSCPI Admin",description:"Interface de génération automatique des 30 articles SEO MaximusSCPI",keywords:"générateur, articles, SEO, admin",canonical:"https://maximusscpi.com/admin/article-generator/"}),e.jsx(E,{isDarkMode:!1,toggleTheme:()=>{},onContactClick:x,onAboutClick:a,onEducationClick:()=>{},onLogoClick:t,onScpiPageClick:()=>{},onFaqClick:s,onUnderstandingClick:u,onAboutSectionClick:a,onComparateurClick:S,onSimulateurClick:C,onAnalyseActuClick:j}),e.jsxs("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12",children:[e.jsxs("div",{className:"mb-12 text-center",children:[e.jsx("div",{className:"inline-block px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded-full text-sm font-semibold mb-4",children:"🤖 Générateur Automatique"}),e.jsx("h1",{className:"text-4xl font-black text-gray-900 dark:text-white mb-4",children:"Générateur d'Articles SEO"}),e.jsx("p",{className:"text-xl text-gray-600 dark:text-gray-400",children:"Générez les 30 articles SEO MaximusSCPI en un clic"})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-4 gap-6 mb-12",children:[e.jsxs("div",{className:"bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg",children:[e.jsx("div",{className:"text-3xl font-bold text-blue-600",children:g.length}),e.jsx("div",{className:"text-sm text-gray-600 dark:text-gray-400",children:"Articles configurés"})]}),e.jsxs("div",{className:"bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg",children:[e.jsx("div",{className:"text-3xl font-bold text-green-600",children:f.size}),e.jsx("div",{className:"text-sm text-gray-600 dark:text-gray-400",children:"Articles sauvegardés"})]}),e.jsxs("div",{className:"bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg",children:[e.jsx("div",{className:"text-3xl font-bold text-orange-600",children:g.filter(r=>r.featured).length}),e.jsx("div",{className:"text-sm text-gray-600 dark:text-gray-400",children:"Articles piliers"})]}),e.jsxs("div",{className:"bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg",children:[e.jsx("div",{className:"text-3xl font-bold text-purple-600",children:g.reduce((r,n)=>r+n.wordCountTarget,0).toLocaleString()}),e.jsx("div",{className:"text-sm text-gray-600 dark:text-gray-400",children:"Mots au total"})]})]}),e.jsx("div",{className:"grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12",children:g.map(r=>{const n=R(r.category),l=f.has(r.id),i=o===r.id;return e.jsxs("div",{className:`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-2 transition-all ${i?"border-blue-500 ring-4 ring-blue-200":"border-gray-200 dark:border-gray-700 hover:border-blue-300"}`,children:[e.jsxs("div",{className:"flex items-start justify-between mb-4",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:`w-12 h-12 rounded-full bg-${n}-100 dark:bg-${n}-900/30 flex items-center justify-center`,children:e.jsx("span",{className:"text-2xl font-bold text-${color}-600",children:r.id})}),e.jsxs("div",{children:[e.jsx("div",{className:`text-xs font-semibold text-${n}-600 uppercase`,children:r.category}),r.featured&&e.jsx("span",{className:"inline-block px-2 py-1 bg-orange-100 text-orange-600 text-xs font-bold rounded mt-1",children:"⭐ PILIER"})]})]}),l&&e.jsxs("div",{className:"flex items-center gap-1 text-green-600 text-sm font-semibold",children:[e.jsx(k,{className:"w-4 h-4"}),"Sauvegardé"]})]}),e.jsx("h3",{className:"text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2",children:r.title}),e.jsxs("div",{className:"flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4",children:[e.jsxs("span",{className:"flex items-center gap-1",children:[e.jsx(F,{className:"w-4 h-4"}),r.wordCountTarget.toLocaleString()," mots"]}),e.jsxs("span",{className:"flex items-center gap-1",children:[e.jsx(_,{className:"w-4 h-4"}),Math.ceil(r.wordCountTarget/200)," min"]})]}),e.jsxs("div",{className:"mb-4",children:[e.jsx("div",{className:"text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1",children:"Mot-clé principal"}),e.jsx("div",{className:"text-sm text-blue-600 dark:text-blue-400 font-medium",children:r.mainKeyword})]}),e.jsx("button",{onClick:()=>M(r.id),disabled:m&&o===r.id,className:"w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2",children:m&&o===r.id?e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"}),"Génération..."]}):e.jsxs(e.Fragment,{children:[e.jsx(H,{className:"w-5 h-5"}),"Générer l'article"]})})]},r.id)})}),$&&c&&e.jsxs("div",{className:"bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700",children:[e.jsxs("div",{className:"flex items-center justify-between mb-6",children:[e.jsxs("h2",{className:"text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2",children:[e.jsx(V,{className:"w-6 h-6"}),"Prévisualisation de l'article"]}),e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsxs("button",{onClick:A,className:"px-4 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-all flex items-center gap-2",children:[e.jsx(D,{className:"w-4 h-4"}),"Télécharger HTML"]}),e.jsx("button",{onClick:z,disabled:v,className:"px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 transition-all flex items-center gap-2",children:v?e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"}),"Sauvegarde..."]}):e.jsxs(e.Fragment,{children:[e.jsx(k,{className:"w-4 h-4"}),"Sauvegarder dans Supabase"]})})]})]}),e.jsx("div",{className:"prose prose-lg max-w-none dark:prose-invert",dangerouslySetInnerHTML:{__html:c}})]})]}),e.jsx(G,{}),e.jsx(O,{})]})};export{fe as default};
