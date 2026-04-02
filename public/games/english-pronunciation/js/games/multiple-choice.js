/**
 * Game 3 – Multiple Choice with Sound Hints
 *
 * A word is displayed. The player can press the 🔊 button to hear
 * the TTS pronunciation.  They choose /t/, /d/, or /ɪd/.
 * A hit-effect animation plays on correct answers.
 * Need 5 consecutive correct to win this chapter.
 *
 * Also includes s/es/ies extension questions (bonus).
 */
class MultipleChoiceGame {
    constructor(container) {
        this.container = container;
        this.questions = [];
        this.currentIdx = 0;
        this.streak = 0;
        this.needStreak = 5;
        this.totalAnswered = 0;
        this.mode = window.gameState.practiceMode || 'pastTense';
        this.types = this.mode === 'pastTense' ? ['t','d','id'] : ['s','es','ies'];
    }

    start() {
        this._generate();
        this._render();
        this._showQuestion();
    }

    _generate() {
        this.questions = [];
        const category = this.mode === 'pastTense' ? 'pastTense' : 'extension';
        this.types.forEach(type => {
            window.WordDB.getRandom(category, type, 7).forEach(word => {
                this.questions.push({ word, type, category });
            });
        });
        this.questions.sort(() => Math.random() - 0.5);
    }

    /* ── render ── */

    _render() {
        const lang = window.gameState.currentLanguage;
        const isPT = this.mode === 'pastTense';

        const optionBtns = isPT
            ? `<button class="mc-opt t-opt" data-ans="t">🔵 /t/</button>
               <button class="mc-opt d-opt" data-ans="d">🔴 /d/</button>
               <button class="mc-opt id-opt" data-ans="id">🟢 /ɪd/</button>`
            : `<button class="mc-opt s-opt" data-ans="s">📘 -s</button>
               <button class="mc-opt es-opt" data-ans="es">📗 -es</button>
               <button class="mc-opt ies-opt" data-ans="ies">📕 -ies</button>`;

        this.container.innerHTML = `
        <div class="mc-screen">
            <h1 class="mc-title">${isPT
                ? (lang === 'zh' ? '🎵 過去式發音選擇題' : '🎵 Past Tense Sound Quiz')
                : (lang === 'zh' ? '🎵 字尾規則選擇題' : '🎵 Suffix Rule Quiz')}</h1>

            <div class="mc-hud">
                <div class="mc-hud-item">
                    <span class="hud-label">${t('streak')}</span>
                    <span id="mcStreak" class="hud-value streak-val">0</span>
                    <span class="streak-goal">/ ${this.needStreak}</span>
                </div>
                <div class="mc-hud-item">
                    <span class="hud-label">${lang === 'zh' ? '題目' : 'Q'}</span>
                    <span id="mcTotal" class="hud-value">0</span>
                </div>
            </div>

            <div class="mc-card" id="mcCard">
                <img src="assets/images/player-hypnotized.png" class="mc-wizard-img" alt="Wizard">
                <div id="mcCategoryTag" class="mc-category-tag"></div>
                <div id="mcWord" class="mc-word">WORD</div>
                <button id="mcSpeakBtn" class="btn-speak">🔊 ${lang === 'zh' ? '發音提示' : 'Sound Hint'}</button>

                <div class="mc-options" id="mcOptions">
                    ${optionBtns}
                </div>

                <div id="mcFeedback" class="mc-feedback hidden"></div>
            </div>

            <!-- hit effect overlay -->
            <div id="hitOverlay" class="hit-overlay hidden">
                <div class="hit-explosion">💥</div>
                <div class="hit-text" id="hitText">PERFECT!</div>
            </div>

            <div class="mc-footer">
                <button id="mcBackBtn" class="btn-secondary">${t('backToMenu')}</button>
            </div>
        </div>`;

        document.getElementById('mcSpeakBtn').onclick = () => {
            const q = this.questions[this.currentIdx];
            if (q) window.audioManager.speak(q.word);
        };

        document.querySelectorAll('.mc-opt').forEach(btn => {
            btn.onclick = () => this._answer(btn.dataset.ans);
        });

        document.getElementById('mcBackBtn').onclick = () => window.gameSystem.showGameMenu();
    }

    _showQuestion() {
        if (this.streak >= this.needStreak) {
            this._win();
            return;
        }
        // loop questions if exhausted
        if (this.currentIdx >= this.questions.length) {
            this._generate();
            this.currentIdx = 0;
        }

        const q = this.questions[this.currentIdx];
        document.getElementById('mcWord').textContent = q.word.toUpperCase();
        document.getElementById('mcTotal').textContent = this.totalAnswered;
        document.getElementById('mcStreak').textContent = this.streak;

        // Category tag
        const tag = document.getElementById('mcCategoryTag');
        const isPT = this.mode === 'pastTense';
        if (isPT) {
            tag.textContent = window.gameState.currentLanguage === 'zh' ? '過去式 -ed' : 'Past Tense -ed';
            tag.className = 'mc-category-tag tag-pt';
        } else {
            tag.textContent = window.gameState.currentLanguage === 'zh' ? 's / es / ies 規則' : 's / es / ies Rules';
            tag.className = 'mc-category-tag tag-ext';
        }

        // reset buttons
        document.querySelectorAll('.mc-opt').forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('opt-correct','opt-wrong');
        });
        document.getElementById('mcFeedback').classList.add('hidden');

        // Visual hypnotize effect until streak reaches goal
        const card = document.getElementById('mcCard');
        if (this.streak < this.needStreak) {
            card.classList.add('mc-hypnotized');
        } else {
            card.classList.remove('mc-hypnotized');
        }
    }

    _answer(ans) {
        const q = this.questions[this.currentIdx];
        const correct = ans === q.type;

        // Disable all buttons
        document.querySelectorAll('.mc-opt').forEach(btn => {
            btn.disabled = true;
            if (btn.dataset.ans === q.type) btn.classList.add('opt-correct');
            if (btn.dataset.ans === ans && !correct) btn.classList.add('opt-wrong');
        });

        if (correct) {
            this.streak++;
            this._showHitEffect();
            window.audioManager.playCorrect();
            this._showFeedback(true, t('correct'));
        } else {
            this.streak = 0;
            window.audioManager.playWrong();
            const isPT = this.mode === 'pastTense';
            const label = isPT ? `/${q.type}/` : `-${q.type}`;
            const rule = window.WordDB.rules[q.type]?.[window.gameState.currentLanguage] || '';
            this._showFeedback(false, `${t('wrong')} → ${label}  ${rule}`);
        }

        this.totalAnswered++;
        this.currentIdx++;

        setTimeout(() => this._showQuestion(), correct ? 1500 : 3000);
    }

    _showFeedback(ok, msg) {
        const fb = document.getElementById('mcFeedback');
        fb.textContent = msg;
        fb.className = `mc-feedback ${ok ? 'fb-success' : 'fb-error'}`;
    }

    _showHitEffect() {
        const overlay = document.getElementById('hitOverlay');
        const hitText = document.getElementById('hitText');
        const streakLabels = ['NICE!', 'GREAT!', 'AWESOME!', 'AMAZING!', 'PERFECT! 🎉'];
        hitText.textContent = streakLabels[Math.min(this.streak - 1, streakLabels.length - 1)];
        overlay.classList.remove('hidden');
        overlay.classList.add('hit-animate');
        setTimeout(() => {
            overlay.classList.add('hidden');
            overlay.classList.remove('hit-animate');
        }, 800);
    }

    _win() {
        document.getElementById('mcCard').classList.remove('mc-hypnotized');
        const isPT = this.mode === 'pastTense';
        window.gameSystem.showMessage(
            window.gameState.currentLanguage === 'zh'
                ? (isPT
                    ? '🎉 連續答對5題！擊敗夢魘法師！探索者之眼獲得！'
                    : '🎉 連續答對5題！字尾規則大師！')
                : (isPT
                    ? '🎉 5 streak! Nightmare wizard defeated! Explorer\'s Eye obtained!'
                    : '🎉 5 streak! Suffix rule master!'),
            'success', 4000);
        window.gameSystem.completeGame('multipleChoice');
    }
}

window.MultipleChoiceGame = MultipleChoiceGame;
