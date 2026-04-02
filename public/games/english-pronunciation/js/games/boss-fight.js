/**
 * Game 4 – Boss Fight: Shoot the Flowing Word Bubbles
 *
 * The Pronunciation King floats at the top.
 * Word bubbles drift around the arena in wavy / circular paths.
 * Each phase targets a different sound:
 *   Phase 1 → /t/   Phase 2 → /d/   Phase 3 → /ɪd/
 *
 * Click (shoot) bubbles that match the target sound.
 *   Correct → Boss takes damage.
 *   Wrong  → Player loses time.
 * Defeat the boss within the time limit!
 */
class BossFightGame {
    constructor(container) {
        this.container = container;
        this.bossHP = 100;
        this.phase = 0; // 0, 1, 2
        this.mode = window.gameState.practiceMode || 'pastTense';
        this.types = this.mode === 'pastTense' ? ['t','d','id'] : ['s','es','ies'];
        this.phases = this.mode === 'pastTense'
            ? [
                { type: 't', label: '/t/', count: 5, time: 35 },
                { type: 'd', label: '/d/', count: 5, time: 30 },
                { type: 'id', label: '/ɪd/', count: 5, time: 25 }
              ]
            : [
                { type: 's', label: '-s', count: 5, time: 35 },
                { type: 'es', label: '-es', count: 5, time: 30 },
                { type: 'ies', label: '-ies', count: 5, time: 25 }
              ];
        this.progress = 0;
        this.timeLeft = 0;
        this.bubbles = [];
        this.active = false;
        this.rafId = null;
        this.timerInterval = null;
        this.lastFrame = 0;
        this.arenaW = 0;
        this.arenaH = 0;
        this.hideColors = false;
    }

    start() {
        this._render();
    }

    destroy() {
        this.active = false;
        cancelAnimationFrame(this.rafId);
        clearInterval(this.timerInterval);
    }

    /* ── render ── */

    _render() {
        const lang = window.gameState.currentLanguage;
        this.container.innerHTML = `
        <div class="boss-screen">
            <div class="boss-header">
                <h1 class="boss-title">👑 ${lang === 'zh' ? '發音之王' : 'Pronunciation King'}</h1>
                <div class="boss-hp-wrap">
                    <div class="boss-hp-label">BOSS HP</div>
                    <div class="boss-hp-track"><div id="bossHPBar" class="boss-hp-fill" style="width:100%"></div></div>
                </div>
            </div>

            <div class="boss-arena" id="bossArena">
                <div class="boss-sprite" id="bossSprite"><img src="assets/images/pronunciation-king.png" class="boss-sprite-img" alt="Boss"></div>
                <!-- bubbles render here -->
                <div class="crosshair" id="crosshair">+</div>
            </div>

            <div class="boss-status">
                <div class="bs-item">
                    <span class="hud-label">${t('phase')}</span>
                    <span id="bsPhase" class="hud-value">1</span>
                </div>
                <div class="bs-item">
                    <span class="hud-label">${lang === 'zh' ? '目標' : 'Target'}</span>
                    <span id="bsTarget" class="hud-value target-glow">/t/</span>
                </div>
                <div class="bs-item">
                    <span class="hud-label">${t('progress')}</span>
                    <span id="bsProgress" class="hud-value">0/5</span>
                </div>
                <div class="bs-item">
                    <span class="hud-label">${t('time')}</span>
                    <span id="bsTime" class="hud-value">35</span>
                </div>
            </div>

            <div class="boss-controls">
                <button id="bossStartBtn" class="btn-primary">${t('startBattle')}</button>
                <button id="bossColorToggle" class="btn-secondary btn-difficulty" data-no-click="1">
                    🎨 ${lang === 'zh' ? '顏色提示：開' : 'Color Hints: ON'}
                </button>
                <button id="bossBackBtn" class="btn-secondary">${t('backToMenu')}</button>
            </div>
        </div>`;

        document.getElementById('bossStartBtn').onclick = () => this._startBattle();
        document.getElementById('bossColorToggle').onclick = () => this._toggleColors();
        document.getElementById('bossBackBtn').onclick  = () => { this.destroy(); window.gameSystem.showGameMenu(); };

        // Track mouse for crosshair
        const arena = document.getElementById('bossArena');
        arena.addEventListener('mousemove', (e) => {
            const r = arena.getBoundingClientRect();
            const ch = document.getElementById('crosshair');
            ch.style.left = (e.clientX - r.left) + 'px';
            ch.style.top  = (e.clientY - r.top)  + 'px';
        });

        this.arenaW = arena.offsetWidth  || 700;
        this.arenaH = arena.offsetHeight || 450;
    }

    /* ── battle flow ── */

    _startBattle() {
        this.bossHP = 100;
        this.phase = 0;
        document.getElementById('bossStartBtn').disabled = true;
        document.getElementById('bossHPBar').style.width = '100%';
        document.getElementById('bossSprite').classList.remove('boss-angry','boss-defeated');
        this._startPhase();
    }

    _startPhase() {
        const p = this.phases[this.phase];
        this.progress = 0;
        this.timeLeft = p.time;
        this.bubbles = [];

        // clear old bubbles
        document.querySelectorAll('.word-bubble').forEach(b => b.remove());

        document.getElementById('bsPhase').textContent    = this.phase + 1;
        document.getElementById('bsTarget').textContent   = p.label;
        document.getElementById('bsProgress').textContent = `0/${p.count}`;
        document.getElementById('bsTime').textContent     = this.timeLeft;

        // Spawn bubbles
        this._spawnBubbles(p);

        // Start loop
        this.active = true;
        this.lastFrame = performance.now();
        this.rafId = requestAnimationFrame((ts) => this._loop(ts));
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            document.getElementById('bsTime').textContent = Math.max(0, this.timeLeft);
            if (this.timeLeft <= 0) this._failPhase();
        }, 1000);
    }

    _spawnBubbles(phaseData) {
        const arena = document.getElementById('bossArena');
        const allBubbles = [];
        const category = this.mode === 'pastTense' ? 'pastTense' : 'extension';

        // target bubbles
        const targetWords = window.WordDB.getRandom(category, phaseData.type, phaseData.count + 2);
        targetWords.forEach(word => {
            allBubbles.push({ word, type: phaseData.type });
        });

        // decoy bubbles from same category but different types
        const otherTypes = this.types.filter(tp => tp !== phaseData.type);
        otherTypes.forEach(ot => {
            window.WordDB.getRandom(category, ot, 3).forEach(word => {
                allBubbles.push({ word, type: ot });
            });
        });

        allBubbles.sort(() => Math.random() - 0.5);

        allBubbles.forEach((bd, i) => {
            const el = document.createElement('div');
            el.className = this.hideColors ? 'word-bubble wb-neutral' : `word-bubble wb-${bd.type}`;
            el.dataset.bubbleType = bd.type;
            el.textContent = bd.word;

            // random start position
            const startX = Math.random() * (this.arenaW - 120) + 20;
            const startY = Math.random() * (this.arenaH - 120) + 60;

            el.style.left = startX + 'px';
            el.style.top  = startY + 'px';

            el.onclick = (e) => {
                e.stopPropagation();
                this._shootBubble(bd, el);
            };

            arena.appendChild(el);

            this.bubbles.push({
                el, ...bd,
                x: startX, y: startY,
                // movement: unique wavy/circular path per bubble
                vx: (Math.random() - 0.5) * 1.5,
                vy: (Math.random() - 0.5) * 1.5,
                phase: Math.random() * Math.PI * 2,
                amplitude: 20 + Math.random() * 30,
                freq: 0.5 + Math.random() * 1
            });
        });
    }

    _loop(ts) {
        if (!this.active) return;

        const dt = (ts - this.lastFrame) / 1000;
        this.lastFrame = ts;

        // Move bubbles
        this.bubbles.forEach(b => {
            b.phase += dt * b.freq;
            b.x += b.vx + Math.sin(b.phase) * b.amplitude * dt;
            b.y += b.vy + Math.cos(b.phase * 0.7) * b.amplitude * dt * 0.8;

            // bounce off walls
            if (b.x < 10 || b.x > this.arenaW - 100) b.vx *= -1;
            if (b.y < 40 || b.y > this.arenaH - 60)  b.vy *= -1;
            b.x = Math.max(10, Math.min(this.arenaW - 100, b.x));
            b.y = Math.max(40, Math.min(this.arenaH - 60,  b.y));

            b.el.style.left = b.x + 'px';
            b.el.style.top  = b.y + 'px';
        });

        // Boss shaking when low HP
        const boss = document.getElementById('bossSprite');
        if (this.bossHP < 40) boss.classList.add('boss-angry');

        // Continue animation loop
        this.rafId = requestAnimationFrame((t) => this._loop(t));
    }

    _toggleColors() {
        this.hideColors = !this.hideColors;
        const lang = window.gameState.currentLanguage;
        const btn = document.getElementById('bossColorToggle');
        btn.textContent = this.hideColors
            ? `🎨 ${lang === 'zh' ? '顏色提示：關' : 'Color Hints: OFF'}`
            : `🎨 ${lang === 'zh' ? '顏色提示：開' : 'Color Hints: ON'}`;
        btn.classList.toggle('btn-difficulty-hard', this.hideColors);

        // Update existing bubbles
        this.bubbles.forEach(b => {
            if (this.hideColors) {
                b.el.className = 'word-bubble wb-neutral';
            } else {
                b.el.className = `word-bubble wb-${b.type}`;
            }
        });
    }

    _shootBubble(bd, el) {
        const p = this.phases[this.phase];

        if (bd.type === p.type) {
            // HIT!
            this.progress++;
            this.bossHP = Math.max(0, this.bossHP - Math.ceil(100 / (this.phases.reduce((s,ph)=>s+ph.count,0))));
            document.getElementById('bossHPBar').style.width = this.bossHP + '%';
            document.getElementById('bsProgress').textContent = `${this.progress}/${p.count}`;

            // Pop effect
            el.classList.add('bubble-pop');
            this._createPopFx(el);
            window.audioManager.playCorrect();

            setTimeout(() => {
                el.remove();
                const idx = this.bubbles.findIndex(b => b.el === el);
                if (idx >= 0) this.bubbles.splice(idx, 1);
            }, 300);

            if (this.progress >= p.count) {
                this._completePhase();
            }
        } else {
            // MISS – penalty
            this.timeLeft = Math.max(0, this.timeLeft - 3);
            el.classList.add('bubble-shake');
            window.audioManager.playWrong();
            setTimeout(() => el.classList.remove('bubble-shake'), 400);
        }
    }

    _createPopFx(el) {
        const arena = document.getElementById('bossArena');
        const fx = document.createElement('div');
        fx.className = 'pop-fx';
        fx.textContent = '💥';
        fx.style.left = el.style.left;
        fx.style.top  = el.style.top;
        arena.appendChild(fx);
        setTimeout(() => fx.remove(), 600);
    }

    _completePhase() {
        this.active = false;
        cancelAnimationFrame(this.rafId);
        clearInterval(this.timerInterval);

        // Remove remaining bubbles
        document.querySelectorAll('.word-bubble').forEach(b => b.remove());
        this.bubbles = [];

        if (this.phase >= this.phases.length - 1) {
            this._winBoss();
        } else {
            const msg = window.gameState.currentLanguage === 'zh'
                ? `階段 ${this.phase + 1} 完成！準備下一階段...`
                : `Phase ${this.phase + 1} complete! Prepare for next phase...`;
            window.gameSystem.showMessage(msg, 'success', 2000);
            this.phase++;
            setTimeout(() => this._startPhase(), 2500);
        }
    }

    _failPhase() {
        this.active = false;
        cancelAnimationFrame(this.rafId);
        clearInterval(this.timerInterval);
        document.querySelectorAll('.word-bubble').forEach(b => b.remove());
        this.bubbles = [];

        document.getElementById('bossStartBtn').disabled = false;
        window.gameSystem.showMessage(
            window.gameState.currentLanguage === 'zh'
                ? '⏰ 時間到！再試一次！' : '⏰ Time\'s up! Try again!',
            'error', 3000);
    }

    _winBoss() {
        this.bossHP = 0;
        document.getElementById('bossHPBar').style.width = '0%';
        document.getElementById('bossSprite').classList.add('boss-defeated');

        const isPT = this.mode === 'pastTense';
        window.gameSystem.showMessage(
            window.gameState.currentLanguage === 'zh'
                ? (isPT
                    ? '🏆 恭喜！你擊敗了發音之王，成為真正的發音大師！'
                    : '🏆 恭喜！你擊敗了字尾之王，成為真正的字尾大師！')
                : (isPT
                    ? '🏆 Congratulations! You defeated the Pronunciation King and became a true pronunciation master!'
                    : '🏆 Congratulations! You defeated the Suffix King and became a true suffix master!'),
            'success', 5000);
        window.gameSystem.completeGame('bossFight');
    }
}

window.BossFightGame = BossFightGame;
