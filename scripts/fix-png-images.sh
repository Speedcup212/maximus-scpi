#!/bin/bash

# Script pour remplacer TOUS les PNG par des WebP optimisés

echo "🔧 Remplacement des PNG par WebP dans tous les composants..."

# Remplacer Eric Bellaiche
find src/components -name "*.tsx" -type f -exec sed -i 's|"/Eric Bellaiche 1000x1000 copy\.png"|"/images/eric-96.webp"|g' {} \;
find src/components -name "*.tsx" -type f -exec sed -i "s|'/Eric Bellaiche 1000x1000 copy\.png'|'/images/eric-96.webp'|g" {} \;

# Remplacer Logo canva
find src/components -name "*.tsx" -type f -exec sed -i 's|"/Logo canva 2 maximusscpi\.png"|"/images/logo-96.webp"|g' {} \;
find src/components -name "*.tsx" -type f -exec sed -i "s|'/Logo canva 2 maximusscpi\.png'|'/images/logo-96.webp'|g" {} \;
find src/components -name "*.tsx" -type f -exec sed -i 's|"/logo maximus Canva\.png"|"/images/logo-96.webp"|g' {} \;
find src/components -name "*.tsx" -type f -exec sed -i "s|'/logo maximus Canva\.png'|'/images/logo-96.webp'|g" {} \;

# Remplacer image.png
find src/components -name "*.tsx" -type f -exec sed -i 's|"/image\.png"|"/images/logo-96.webp"|g' {} \;
find src/components -name "*.tsx" -type f -exec sed -i "s|'/image\.png'|'/images/logo-96.webp'|g" {} \;

echo "✅ Tous les PNG remplacés par WebP"
echo ""
echo "🔍 Vérification des PNG restants..."
grep -r "\.png" src/components/*.tsx | grep -E "(Eric|Logo|image)" || echo "✅ Aucun PNG trouvé"
