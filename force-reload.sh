#!/bin/bash

echo "🔄 Force Reload - Nettoyage complet du cache..."
echo ""

# 1. Supprimer le cache Vite
if [ -d "node_modules/.vite" ]; then
  echo "🗑️  Suppression du cache Vite..."
  rm -rf node_modules/.vite
  echo "✅ Cache Vite supprimé"
  echo ""
fi

# 2. Supprimer le dossier dist
if [ -d "dist" ]; then
  echo "🗑️  Suppression du dossier dist..."
  rm -rf dist
  echo "✅ Dossier dist supprimé"
  echo ""
fi

# 3. Créer un timestamp de rechargement
echo "📝 Création d'un timestamp de rechargement..."
TIMESTAMP=$(date +%s)
echo "$TIMESTAMP" > src/.reload-timestamp
echo "✅ Timestamp créé: $TIMESTAMP"
echo ""

# 4. Toucher les fichiers modifiés pour forcer HMR
echo "🔨 Forçage du rechargement des composants..."
touch src/components/PortfolioSummary.tsx
touch src/components/UnifiedPortfolio.tsx
echo "✅ Composants touchés"
echo ""

# 5. Rebuild le projet
echo "🔨 Reconstruction du projet..."
echo ""
npm run build

echo ""
echo "✅ Rechargement forcé terminé avec succès!"
echo ""
echo "📌 Actions à faire manuellement:"
echo "   1. Ouvrez votre navigateur"
echo "   2. Appuyez sur Ctrl+Shift+R (Windows/Linux) ou Cmd+Shift+R (Mac)"
echo "   3. Ou ouvrez DevTools > Network > Cochez 'Disable cache'"
echo ""
echo "🚀 Le serveur de dev devrait maintenant servir la nouvelle version!"
echo ""
