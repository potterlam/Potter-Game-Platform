/**
 * Game 2 – Sword Slash  (Dropping Words)
 *
 * Words fall from the top of the screen.
 * Player uses LEFT / RIGHT arrow keys to move the hero.
 * Player uses UP arrow to slash.
 * Keys 1 / 2 / 3  (or J / K / L) switch the sword type:
 *   1 (J) = /t/   2 (K) = /d/   3 (L) = /ɪd/
 *
 * Slashing a word with the CORRECT sword = +20 pts.
 * Wrong sword or miss = lose a life.
 * Reach 200 pts to win.
 */
class SwordSlashGame {
    constructor(container) {
        this.container = container;
        this.playing = false;
        this.paused = false;
        this.score = 0;
        this.lives = 5;
        this.timeLeft = 90;
        this.mode = window.gameState.practiceMode || 'pastTense';
        this.types = this.mode === 'pastTense' ? ['t','d','id'] : ['s','es','ies'];
        this.currentSword = this.types[0];
        this.playerX = 50; // percentage
        this.words = [];
        this.rafId = null;
        this.spawnInterval = null;
        this.timerInterval = null;
        this.lastFrame = 0;
        this._keyHandler = null;
        this.areaWidth = 0;
        this.areaHeight = 0;
        this.slashing = false;
    }

    start() {
        this._render();
        this._bindKeys();
    }

    destroy() {
        this.playing = false;
        if (this._keyHandler) document.removeEventListener('keydown', this._keyHandler);
        cancelAnimationFrame(this.rafId);
        clearInterval(this.spawnInterval);
        clearInterval(this.timerInterval);
    }

    /* ── render ── */

    _render() {
        const lang = window.gameState.currentLanguage;
        const isPT = this.mode === 'pastTense';
        const swordLabels = isPT
            ? [{key:'t',icon:'🔵',label:'/t/'},{key:'d',icon:'🔴',label:'/d/'},{key:'id',icon:'🟢',label:'/ɪd/'}]
            : [{key:'s',icon:'📘',label:'-s'},{key:'es',icon:'📗',label:'-es'},{key:'ies',icon:'📕',label:'-ies'}];

        const swordBtns = swordLabels.map((sw, i) => {
            const active = i === 0 ? ' active' : '';
            return `<button class="sw-btn${active}" data-sw="${sw.key}" id="swBtn${sw.key.toUpperCase()}">
                        <span class="sw-icon">${sw.icon}</span> ${sw.label}
                    </button>`;
        }).join('');

        this.container.innerHTML = `
        <div class="sword-screen">
            <div class="sword-hud">
                <div class="hud-item"><span class="hud-label">${t('score')}</span><span id="ssScore" class="hud-value">0</span></div>
                <div class="hud-item"><span class="hud-label">${t('time')}</span><span id="ssTime" class="hud-value">90</span></div>
                <div class="hud-item"><span class="hud-label">${t('lives')}</span><span id="ssLives" class="hud-value">❤️❤️❤️❤️❤️</span></div>
            </div>

            <div class="sword-arena" id="swordArena">
                <div class="sword-player" id="swordPlayer">
                    <div class="sword-blade" id="swordBlade"></div>
                    <div class="player-body"><img src="assets/images/warrior-sprite.png" class="player-sprite-img" alt="Player"></div>
                </div>
                <div class="slash-fx hidden" id="slashFx">⚔️</div>
            </div>

            <div class="sword-weapon-bar">
                <div class="sw-label">${lang === 'zh' ? '選擇劍 (1/2/3 或 J/K/L)' : 'Choose Sword (1/2/3 or J/K/L)'}</div>
                <div class="sw-btns">
                    ${swordBtns}
                </div>
                <div class="sw-hint">${lang === 'zh' ? '← → 移動　↑ 斬擊' : '← → Move　↑ Slash'}</div>
            </div>

            <div class="sword-controls">
                <button id="ssStartBtn" class="btn-primary">${t('startBattle')}</button>
                <button id="ssPauseBtn" class="btn-secondary" disabled>${t('pause')}</button>
                <button id="ssBackBtn" class="btn-secondary">${t('backToMenu')}</button>
            </div>
        </div>`;

        // button events
        document.getElementById('ssStartBtn').onclick = () => this._startGame();
        document.getElementById('ssPauseBtn').onclick = () => this._togglePause();
        document.getElementById('ssBackBtn').onclick   = () => { this.destroy(); window.gameSystem.showGameMenu(); };

        document.querySelectorAll('.sw-btn').forEach(btn => {
            btn.onclick = () => this._switchSword(btn.dataset.sw);
        });

        const arena = document.getElementById('swordArena');
        this.areaWidth  = arena.offsetWidth  || 600;
        this.areaHeight = arena.offsetHeight || 500;
    }

    /* ── keyboard ── */

    _bindKeys() {
        this._keyHandler = (e) => {
            if (!this.playing || this.paused) return;
            const k = e.key;
            if (k === 'ArrowLeft')  { this.playerX = Math.max(5, this.playerX - 6); this._movePlayer(); e.preventDefault(); }
            if (k === 'ArrowRight') { this.playerX = Math.min(95, this.playerX + 6); this._movePlayer(); e.preventDefault(); }
            if (k === 'ArrowUp')    { this._slash(); e.preventDefault(); }
            if (k === '1' || k === 'j' || k === 'J') this._switchSword(this.types[0]);
            if (k === '2' || k === 'k' || k === 'K') this._switchSword(this.types[1]);
            if (k === '3' || k === 'l' || k === 'L') this._switchSword(this.types[2]);
        };
        document.addEventListener('keydown', this._keyHandler);
    }

    _movePlayer() {
        const p = document.getElementById('swordPlayer');
        if (p) p.style.left = this.playerX + '%';
    }

    _switchSword(type) {
        this.currentSword = type;
        document.querySelectorAll('.sw-btn').forEach(b => b.classList.remove('active'));
        const btn = document.getElementById('swBtn' + type.toUpperCase());
        if (btn) btn.classList.add('active');

        const blade = document.getElementById('swordBlade');
        blade.className = 'sword-blade sw-' + type;
        window.audioManager.playClick();
    }

    /* ── game loop ── */

    _startGame() {
        this.playing = true;
        this.paused = false;
        this.score = 0;
        this.lives = 5;
        this.timeLeft = 90;
        this.words = [];
        this.playerX = 50;
        this._movePlayer();

        document.getElementById('ssStartBtn').disabled = true;
        document.getElementById('ssPauseBtn').disabled = false;

        // clear arena words
        document.querySelectorAll('.falling-word').forEach(w => w.remove());

        this.lastFrame = performance.now();
        this.rafId = requestAnimationFrame((ts) => this._loop(ts));
        this.spawnInterval = setInterval(() => this._spawnWord(), 1200);
        this.timerInterval = setInterval(() => {
            if (!this.paused) {
                this.timeLeft--;
                document.getElementById('ssTime').textContent = Math.max(0, this.timeLeft);
                if (this.timeLeft <= 0) this._endGame(false);
            }
        }, 1000);
    }

    _loop(ts) {
        if (!this.playing) return;
        if (this.paused) { this.rafId = requestAnimationFrame((t) => this._loop(t)); return; }

        const dt = (ts - this.lastFrame) / 1000;
        this.lastFrame = ts;

        // move words down
        for (let i = this.words.length - 1; i >= 0; i--) {
            const w = this.words[i];
            w.y += w.speed * dt * 60;
            w.el.style.top = w.y + 'px';

            if (w.y > this.areaHeight - 30) {
                this.lives--;
                this._updateLives();
                w.el.remove();
                this.words.splice(i, 1);
                if (this.lives <= 0) { this._endGame(false); return; }
            }
        }

        // update HUD
        document.getElementById('ssScore').textContent = this.score;

        // check win
        if (this.score >= 200) { this._endGame(true); return; }

        this.rafId = requestAnimationFrame((t) => this._loop(t));
    }

    _spawnWord() {
        if (!this.playing || this.paused) return;
        const type = this.types[Math.floor(Math.random() * this.types.length)];
        const category = this.mode === 'pastTense' ? 'pastTense' : 'extension';
        const pool = window.WordDB[category][type];
        const word = pool[Math.floor(Math.random() * pool.length)];

        const el = document.createElement('div');
        el.className = `falling-word fw-${type}`;
        el.textContent = word;
        const x = Math.random() * (this.areaWidth - 100) + 10;
        el.style.left = x + 'px';
        el.style.top  = '-40px';

        const arena = document.getElementById('swordArena');
        arena.appendChild(el);

        this.words.push({
            el, word, type,
            x, y: -40,
            speed: 1.2 + Math.random() * 1.5,
            width: 100
        });
    }

    /* ── slash mechanic ── */

    _slash() {
        if (this.slashing) return;
        this.slashing = true;

        // Show slash animation
        const fx = document.getElementById('slashFx');
        const player = document.getElementById('swordPlayer');
        fx.classList.remove('hidden');
        fx.style.left = player.style.left;
        setTimeout(() => { fx.classList.add('hidden'); this.slashing = false; }, 300);

        // Check hits
        const pxLeft = (this.playerX / 100) * this.areaWidth;
        const hitRange = 80;
        const hitY = this.areaHeight - 120; // slash reaches upward

        for (let i = this.words.length - 1; i >= 0; i--) {
            const w = this.words[i];
            const wx = parseFloat(w.el.style.left);
            const wy = w.y;

            if (Math.abs(wx - pxLeft) < hitRange && wy > hitY - 80 && wy < hitY + 40) {
                // HIT!
                if (w.type === this.currentSword) {
                    this.score += 20;
                    this._hitEffect(w.el, true);
                    window.audioManager.playCorrect();
                } else {
                    this.score = Math.max(0, this.score - 10);
                    this.lives--;
                    this._updateLives();
                    this._hitEffect(w.el, false);
                    window.audioManager.playWrong();
                    if (this.lives <= 0) { this._endGame(false); return; }
                }
                w.el.remove();
                this.words.splice(i, 1);
                break; // one slash per attack
            }
        }
    }

    _hitEffect(el, success) {
        const arena = document.getElementById('swordArena');
        const fx = document.createElement('div');
        fx.className = 'hit-burst';
        fx.textContent = success ? '💥✨' : '💔';
        fx.style.left = el.style.left;
        fx.style.top  = el.style.top;
        arena.appendChild(fx);
        setTimeout(() => fx.remove(), 600);
    }

    _updateLives() {
        const el = document.getElementById('ssLives');
        el.textContent = '❤️'.repeat(Math.max(0, this.lives));
    }

    _togglePause() {
        this.paused = !this.paused;
        document.getElementById('ssPauseBtn').textContent = this.paused ? t('resume') : t('pause');
    }

    _endGame(won) {
        this.playing = false;
        cancelAnimationFrame(this.rafId);
        clearInterval(this.spawnInterval);
        clearInterval(this.timerInterval);

        document.getElementById('ssStartBtn').disabled = false;
        document.getElementById('ssPauseBtn').disabled = true;

        if (won) {
            const isPT = this.mode === 'pastTense';
            window.gameSystem.showMessage(
                window.gameState.currentLanguage === 'zh'
                    ? (isPT ? '🎉 擊敗岩石法師！知識寶石獲得！' : '🎉 擊敗岩石法師！字尾規則掌握！')
                    : (isPT ? '🎉 Rock wizard defeated! Knowledge Gem obtained!' : '🎉 Rock wizard defeated! Suffix rules mastered!'),
                'success', 3000);
            window.gameSystem.completeGame('swordSlash');
        } else {
            window.gameSystem.showMessage(
                `${t('gameOver')}! ${t('score')}: ${this.score}`, 'error', 3000);
        }
    }
}

window.SwordSlashGame = SwordSlashGame;
