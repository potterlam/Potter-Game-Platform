/**
 * Game 1 – Word Puzzle (Newspaper-style)
 *
 * The player sees scrambled letters of a word and a clue (the base-form).
 * They unscramble the word, then classify its type.
 *
 * Mode-aware: reads window.gameState.practiceMode
 *   pastTense → types: t / d / id,  classify by -ed pronunciation
 *   extension → types: s / es / ies, classify by suffix rule
 */
class WordPuzzleGame {
    constructor(container) {
        this.container = container;
        this.puzzles = [];
        this.currentIndex = 0;
        this.score = 0;
        this.mode = window.gameState.practiceMode || 'pastTense';
        this.types = this.mode === 'pastTense' ? ['t','d','id'] : ['s','es','ies'];
        this.totalNeeded = 9; // 3 of each type
        this.solved = {};
        this.types.forEach(tp => this.solved[tp] = 0);
    }

    start() {
        this._generatePuzzles();
        this._render();
        this._showPuzzle();
    }

    /* ── data helpers ── */

    _generatePuzzles() {
        this.puzzles = [];
        const category = this.mode === 'pastTense' ? 'pastTense' : 'extension';
        this.types.forEach(type => {
            const words = window.WordDB.getRandom(category, type, 3);
            words.forEach(word => {
                this.puzzles.push({
                    word: word.toUpperCase(),
                    type,
                    category,
                    scrambled: this._scramble(word.toUpperCase()),
                    base: this.mode === 'pastTense'
                        ? window.WordDB.getBaseForm(word)
                        : window.WordDB.getExtBaseForm(word)
                });
            });
        });
        // shuffle
        this.puzzles.sort(() => Math.random() - 0.5);
    }

    _scramble(w) {
        const arr = w.split('');
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        // ensure it's actually different
        if (arr.join('') === w && w.length > 1) {
            [arr[0], arr[1]] = [arr[1], arr[0]];
        }
        return arr.join('');
    }

    _getClue(pastWord) {
        // Use the reliable lookup table from WordDB
        const mode = this.mode || 'pastTense';
        return mode === 'pastTense'
            ? window.WordDB.getBaseForm(pastWord)
            : window.WordDB.getExtBaseForm(pastWord);
    }

    /* ── render ── */

    _render() {
        const lang = window.gameState.currentLanguage;
        const isPT = this.mode === 'pastTense';

        // Build progress bars dynamically based on mode
        const progressItems = this.types.map(tp => {
            const label = isPT ? `/${tp}/` : `-${tp}`;
            const colorClass = isPT ? `${tp}-color` : `ext-${tp}-color`;
            const bgClass = isPT ? `${tp}-bg` : `ext-${tp}-bg`;
            const key = tp.toUpperCase();
            return `<div class="puzzle-progress-item ${colorClass}">
                <span>${label}</span>
                <div class="mini-bar"><div id="pzBar${key}" class="mini-fill ${bgClass}" style="width:0%"></div></div>
                <span id="pzCount${key}">0/3</span>
            </div>`;
        }).join('');

        // Build classify buttons dynamically
        const classifyBtns = this.types.map(tp => {
            const label = isPT ? `/${tp}/${tp === 'id' ? ' (ɪd)' : ''}` : `-${tp}`;
            const bgClass = isPT ? `${tp}-bg` : `ext-${tp}-bg`;
            return `<button class="classify-btn ${bgClass}" data-type="${tp}">${label}</button>`;
        }).join('');

        const classifyPrompt = isPT
            ? (lang === 'zh' ? '這個字的 -ed 發音是？' : 'What is the -ed pronunciation?')
            : (lang === 'zh' ? '這個字用了哪個規則？' : 'Which suffix rule does this word use?');

        this.container.innerHTML = `
        <div class="puzzle-screen">
            <div class="newspaper-header">
                <div class="newspaper-title">📰 THE DAILY WORD</div>
                <div class="newspaper-subtitle">${isPT
                    ? (lang === 'zh' ? '過去式 -ed 謎題版' : 'Past Tense -ed Edition')
                    : (lang === 'zh' ? 's / es / ies 謎題版' : 's / es / ies Edition')}</div>
            </div>

            <div class="puzzle-progress-bar">
                ${progressItems}
            </div>

            <div class="puzzle-card" id="puzzleCard">
                <div class="puzzle-number" id="puzzleNumber">1 / ${this.puzzles.length}</div>
                <div class="puzzle-clue" id="puzzleClue"></div>
                <div class="scrambled-letters" id="scrambledLetters"></div>
                <div class="puzzle-input-row">
                    <input type="text" id="puzzleInput" class="puzzle-input" placeholder="${t('typeAnswer')}" autocomplete="off" spellcheck="false">
                    <button id="puzzleSpeakBtn" class="btn-icon" title="${t('pronounce')}">🔊</button>
                </div>
                <button id="puzzleCheckBtn" class="btn-primary">${t('checkAnswer')}</button>

                <div class="puzzle-classify hidden" id="classifySection">
                    <p id="classifyPrompt">${classifyPrompt}</p>
                    <div class="classify-btns">
                        ${classifyBtns}
                    </div>
                </div>

                <div class="puzzle-feedback hidden" id="puzzleFeedback"></div>
            </div>

            <div class="puzzle-footer">
                <button id="puzzleBackBtn" class="btn-secondary">${t('backToMenu')}</button>
            </div>
        </div>`;

        // events
        document.getElementById('puzzleCheckBtn').onclick = () => this._checkWord();
        document.getElementById('puzzleInput').addEventListener('keydown', e => {
            if (e.key === 'Enter') this._checkWord();
        });
        document.getElementById('puzzleSpeakBtn').onclick = () => {
            const p = this.puzzles[this.currentIndex];
            if (p) window.audioManager.speak(p.word.toLowerCase());
        };
        document.getElementById('puzzleBackBtn').onclick = () => window.gameSystem.showGameMenu();

        document.querySelectorAll('.classify-btn').forEach(btn => {
            btn.onclick = () => this._classify(btn.dataset.type);
        });
    }

    _showPuzzle() {
        if (this.currentIndex >= this.puzzles.length) {
            // regenerate if player hasn't completed all
            this._generatePuzzles();
            this.currentIndex = 0;
        }
        const p = this.puzzles[this.currentIndex];
        const lang = window.gameState.currentLanguage;

        document.getElementById('puzzleNumber').textContent =
            `${this.currentIndex + 1} / ${this.puzzles.length}`;
        document.getElementById('puzzleClue').textContent =
            `${lang === 'zh' ? '線索' : 'Clue'}: ${p.base}  →  ______`;

        // Render scrambled letters as clickable tiles
        const container = document.getElementById('scrambledLetters');
        container.innerHTML = '';
        p.scrambled.split('').forEach((ch, i) => {
            const tile = document.createElement('span');
            tile.className = 'letter-tile';
            tile.textContent = ch;
            tile.onclick = () => {
                const input = document.getElementById('puzzleInput');
                input.value += ch;
                tile.classList.add('used');
                tile.style.pointerEvents = 'none';
            };
            container.appendChild(tile);
        });

        document.getElementById('puzzleInput').value = '';
        document.getElementById('puzzleInput').focus();
        document.getElementById('classifySection').classList.add('hidden');
        document.getElementById('puzzleFeedback').classList.add('hidden');
        document.getElementById('puzzleCheckBtn').classList.remove('hidden');
    }

    _checkWord() {
        const p = this.puzzles[this.currentIndex];
        const answer = document.getElementById('puzzleInput').value.trim().toUpperCase();

        if (answer === p.word) {
            // correct unscramble → now classify
            document.getElementById('puzzleCheckBtn').classList.add('hidden');
            document.getElementById('classifySection').classList.remove('hidden');
            window.audioManager.playClick();
        } else {
            this._showFeedback(false, window.gameState.currentLanguage === 'zh'
                ? '拼寫不正確，再試一次！' : 'Incorrect spelling, try again!');
            window.audioManager.playWrong();
            // reset letter tiles
            document.querySelectorAll('.letter-tile').forEach(tile => {
                tile.classList.remove('used');
                tile.style.pointerEvents = '';
            });
            document.getElementById('puzzleInput').value = '';
        }
    }

    _classify(chosenType) {
        const p = this.puzzles[this.currentIndex];
        const isPT = this.mode === 'pastTense';
        if (chosenType === p.type) {
            this.solved[p.type]++;
            this.score += 10;
            this._updateProgress();
            const label = isPT ? `/${p.type}/${p.type === 'id' ? ' (ɪd)' : ''}` : `-${p.type}`;
            this._showFeedback(true, `${t('correct')} ${p.word.toLowerCase()} → ${label}`);
            window.audioManager.playCorrect();

            // Check win condition: 3 of each type
            const allDone = this.types.every(tp => this.solved[tp] >= 3);
            if (allDone) {
                setTimeout(() => {
                    const msg = isPT
                        ? (window.gameState.currentLanguage === 'zh' ? '🎉 文字橋修復完成！' : '🎉 Word bridge repaired!')
                        : (window.gameState.currentLanguage === 'zh' ? '🎉 字尾挑戰完成！' : '🎉 Suffix challenge complete!');
                    window.gameSystem.showMessage(msg, 'success', 3000);
                    window.gameSystem.completeGame('wordPuzzle');
                }, 1200);
                return;
            }

            this.currentIndex++;
            setTimeout(() => this._showPuzzle(), 1500);
        } else {
            const label = isPT ? `/${p.type}/` : `-${p.type}`;
            this._showFeedback(false, `${t('wrong')} ${p.word.toLowerCase()} → ${label}`);
            window.audioManager.playWrong();
        }
    }

    _updateProgress() {
        this.types.forEach(type => {
            const key = type.toUpperCase();
            const bar = document.getElementById('pzBar' + key);
            const cnt = document.getElementById('pzCount' + key);
            if (bar) bar.style.width = `${(this.solved[type] / 3) * 100}%`;
            if (cnt) cnt.textContent = `${this.solved[type]}/3`;
        });
    }

    _showFeedback(success, msg) {
        const fb = document.getElementById('puzzleFeedback');
        fb.textContent = msg;
        fb.className = `puzzle-feedback ${success ? 'fb-success' : 'fb-error'}`;
    }
}

window.WordPuzzleGame = WordPuzzleGame;
