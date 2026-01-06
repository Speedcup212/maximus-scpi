═══════════════════════════════════════════════════════════════
    SCRIPT DE RECHARGEMENT FORCÉ - MODE D'EMPLOI RAPIDE
═══════════════════════════════════════════════════════════════

🎯 PROBLÈME :
   Le navigateur affiche l'ancienne version après vos modifications

✅ SOLUTION :

   1️⃣  Dans le terminal :
       npm run force-reload

   2️⃣  Dans le navigateur :
       Windows/Linux : Ctrl + Shift + R
       Mac          : Cmd + Shift + R

═══════════════════════════════════════════════════════════════

📁 FICHIERS DISPONIBLES :

   • npm run force-reload    → Méthode recommandée (cross-platform)
   • ./force-reload.sh       → Script Bash (Linux/Mac)
   • .\force-reload.ps1      → Script PowerShell (Windows)

═══════════════════════════════════════════════════════════════

🔧 CE QUE FAIT LE SCRIPT :

   ✓ Supprime le cache Vite (node_modules/.vite)
   ✓ Supprime le dossier dist
   ✓ Crée un timestamp de rechargement
   ✓ Touche les fichiers modifiés
   ✓ Reconstruit le projet (npm run build)

═══════════════════════════════════════════════════════════════

📖 DOCUMENTATION COMPLÈTE :

   • UTILISATION_FORCE_RELOAD.md  → Guide d'utilisation complet
   • FORCE_RELOAD_GUIDE.md        → Guide technique détaillé
   • TEST_DIVERSIFICATION.md      → Test des modifications

═══════════════════════════════════════════════════════════════

✨ MODIFICATIONS ACTUELLES :

   Widget Diversification dans PortfolioSummary.tsx

   AVANT :                    APRÈS :
   ┌─────────────┐           ┌──────────────────────┐
   │      3      │           │ [Secteurs] [Zones]   │
   │  Secteurs   │           │         7            │
   │ 2 zones géo │           │ Secteurs distincts   │
   └─────────────┘           └──────────────────────┘

   ✓ Onglets cliquables
   ✓ Calcul précis et pondéré
   ✓ Design cohérent

═══════════════════════════════════════════════════════════════

🐛 PROBLÈME PERSISTANT ?

   1. Fermez complètement le navigateur et relancez-le
   2. Testez en mode incognito (Ctrl + Shift + N)
   3. Videz le cache : chrome://settings/clearBrowserData
   4. Testez dans un autre navigateur

═══════════════════════════════════════════════════════════════

💡 ASTUCE :

   Si le serveur de dev tourne déjà, il détectera automatiquement
   les changements après le rebuild. Sinon :

   npm run dev

═══════════════════════════════════════════════════════════════
