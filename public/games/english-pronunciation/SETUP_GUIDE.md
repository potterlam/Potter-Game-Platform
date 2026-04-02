# Setup Guide

Follow these steps to set up the project locally.

## Prerequisites

- A modern web browser (Chrome 70+, Firefox 65+, Safari 12+, Edge 79+)
- A local HTTP server (Node.js `http-server`, Python `http.server`, or VS Code Live Server)

## Project Structure

Ensure all files are in place:

### assets/images/
- player-sprite.png
- warrior-sprite.png
- wizard-sprite.png
- pronunciation-king.png
- hero-final.png
- player-hypnotized.png
- cave-background.jpg
- cliff-background.jpg
- wizard-lair.jpg
- boss-arena.jpg
- artifact-time-controller.png
- artifact-knowledge-gem.png
- artifact-explorers-eye.png
- all-artifacts-ready.png

### assets/audio/
- bgm.mp3 (background music)
- click.mp3 (click sound effect)
- correct.mp3 (correct answer sound)
- wrong.mp3 (wrong answer sound)

### assets/video/
- intro.mp4 (opening cinematic)
- ending.mp4 (ending cinematic)

### js/
- app.js (game state & bootstrap)
- audio.js (AudioManager class)
- screens.js (ScreenManager class)
- translations.js (zh-TW / English translations)
- game-system.js (central orchestrator)
- games/word-puzzle.js
- games/sword-slash.js
- games/multiple-choice.js
- games/boss-fight.js

### data/
- words.js (word database for pastTense & extension modes)

### css/
- style.css

## Running Locally

### Option 1: Node.js http-server
```bash
npx http-server -p 8080 -c-1
```
Then open http://localhost:8080

### Option 2: Python
```bash
python -m http.server 8080
```
Then open http://localhost:8080

### Option 3: VS Code Live Server
Install the "Live Server" extension and click "Go Live" in the status bar.

## Notes

1. File names are case-sensitive — ensure exact matches
2. The game must be served via HTTP (not `file://`) for audio and TTS to work
3. TTS uses the browser's Web Speech API — pronunciation may vary by browser/OS
4. Default volumes: BGM 3%, SFX 15% (adjustable via Settings panel)
