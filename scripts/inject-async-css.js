import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const indexPath = resolve('dist/index.html');
let html = readFileSync(indexPath, 'utf-8');

// Conserver le CSS Vite en chargement normal (render-blocking).
// Le fichier CSS principal est petit ; le charger en async provoquait un flash de contenu
// non stylé / intermédiaire avant l'affichage final.
const bootGate = `
    <!-- First-paint gate: masque le shell statique uniquement lorsque JavaScript démarre -->
    <style id="maximus-first-paint-gate">
      html.app-booting, html.app-booting body { background: #0f172a; }
      html.app-booting #root { visibility: hidden; }
    </style>
    <script>
      (function () {
        document.documentElement.classList.add('app-booting');
      })();
    </script>`;

if (!html.includes('maximus-first-paint-gate')) {
  html = html.replace('</head>', `${bootGate}\n  </head>`);
}

writeFileSync(indexPath, html);
console.log('✅ CSS kept synchronous and first-paint gate injected');
