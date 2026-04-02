# 🎭 English Pronunciation Adventure

An interactive educational web game that helps learners master English pronunciation rules through a fantasy adventure story.

**🌐 Play Now:** [https://potterlam.github.io/English-Pronunciation-Adventure/](https://potterlam.github.io/English-Pronunciation-Adventure/)

## ✨ Features

- 🎮 **Two Practice Modes** — Past tense -ed (/t/, /d/, /ɪd/) and suffix -s / -es / -ies
- 🧚 **Fairy Rules Tutorial** — Animated fairy teaches voiced vs. voiceless sounds before gameplay
- 📖 **Story-driven Adventure** — 4-scene intro with character art and narrative cutscenes
- ⚔️ **4 Unique Games** — Word Puzzle, Sword Slash, Multiple Choice, Boss Fight
- 🏆 **Artifact Collection** — Earn three legendary artifacts across your journey
- 🌐 **Bilingual** — Full zh-TW / English support with one-click toggle
- 🎵 **Audio & TTS** — BGM, sound effects, and text-to-speech pronunciation
- ⚙️ **Settings Panel** — Adjustable BGM and SFX volume sliders
- 📱 **Responsive** — Works on desktop, tablet, and mobile

## 🎮 Game Modes

### Past Tense -ed
Learn to classify past-tense verbs by their ending sound:
| Sound | Rule | Examples |
|-------|------|----------|
| /t/   | After voiceless sounds (p, k, f, s, sh, ch) | stopped, walked, washed |
| /d/   | After voiced sounds or vowels (b, g, v, l, n, r…) | played, called, loved |
| /ɪd/  | After /t/ or /d/ endings | wanted, needed, landed |

### Suffix -s / -es / -ies
Learn plural and third-person verb endings:
| Rule | When | Examples |
|------|------|----------|
| -s   | Most words | cats, plays, books |
| -es  | After s, sh, ch, x, z | dishes, watches, boxes |
| -ies | Consonant + y → drop y, add -ies | study→studies, baby→babies |

## 🗂 Project Structure

```
├── index.html              # Main game page
├── css/
│   └── style.css           # All styles (responsive)
├── js/
│   ├── app.js              # Game state & bootstrap
│   ├── audio.js            # AudioManager (BGM, SFX, TTS)
│   ├── screens.js          # ScreenManager & cutscene overlay
│   ├── translations.js     # zh-TW / English translations
│   ├── game-system.js      # Central orchestrator
│   └── games/
│       ├── word-puzzle.js   # 📰 Newspaper-style unscramble & classify
│       ├── sword-slash.js   # ⚔️ Slash falling words with correct sword
│       ├── multiple-choice.js # 🎵 Listen & choose pronunciation
│       └── boss-fight.js   # 👑 Shoot word bubbles to defeat the boss
├── data/
│   └── words.js            # Word database (pastTense & extension)
└── assets/
    ├── images/             # Character sprites, backgrounds, artifacts
    ├── audio/              # bgm.mp3, click.mp3, correct.mp3, wrong.mp3
    └── video/              # intro.mp4, ending.mp4
```

## 🚀 Getting Started

### Play Online
Visit [https://potterlam.github.io/English-Pronunciation-Adventure/](https://potterlam.github.io/English-Pronunciation-Adventure/)

### Run Locally
```bash
git clone https://github.com/potterlam/English-Pronunciation-Adventure.git
cd English-Pronunciation-Adventure
npx http-server -p 8080 -c-1
# Open http://localhost:8080
```

## 🎯 Learning Objectives

- Master the three -ed pronunciation patterns through gamified practice
- Understand voiced vs. voiceless sounds and their effect on pronunciation
- Learn -s / -es / -ies suffix rules for plurals and third-person verbs
- Build phonemic awareness through interactive listening and classification

## 🛠 Tech Stack

- **HTML5** — Semantic structure
- **CSS3** — Responsive design, animations, backdrop-filter effects
- **Vanilla JavaScript** — No frameworks, modular ES5 classes
- **Web Speech API** — Text-to-speech pronunciation
- **HTML5 Audio/Video** — BGM, SFX, intro/ending cinematics

## 🌍 Browser Support

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

## 👨‍💻 Developer

Developed by EdUHK students as part of an educational technology project.

## 📄 License

This project is for educational purposes only.

---

*Making English pronunciation learning fun!* 🎯
