/**
 * GameSystem – orchestrates screens, intro scenes, game flow,
 * progress tracking, language switching, and messages.
 */
class GameSystem {
    constructor() {
        this.introScene = 0;
        this.currentGameInstance = null;
        this._init();
    }

    _init() {
        window.screenManager = new ScreenManager();
        window.audioManager  = new AudioManager();
        this._bind();
        this._updateLang(window.gameState.currentLanguage);
        setTimeout(() => window.audioManager.playBGM(), 800);
    }

    /* ── event binding ── */

    _bind() {
        // Global click sound (skip if button has data-no-click)
        document.addEventListener('click', e => {
            if (e.target.tagName === 'BUTTON' && !e.target.dataset.noClick) {
                window.audioManager.playClick();
            }
        });

        // Main menu
        document.getElementById('startGameBtn').onclick     = () => this._showIntro();
        document.getElementById('instructionsBtn').onclick   = () => this.showMessage(t('instructionsText'), 'info', 5000);
        document.getElementById('creditsBtn').onclick        = () => this.showMessage(t('creditsText'), 'info', 3000);
        document.getElementById('languageToggle').onclick    = () => this._toggleLang();

        // Settings panel
        document.getElementById('settingsBtn').onclick = () => this._openSettings();
        document.getElementById('openSettingsBtn').onclick = () => this._openSettings();
        document.getElementById('settingsCloseBtn').onclick = () => {
            document.getElementById('settingsPanel').classList.remove('active');
        };
        document.getElementById('bgmSlider').oninput = () => {
            const val = parseInt(document.getElementById('bgmSlider').value);
            window.audioManager.setBGMVolume(val / 100);
            document.getElementById('bgmValue').textContent = val + '%';
        };
        document.getElementById('sfxSlider').oninput = () => {
            const val = parseInt(document.getElementById('sfxSlider').value);
            window.audioManager.setSFXVolume(val / 100);
            document.getElementById('sfxValue').textContent = val + '%';
        };

        // Achievement panel
        document.getElementById('achievementBtn').onclick = () => this._showAchievements();
        document.getElementById('achieveCloseBtn').onclick = () => {
            document.getElementById('achievementPanel').classList.remove('active');
        };

        // Game menu
        document.getElementById('gameMenuBackBtn').onclick = () => this.showMainMenu();
        document.getElementById('wordPuzzleBtn').onclick   = () => this._launchGame('wordPuzzle');
        document.getElementById('swordSlashBtn').onclick   = () => this._launchGame('swordSlash');
        document.getElementById('multipleChoiceBtn').onclick= () => this._launchGame('multipleChoice');
        document.getElementById('bossFightBtn').onclick    = () => this._launchGame('bossFight');

        // Mode selector tabs
        document.getElementById('modePastTense').onclick = () => this._switchMode('pastTense');
        document.getElementById('modeExtension').onclick = () => this._switchMode('extension');

        // Ending
        document.getElementById('playAgainBtn').onclick = () => this._resetGame();
        document.getElementById('endBackBtn').onclick   = () => this.showMainMenu();

        // Intro scene navigation
        document.getElementById('introNextBtn').onclick = () => this._advanceIntro();
        document.getElementById('introSkipBtn').onclick = () => this._skipIntro();

        // Rules screen navigation
        document.getElementById('rulesNextBtn').onclick = () => this._advanceRules();
        document.getElementById('rulesSkipBtn').onclick = () => this._skipRules();
    }

    /* ── screens ── */

    showMainMenu() {
        if (this.currentGameInstance?.destroy) this.currentGameInstance.destroy();
        this.currentGameInstance = null;
        window.screenManager.show('mainMenuScreen');
        window.audioManager.playBGM();
    }

    showGameMenu() {
        if (this.currentGameInstance?.destroy) this.currentGameInstance.destroy();
        this.currentGameInstance = null;
        window.screenManager.show('gameMenuScreen');
        // Sync mode tabs
        const mode = window.gameState.practiceMode;
        document.getElementById('modePastTense').classList.toggle('active', mode === 'pastTense');
        document.getElementById('modeExtension').classList.toggle('active', mode === 'extension');
        this._updateModeDesc();
        this._updateGameButtons();
    }

    showEnding() {
        window.screenManager.show('endingScreen');
        this._updateEndingArtifacts();
        // Show hero image in ending
        const trophy = document.querySelector('.ending-trophy');
        if (trophy) trophy.innerHTML = '<img src="assets/images/hero-final.png" class="ending-hero-img" alt="Hero">';
        // Play ending video
        const video = document.getElementById('endingVideo');
        if (video) {
            video.currentTime = 0;
            video.play().catch(() => {});
        }
    }

    /* ── 4-scene intro ── */

    _showIntro() {
        this.introScene = 0;
        window.screenManager.show('introScreen');
        this._renderIntroScene();
    }

    _advanceIntro() {
        this.introScene++;
        if (this.introScene >= 4) {
            this._showRules();
        } else {
            this._renderIntroScene();
        }
    }

    _skipIntro() {
        this._showRules();
    }

    _renderIntroScene() {
        const scenes = [
            { title: t('introScene1Title'), text: t('introScene1Text'), bg: 'scene-bg-1', img: 'assets/images/player-sprite.png' },
            { title: t('introScene2Title'), text: t('introScene2Text'), bg: 'scene-bg-2', img: 'assets/images/wizard-sprite.png' },
            { title: t('introScene3Title'), text: t('introScene3Text'), bg: 'scene-bg-3', img: 'assets/images/warrior-sprite.png' },
            { title: t('introScene4Title'), text: t('introScene4Text'), bg: 'scene-bg-4', img: 'assets/images/hero-final.png' }
        ];
        const s = scenes[this.introScene];

        document.getElementById('introIcon').innerHTML = `<img src="${s.img}" class="intro-character" alt="">`;
        document.getElementById('introTitle').textContent  = s.title;
        document.getElementById('introText').textContent   = s.text;
        document.getElementById('introDots').innerHTML =
            scenes.map((_, i) => `<span class="dot ${i === this.introScene ? 'dot-active' : ''}"></span>`).join('');

        // Update button text on last scene
        const nextBtn = document.getElementById('introNextBtn');
        nextBtn.textContent = this.introScene === 3 ? t('startAdventure') : t('continueBtn');

        // Background class
        const screen = document.getElementById('introScreen');
        screen.className = `screen active intro-screen ${s.bg}`;
    }

    /* ── fairy rules tutorial (2 pages) ── */

    _showRules() {
        this.rulesPage = 0;
        window.screenManager.show('rulesScreen');
        this._renderRulesPage();
    }

    _advanceRules() {
        this.rulesPage++;
        if (this.rulesPage >= 2) {
            this.showGameMenu();
        } else {
            this._renderRulesPage();
        }
    }

    _skipRules() {
        this.showGameMenu();
    }

    _renderRulesPage() {
        const page = this.rulesPage;
        const bubble = document.getElementById('fairyBubble');
        const body   = document.getElementById('rulesBody');
        const dots   = document.getElementById('rulesDots');
        const nextBtn = document.getElementById('rulesNextBtn');

        // Fairy speech
        bubble.textContent = page === 0 ? t('fairySpeech1') : t('fairySpeech2');

        // Build rules HTML
        if (page === 0) {
            body.innerHTML = `
                <h3 class="rules-section-title">${t('rulesEdTitle')}</h3>
                <div class="rule-item">
                    <span class="rule-color rc-blue"></span>
                    <div>
                        <div class="rule-label">${t('rulesEdT')}</div>
                        <div class="rule-example">${t('rulesEdTEx')}</div>
                    </div>
                </div>
                <div class="rule-item">
                    <span class="rule-color rc-red"></span>
                    <div>
                        <div class="rule-label">${t('rulesEdD')}</div>
                        <div class="rule-example">${t('rulesEdDEx')}</div>
                    </div>
                </div>
                <div class="rule-item">
                    <span class="rule-color rc-green"></span>
                    <div>
                        <div class="rule-label">${t('rulesEdId')}</div>
                        <div class="rule-example">${t('rulesEdIdEx')}</div>
                    </div>
                </div>
                <p class="rule-tip">${t('rulesEdTip')}</p>
            `;
        } else {
            body.innerHTML = `
                <h3 class="rules-section-title">${t('rulesSesTitle')}</h3>
                <div class="rule-item">
                    <span class="rule-color rc-blue"></span>
                    <div>
                        <div class="rule-label">${t('rulesSesS')}</div>
                        <div class="rule-example">${t('rulesSesSEx')}</div>
                    </div>
                </div>
                <div class="rule-item">
                    <span class="rule-color rc-red"></span>
                    <div>
                        <div class="rule-label">${t('rulesSesEs')}</div>
                        <div class="rule-example">${t('rulesSesEsEx')}</div>
                    </div>
                </div>
                <div class="rule-item">
                    <span class="rule-color rc-green"></span>
                    <div>
                        <div class="rule-label">${t('rulesSesIes')}</div>
                        <div class="rule-example">${t('rulesSesIesEx')}</div>
                    </div>
                </div>
                <p class="rule-tip">${t('rulesSesIesTip')}</p>
            `;
        }

        // Dots
        dots.innerHTML = [0, 1].map(i =>
            `<span class="dot ${i === page ? 'dot-active' : ''}"></span>`
        ).join('');

        // Button text
        nextBtn.textContent = page === 1 ? t('rulesGotIt') : t('rulesContinue');

        // Re-trigger fairy animation on page change
        const fairy = document.querySelector('.fairy-sprite');
        if (fairy && page > 0) {
            fairy.style.animation = 'none';
            fairy.offsetHeight; // reflow
            fairy.style.animation = '';
        }
    }

    /* ── game launch ── */

    _launchGame(id) {
        const progress = window.gameState.gameProgress[id];
        if (!progress.unlocked) {
            this.showMessage(
                window.gameState.currentLanguage === 'zh'
                    ? '請先完成前面的遊戲！' : 'Complete previous games first!',
                'warning');
            return;
        }

        window.gameState.currentGame = id;

        // cutscene keys
        const csKeys = {
            wordPuzzle:     { title: t('cs1Title'), text: t('cs1Text'), img: 'assets/images/player-sprite.png' },
            swordSlash:     { title: t('cs2Title'), text: t('cs2Text'), img: 'assets/images/warrior-sprite.png' },
            multipleChoice: { title: t('cs3Title'), text: t('cs3Text'), img: 'assets/images/wizard-sprite.png' },
            bossFight:      { title: t('cs4Title'), text: t('cs4Text'), img: 'assets/images/pronunciation-king.png' }
        };

        const cs = csKeys[id];
        window.screenManager.showCutscene(cs.title, cs.text, () => {
            window.screenManager.show('gameContainer');
            const container = document.getElementById('gameContent');
            container.innerHTML = '';
            container.className = 'game-content';

            // Set per-game backdrop
            const bgMap = {
                wordPuzzle:     'assets/images/cliff-background.jpg',
                swordSlash:     'assets/images/cave-background.jpg',
                multipleChoice: 'assets/images/wizard-lair.jpg',
                bossFight:      'assets/images/boss-arena.jpg'
            };
            container.style.backgroundImage = `url('${bgMap[id]}')`;

            switch (id) {
                case 'wordPuzzle':
                    this.currentGameInstance = new WordPuzzleGame(container);
                    break;
                case 'swordSlash':
                    this.currentGameInstance = new SwordSlashGame(container);
                    break;
                case 'multipleChoice':
                    this.currentGameInstance = new MultipleChoiceGame(container);
                    break;
                case 'bossFight':
                    this.currentGameInstance = new BossFightGame(container);
                    break;
            }
            this.currentGameInstance.start();
        }, cs.img);
    }

    completeGame(id) {
        window.gameState.gameProgress[id].completed = true;
        window.audioManager.playCorrect();

        // Grant artifact
        const artifactMap = {
            wordPuzzle: 't', swordSlash: 'd', multipleChoice: 'id'
        };
        if (artifactMap[id]) window.gameState.artifacts[artifactMap[id]] = true;

        // Unlock next
        const order = ['wordPuzzle','swordSlash','multipleChoice','bossFight'];
        const idx = order.indexOf(id);
        if (idx >= 0 && idx < order.length - 1) {
            window.gameState.gameProgress[order[idx + 1]].unlocked = true;
        }

        if (id === 'bossFight') {
            setTimeout(() => this.showEnding(), 3000);
        } else {
            setTimeout(() => this.showGameMenu(), 3000);
        }
    }

    /* ── progress ── */

    _updateGameButtons() {
        const ids = ['wordPuzzle','swordSlash','multipleChoice','bossFight'];
        ids.forEach(id => {
            const btn = document.getElementById(id + 'Btn');
            if (!btn) return;
            const p = window.gameState.gameProgress[id];
            btn.classList.remove('locked','completed');
            if (p.completed) btn.classList.add('completed');
            else if (!p.unlocked) btn.classList.add('locked');
        });
    }

    _resetGame() {
        window.gameState = {
            currentLanguage: window.gameState.currentLanguage,
            practiceMode: window.gameState.practiceMode,
            currentGame: null,
            gameProgress: {
                wordPuzzle:     { completed: false, unlocked: true },
                swordSlash:     { completed: false, unlocked: false },
                multipleChoice: { completed: false, unlocked: false },
                bossFight:      { completed: false, unlocked: false }
            },
            artifacts: { t: false, d: false, id: false },
            score: 0
        };
        // Stop ending video
        const video = document.getElementById('endingVideo');
        if (video) { video.pause(); video.currentTime = 0; }
        this.showMainMenu();
    }

    /* ── language ── */

    _toggleLang() {
        const next = window.gameState.currentLanguage === 'zh' ? 'en' : 'zh';
        this._updateLang(next);
    }

    _updateLang(lang) {
        window.gameState.currentLanguage = lang;
        const $ = id => document.getElementById(id);

        $('gameTitle').textContent       = t('gameTitle');
        $('startGameBtn').textContent    = t('startGame');
        $('instructionsBtn').textContent = t('instructions');
        $('creditsBtn').textContent      = t('credits');
        $('languageToggle').textContent  = t('langToggle');

        $('gameMenuTitle').textContent   = t('gameMenuTitle');
        $('g1Title').textContent = t('g1Title');
        $('g1Desc').textContent  = t('g1Desc');
        $('g2Title').textContent = t('g2Title');
        $('g2Desc').textContent  = t('g2Desc');
        $('g3Title').textContent = t('g3Title');
        $('g3Desc').textContent  = t('g3Desc');
        $('g4Title').textContent = t('g4Title');
        $('g4Desc').textContent  = t('g4Desc');
        $('gameMenuBackBtn').textContent = t('backToMenu');

        $('endTitle').textContent    = t('endingTitle');
        $('endDesc').textContent     = t('endingDesc');
        $('playAgainBtn').textContent= t('playAgain');
        $('endBackBtn').textContent  = t('backToMenu');

        // Settings button label
        $('openSettingsBtn').textContent = lang === 'zh' ? '⚙️ 設定' : '⚙️ Settings';

        // Mode selector labels
        $('modePTLabel').textContent  = t('modePT');
        $('modeExtLabel').textContent = t('modeExt');
        this._updateModeDesc();

        // Rules screen buttons
        $('rulesSkipBtn').textContent = t('rulesSkip');
    }

    /* ── mode selector ── */

    _switchMode(mode) {
        window.gameState.practiceMode = mode;
        // Reset game progress when switching mode
        window.gameState.gameProgress = {
            wordPuzzle:     { completed: false, unlocked: true },
            swordSlash:     { completed: false, unlocked: false },
            multipleChoice: { completed: false, unlocked: false },
            bossFight:      { completed: false, unlocked: false }
        };
        window.gameState.artifacts = { t: false, d: false, id: false };

        // Update tab highlight
        document.getElementById('modePastTense').classList.toggle('active', mode === 'pastTense');
        document.getElementById('modeExtension').classList.toggle('active', mode === 'extension');
        this._updateModeDesc();
        this._updateGameButtons();
    }

    _updateModeDesc() {
        const desc = document.getElementById('modeDesc');
        if (desc) {
            desc.textContent = window.gameState.practiceMode === 'pastTense'
                ? t('modePTDesc') : t('modeExtDesc');
        }
    }

    _updateEndingArtifacts() {
        const container = document.getElementById('endingArtifacts');
        if (!container) return;
        const isPT = window.gameState.practiceMode === 'pastTense';
        if (isPT) {
            container.innerHTML = `
                <span class="artifact-badge">🔵 時空控制器</span>
                <span class="artifact-badge">🔴 知識寶石</span>
                <span class="artifact-badge">🟢 探索者之眼</span>`;
        } else {
            container.innerHTML = `
                <span class="artifact-badge">📘 -s</span>
                <span class="artifact-badge">📗 -es</span>
                <span class="artifact-badge">📕 -ies</span>`;
        }
    }

    /* ── settings panel ── */

    _openSettings() {
        const lang = window.gameState.currentLanguage;
        document.getElementById('settingsTitle').textContent =
            lang === 'zh' ? '⚙️ 設定' : '⚙️ Settings';
        document.getElementById('bgmLabel').textContent =
            lang === 'zh' ? '🎵 背景音樂' : '🎵 BGM';
        document.getElementById('sfxLabel').textContent =
            lang === 'zh' ? '🔊 音效' : '🔊 SFX';
        // Sync sliders with current audio values
        const bgmPct = Math.round(window.audioManager.bgmVol * 100);
        const sfxPct = Math.round(window.audioManager.sfxVol * 100);
        document.getElementById('bgmSlider').value = bgmPct;
        document.getElementById('bgmValue').textContent = bgmPct + '%';
        document.getElementById('sfxSlider').value = sfxPct;
        document.getElementById('sfxValue').textContent = sfxPct + '%';
        document.getElementById('settingsPanel').classList.add('active');
    }

    /* ── achievement panel ── */

    _showAchievements() {
        const panel = document.getElementById('achievementPanel');
        const arts = window.gameState.artifacts;
        const lang = window.gameState.currentLanguage;
        const isPT = window.gameState.practiceMode === 'pastTense';

        // Update title
        document.getElementById('achieveTitle').textContent =
            lang === 'zh' ? '🏆 收集的神器' : '🏆 Collected Artifacts';

        // Artifact T
        const artT = document.getElementById('artifactT');
        artT.classList.toggle('collected', arts.t);
        document.getElementById('artifactTName').textContent = isPT
            ? (lang === 'zh' ? '時空控制器' : 'Time Controller')
            : (lang === 'zh' ? '-s 規則之石' : '-s Rule Stone');
        document.getElementById('artifactTStatus').textContent = arts.t
            ? (lang === 'zh' ? '✅ 已收集' : '✅ Collected')
            : (lang === 'zh' ? '❌ 尚未收集' : '❌ Not yet');

        // Artifact D
        const artD = document.getElementById('artifactD');
        artD.classList.toggle('collected', arts.d);
        document.getElementById('artifactDName').textContent = isPT
            ? (lang === 'zh' ? '知識寶石' : 'Knowledge Gem')
            : (lang === 'zh' ? '-es 規則之石' : '-es Rule Stone');
        document.getElementById('artifactDStatus').textContent = arts.d
            ? (lang === 'zh' ? '✅ 已收集' : '✅ Collected')
            : (lang === 'zh' ? '❌ 尚未收集' : '❌ Not yet');

        // Artifact ID
        const artID = document.getElementById('artifactID');
        artID.classList.toggle('collected', arts.id);
        document.getElementById('artifactIDName').textContent = isPT
            ? (lang === 'zh' ? '探索者之眼' : 'Explorer\'s Eye')
            : (lang === 'zh' ? '-ies 規則之石' : '-ies Rule Stone');
        document.getElementById('artifactIDStatus').textContent = arts.id
            ? (lang === 'zh' ? '✅ 已收集' : '✅ Collected')
            : (lang === 'zh' ? '❌ 尚未收集' : '❌ Not yet');

        // All collected?
        const allWrap = document.getElementById('artifactAllWrap');
        const allText = document.getElementById('artifactAllText');
        if (arts.t && arts.d && arts.id) {
            allWrap.style.display = 'block';
            allText.textContent = lang === 'zh' ? '✨ 已收集所有神器！' : '✨ All artifacts collected!';
        } else {
            allWrap.style.display = 'none';
        }

        panel.classList.add('active');
    }

    /* ── messages ── */

    showMessage(text, type = 'success', duration = 3000) {
        document.querySelectorAll('.toast-msg').forEach(m => m.remove());
        const el = document.createElement('div');
        el.className = `toast-msg toast-${type}`;
        el.textContent = text;
        document.body.appendChild(el);

        if (type === 'success') window.audioManager.playCorrect();
        else if (type === 'error') window.audioManager.playWrong();

        setTimeout(() => {
            el.style.opacity = '0';
            setTimeout(() => el.remove(), 400);
        }, duration);
    }
}

window.GameSystem = GameSystem;
