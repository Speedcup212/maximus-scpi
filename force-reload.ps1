# Force Reload Script for Windows PowerShell
# Usage: .\force-reload.ps1

Write-Host "🔄 Force Reload - Nettoyage complet du cache..." -ForegroundColor Cyan
Write-Host ""

# 1. Supprimer le cache Vite
if (Test-Path "node_modules\.vite") {
    Write-Host "🗑️  Suppression du cache Vite..." -ForegroundColor Yellow
    Remove-Item -Path "node_modules\.vite" -Recurse -Force
    Write-Host "✅ Cache Vite supprimé" -ForegroundColor Green
    Write-Host ""
}

# 2. Supprimer le dossier dist
if (Test-Path "dist") {
    Write-Host "🗑️  Suppression du dossier dist..." -ForegroundColor Yellow
    Remove-Item -Path "dist" -Recurse -Force
    Write-Host "✅ Dossier dist supprimé" -ForegroundColor Green
    Write-Host ""
}

# 3. Créer un timestamp de rechargement
Write-Host "📝 Création d'un timestamp de rechargement..." -ForegroundColor Yellow
$timestamp = [Math]::Floor([decimal](Get-Date(Get-Date).ToUniversalTime()-uformat "%s"))
$timestamp | Out-File -FilePath "src\.reload-timestamp" -Encoding UTF8
Write-Host "✅ Timestamp créé: $timestamp" -ForegroundColor Green
Write-Host ""

# 4. Toucher les fichiers modifiés pour forcer HMR
Write-Host "🔨 Forçage du rechargement des composants..." -ForegroundColor Yellow
(Get-Item "src\components\PortfolioSummary.tsx").LastWriteTime = Get-Date
(Get-Item "src\components\UnifiedPortfolio.tsx").LastWriteTime = Get-Date
Write-Host "✅ Composants touchés" -ForegroundColor Green
Write-Host ""

# 5. Rebuild le projet
Write-Host "🔨 Reconstruction du projet..." -ForegroundColor Yellow
Write-Host ""
npm run build

Write-Host ""
Write-Host "✅ Rechargement forcé terminé avec succès!" -ForegroundColor Green
Write-Host ""
Write-Host "📌 Actions à faire manuellement:" -ForegroundColor Cyan
Write-Host "   1. Ouvrez votre navigateur" -ForegroundColor White
Write-Host "   2. Appuyez sur Ctrl+Shift+R ou Ctrl+F5" -ForegroundColor White
Write-Host "   3. Ou ouvrez DevTools > Network > Cochez 'Disable cache'" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Le serveur de dev devrait maintenant servir la nouvelle version!" -ForegroundColor Green
Write-Host ""
