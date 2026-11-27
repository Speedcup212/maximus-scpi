# Générateur vidéo SCPI — prototype libre et local

Génère un MP4 vertical 720×1280, 18 secondes, à partir d'un JSON explicitement validé. Aucune API, aucun service payant, aucune donnée SCPI inventée par le programme.

## Installation (Linux)
```bash
sudo apt-get install -y ffmpeg fonts-dejavu-core
python3 -m venv .venv
. .venv/bin/activate
pip install -r tools/scpi-video/requirements.txt
python tools/scpi-video/generate.py tools/scpi-video/example.json --output /tmp/demo-scpi.mp4
```

**Attention :** example.json contient des valeurs fictives. Ne jamais publier la vidéo de démonstration.

## Voix off gratuite (facultative)
Utiliser Piper TTS en local pour créer une narration WAV avec une voix française dont la licence autorise l'utilisation commerciale, puis passer `--voice narration.wav`. Sans voix, le générateur produit une vidéo silencieuse. La synchronisation automatique de la narration et les sous-titres ne sont pas encore implémentés.

## Contrôle éditorial obligatoire
Remplacer le JSON fictif par un bulletin officiel identifié, vérifier date, unités, pages et valeur. Ne pas assimiler un taux de distribution à un rendement garanti. Validation CIF avant publication. Les vidéos ne doivent pas être publiées automatiquement.

## Statut
Prototype initial non connecté à Supabase et non déployé. Aucune programmation de publication sociale.
