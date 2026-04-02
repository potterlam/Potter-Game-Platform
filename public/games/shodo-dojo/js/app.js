// ============================================================
// 書道場 — Main Game Engine (Refactored)
// Handles all game logic, audio, UI, and Hanzi Writer integration
// ============================================================

// ── DOM Helper ────────────────────────────────────────────
function $(id) { return document.getElementById(id); }

// ── Shared HanziWriter charDataLoader ─────────────────────
function loadCharData(char, onComplete, onError) {
  fetch('https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0/' + encodeURIComponent(char) + '.json')
    .then(function(r) { return r.json(); })
    .then(onComplete)
    .catch(function(e) {
      console.error('Failed to load char data:', char, e);
      if (onError) onError(e);
    });
}

const GAME_I18N = {
  zh: {
    titleSubtitle: 'Shodo Dojo — 繁體字書寫修行',
    titleDesc: '挑戰道場前輩，練返一手好字',
    enterDojo: '進入道場',
    rulesTitle: '📜 書道七則 — 筆順基本規律',
    btnBack: '返回',
    selectStage: '選擇修行階段',
    btnLoadBank: '📂 載入題庫',
    btnGenerator: '📝 題庫產生器',
    btnBackEntrance: '返回入口',
    watchDemo: '觀看示範',
    btnDemo: '▶️ 示範',
    btnStartWrite: '✏️ 開始書寫',
    btnNext: '➡️ 下一個',
    hintsTitle: '💡 提示',
    hintPlaceholder: '撳下面個掣攞提示',
    btnGetHint: '💡 攞提示（-10分）',
    btnListen: '🔊 聽讀音',
    labelJyutping: '粵拼',
    labelMeaning: '意思',
    labelRadical: '部首',
    labelStrokes: '筆畫',
    statScore: '總分',
    statChars: '完成字數',
    statMistakes: '總失誤',
    statHints: '使用提示',
    statPerfects: '完美書寫',
    btnRetry: '🔄 再次挑戰',
    btnNextLevel: '➡️ 下一關',
    btnSelectLevel: '📋 選擇關卡',
    btnBackLobby: '🏠 返回大廳',
    settingsTitle: '⚙️ 設定',
    quitTitle: '確定要退出？',
    quitDesc: '而家嘅進度唔會保存㗎。',
    btnConfirmQuit: '確定退出',
    btnContinue: '繼續修行'
  },
  en: {
    titleSubtitle: 'Shodo Dojo — Chinese Character Writing',
    titleDesc: 'Challenge dojo opponents, master your strokes',
    enterDojo: 'Enter Dojo',
    rulesTitle: '📜 7 Stroke Order Rules',
    btnBack: 'Back',
    selectStage: 'Select Stage',
    btnLoadBank: '📂 Load Bank',
    btnGenerator: '📝 Generator',
    btnBackEntrance: 'Back',
    watchDemo: 'Watch Demo',
    btnDemo: '▶️ Demo',
    btnStartWrite: '✏️ Start Writing',
    btnNext: '➡️ Next',
    hintsTitle: '💡 Hints',
    hintPlaceholder: 'Press the button below for a hint',
    btnGetHint: '💡 Get Hint (-10pts)',
    btnListen: '🔊 Listen',
    labelJyutping: 'Jyutping',
    labelMeaning: 'Meaning',
    labelRadical: 'Radical',
    labelStrokes: 'Strokes',
    statScore: 'Score',
    statChars: 'Characters',
    statMistakes: 'Mistakes',
    statHints: 'Hints Used',
    statPerfects: 'Perfects',
    btnRetry: '🔄 Retry',
    btnNextLevel: '➡️ Next Level',
    btnSelectLevel: '📋 Select Level',
    btnBackLobby: '🏠 Lobby',
    settingsTitle: '⚙️ Settings',
    quitTitle: 'Quit this level?',
    quitDesc: 'Current progress will not be saved.',
    btnConfirmQuit: 'Quit',
    btnContinue: 'Continue'
  }
};

class ShodoDojo {
  constructor() {
    this.state = {
      currentScreen: 'title-screen',
      currentLevel: null,
      currentCharIndex: 0,
      characters: [],
      score: 0,
      totalMistakes: 0,
      charMistakes: 0,
      hintsUsed: 0,
      hintsUsedTotal: 0,
      perfectCount: 0,
      levelsCompleted: JSON.parse(localStorage.getItem('shodo-levels') || '{}'),
      levelScores: JSON.parse(localStorage.getItem('shodo-scores') || '{}'),
      showStrokeDemo: true,
      showOutline: true
    };

    this.demoWriter = null;
    this.quizWriter = null;
    this.audioCtx = null;
    this.bgmNodes = null;
    this.bgmVolume = 0.3;
    this.sfxVolume = 0.5;
    this.voiceEnabled = true;
    this.lang = 'zh';

    this.init();
  }

  // ── Initialization ──────────────────────────────────────
  init() {
    this.updateLevelCards();
    this.populateRules();
    this.initAudio();
  }

  // ── Screen Management ───────────────────────────────────
  showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = $(screenId);
    if (screen) {
      screen.classList.add('active', 'screen-enter');
      setTimeout(() => screen.classList.remove('screen-enter'), 400);
    }
    this.state.currentScreen = screenId;

    if (screenId === 'level-select') this.updateLevelCards();
    if (screenId === 'title-screen') this.startBGM();
  }

  // ── Level Select ────────────────────────────────────────
  updateLevelCards() {
    ['level1', 'level2', 'level3'].forEach((lvl, i) => {
      const card = $('level-card-' + (i + 1));
      const scoreEl = $('score-' + lvl);
      const isUnlocked = i === 0 || this.state.levelsCompleted['level' + i];

      if (isUnlocked) {
        card.classList.remove('locked');
        const lockEl = card.querySelector('.lock-overlay');
        if (lockEl) lockEl.style.display = 'none';
      }

      scoreEl.textContent = this.state.levelScores[lvl] !== undefined
        ? '最高分：' + this.state.levelScores[lvl] : '';
    });

    if (CHARACTER_DB.custom) {
      const card = $('level-card-custom');
      if (card) card.style.display = '';
      const scoreEl = $('score-custom');
      if (scoreEl && this.state.levelScores.custom !== undefined) {
        scoreEl.textContent = '最高分：' + this.state.levelScores.custom;
      }
    }
  }

  // ── Start Level ─────────────────────────────────────────
  startLevel(levelKey) {
    if (levelKey !== 'custom') {
      const levelIndex = parseInt(levelKey.replace('level', ''));
      if (levelIndex !== 1 && !this.state.levelsCompleted['level' + (levelIndex - 1)]) return;
    }

    const data = CHARACTER_DB[levelKey];
    if (!data) return;

    Object.assign(this.state, {
      characters: [...data.characters].sort(() => Math.random() - 0.5),
      currentLevel: levelKey,
      currentCharIndex: 0,
      score: 0,
      totalMistakes: 0,
      hintsUsedTotal: 0,
      perfectCount: 0
    });

    this.showScreen('game-screen');
    this.setupOpponent();
    this.showDialogue('greeting');
    this.updateGameUI();

    // Small delay then present first character
    setTimeout(() => this.presentCharacter(), 2000);
  }

  // ── Opponent Setup ──────────────────────────────────────
  setupOpponent() {
    const opponentKey = this.state.currentLevel === 'custom' ? 'level1' : this.state.currentLevel;
    const opponent = OPPONENTS[opponentKey];
    if (!opponent) return;

    $('opponent-name').textContent = opponent.name;
    const body = document.querySelector('#game-screen .avatar-body');
    if (body) body.style.background = opponent.avatar.body;

    this.setExpression('greeting');
  }

  setExpression(mood) {
    const moods = {
      greeting: '😊', challenge: '🤨', mock: '😏', praise: '😄',
      perfect: '😲', angry: '😤', proud: '😌', hint: '🤔'
    };
    $('avatar-expression').textContent = moods[mood] || '😊';
  }

  showDialogue(category) {
    const text = getDialogue(this.state.currentLevel, category);
    const el = $('dialogue-text');
    el.style.opacity = 0;
    setTimeout(() => { el.textContent = text; el.style.opacity = 1; }, 150);
  }

  // ── Present Character ───────────────────────────────────
  presentCharacter() {
    const chars = this.state.characters;
    const idx = this.state.currentCharIndex;
    if (idx >= chars.length) {
      this.finishLevel();
      return;
    }

    const charData = chars[idx];
    this.state.charMistakes = 0;
    this.state.hintsUsed = 0;

    // Info panel
    $('char-emoji').textContent = charData.emoji;
    $('char-display-big').textContent = charData.char;
    $('char-jyutping').textContent = charData.jyutping;
    $('char-meaning').textContent = charData.meaningZh + ' (' + charData.meaning + ')';
    $('char-radical').textContent = charData.radical + ' — ' + charData.radicalName;
    $('char-strokes').textContent = charData.strokeCount + ' 畫';

    // Reset hints
    $('hints-list').innerHTML = '<p class="hint-placeholder">撳下面個掣攞提示</p>';
    $('btn-hint').disabled = false;

    // Buttons
    $('btn-demo').style.display = '';
    $('btn-start-quiz').style.display = '';
    $('btn-next').style.display = 'none';

    // Update progress
    this.updateGameUI();

    // Dialogue
    this.showDialogue('challenge');
    this.setExpression('challenge');

    // Speak the character
    if (this.voiceEnabled) {
      setTimeout(() => this.speakCharacter(), 500);
    }

    // Create demo writer
    this.createDemoWriter(charData.char);

    if (this.state.showStrokeDemo) {
      $('writing-status').textContent = '觀看示範';
      $('demo-container').style.display = '';
      $('quiz-container').style.display = 'none';
      setTimeout(() => this.playDemo(), 800);
    } else {
      $('btn-demo').style.display = '';
      this.createQuizWriter(charData.char);
    }
  }

  // ── HanziWriter Factory ─────────────────────────────────
  _createWriter(containerId, char, extraOpts) {
    const container = $(containerId);
    container.innerHTML = '';
    const size = this.getWriterSize();
    const baseOpts = {
      width: size, height: size, padding: 10,
      showOutline: this.state.showOutline,
      showCharacter: false,
      strokeColor: '#1a1a1a',
      outlineColor: '#ddd',
      charDataLoader: loadCharData
    };
    try {
      return HanziWriter.create(container, char, Object.assign(baseOpts, extraOpts));
    } catch (e) {
      console.error('Failed to create writer in #' + containerId + ':', e);
      return null;
    }
  }

  createDemoWriter(char) {
    this.demoWriter = this._createWriter('hanzi-demo', char, {
      strokeAnimationSpeed: 1, delayBetweenStrokes: 400,
      drawingColor: '#c41e3a', radicalColor: '#c41e3a'
    });
  }

  createQuizWriter(char) {
    this.quizWriter = this._createWriter('hanzi-quiz', char, {
      showHintAfterMisses: 3, highlightOnComplete: true,
      drawingColor: '#1a1a1a', highlightColor: '#c41e3a', drawingWidth: 6
    });
  }

  getWriterSize() {
    const vw = window.innerWidth;
    if (vw <= 600) return 220;
    if (vw <= 900) return 260;
    return 300;
  }

  playDemo() {
    if (!this.demoWriter) return;
    $('demo-container').style.display = '';
    $('quiz-container').style.display = 'none';
    $('writing-status').textContent = '觀看示範';
    $('btn-start-quiz').style.display = '';

    this.demoWriter.hideCharacter();
    this.demoWriter.animateCharacter({
      onComplete: () => { $('writing-status').textContent = '示範完成 — 準備開始書寫'; }
    });
  }

  // ── Hanzi Writer: Quiz ──────────────────────────────────
  startQuiz() {
    const charData = this.state.characters[this.state.currentCharIndex];
    if (!charData) return;

    $('demo-container').style.display = 'none';
    $('quiz-container').style.display = '';
    $('writing-status').textContent = '✏️ 請書寫：' + charData.char;
    $('btn-demo').style.display = '';
    $('btn-start-quiz').style.display = 'none';

    this.createQuizWriter(charData.char);

    this.quizWriter.quiz({
      onMistake: (strokeData) => this.handleMistake(strokeData),
      onCorrectStroke: (strokeData) => this.handleCorrectStroke(strokeData),
      onComplete: (summaryData) => this.handleComplete(summaryData)
    });
  }

  handleMistake() {
    this.state.charMistakes++;
    this.state.totalMistakes++;
    this.playSFX('wrong');
    this.showStrokeFeedback('✗', false);
    this.showDialogue('mock');
    this.setExpression('mock');
    this._animateAvatar('opponent-shake', 400);
  }

  handleCorrectStroke() {
    this.playSFX('correct');
    this.showStrokeFeedback('✓', true);
  }

  handleComplete(summaryData) {
    const mistakes = summaryData.totalMistakes;
    const hintsUsed = this.state.hintsUsed;
    const charScore = Math.max(0, 100 - (mistakes * 20) - (hintsUsed * 10));
    this.state.score += charScore;

    const isPerfect = mistakes === 0 && hintsUsed === 0;
    if (isPerfect) {
      this.state.perfectCount++;
      this.showDialogue('perfect');
      this.setExpression('perfect');
      this.showStrokeFeedback('完美！', true);
    } else {
      this.showDialogue('praise');
      this.setExpression('praise');
      this.showStrokeFeedback('+' + charScore, true);
    }

    this._animateAvatar('opponent-happy', 500);
    $('writing-status').textContent = '✅ 完成！得分 +' + charScore;
    $('btn-next').style.display = '';
    $('btn-demo').style.display = 'none';
    this.updateGameUI();
  }

  _animateAvatar(cls, duration) {
    const avatar = $('opponent-avatar');
    avatar.classList.add(cls);
    setTimeout(() => avatar.classList.remove(cls), duration);
  }

  // ── Next Character ──────────────────────────────────────
  nextCharacter() {
    this.state.currentCharIndex++;
    if (this.state.currentCharIndex >= this.state.characters.length) {
      this.finishLevel();
    } else {
      this.presentCharacter();
    }
  }

  // ── Finish Level ────────────────────────────────────────
  finishLevel() {
    const { currentLevel: levelKey, score, perfectCount, characters } = this.state;
    const data = CHARACTER_DB[levelKey];
    const isCustom = levelKey === 'custom';
    const passed = isCustom || (score >= data.passScore);

    this._saveProgress(levelKey, passed, isCustom);
    this.showScreen('results-screen');
    this._renderResults(levelKey, passed, isCustom, perfectCount, characters.length);
  }

  _saveProgress(levelKey, passed, isCustom) {
    if (passed && !isCustom) {
      this.state.levelsCompleted[levelKey] = true;
      localStorage.setItem('shodo-levels', JSON.stringify(this.state.levelsCompleted));
    }
    const prev = this.state.levelScores[levelKey] || 0;
    if (this.state.score > prev) {
      this.state.levelScores[levelKey] = this.state.score;
      localStorage.setItem('shodo-scores', JSON.stringify(this.state.levelScores));
    }
  }

  _renderResults(levelKey, passed, isCustom, perfects, total) {
    const stamp = $('results-stamp');
    const title = $('results-title');
    const dialogue = $('results-dialogue');
    const nextBtn = $('btn-next-level');

    if (isCustom) {
      this._renderCustomResults(stamp, title, dialogue, nextBtn, perfects, total);
    } else if (passed) {
      this._renderPassResults(stamp, title, dialogue, nextBtn, levelKey);
    } else {
      this._renderFailResults(stamp, title, dialogue, nextBtn, levelKey);
    }

    $('result-expression').textContent = (passed || isCustom) ? '😊' : '😤';
    $('result-score').textContent = this.state.score;
    $('result-chars').textContent = total;
    $('result-mistakes').textContent = this.state.totalMistakes;
    $('result-hints').textContent = this.state.hintsUsedTotal;
    $('result-perfects').textContent = perfects;
  }

  _renderCustomResults(stamp, title, dialogue, nextBtn, perfects, total) {
    const ratio = total > 0 ? perfects / total : 0;
    stamp.style.color = stamp.style.borderColor = 'var(--correct-green)';
    nextBtn.style.display = 'none';

    if (ratio >= 0.8) {
      stamp.textContent = '優'; title.textContent = '🌟 完美表現！';
      dialogue.textContent = '你寫得太好喇！每一筆都好有功力，繼續保持！';
    } else if (ratio >= 0.5) {
      stamp.textContent = '良'; title.textContent = '🎉 表現出色！';
      dialogue.textContent = '好叻呀！大部分字都寫得好靚，再練多幾次一定更加好！';
    } else if (this.state.score > 0) {
      stamp.textContent = '進'; title.textContent = '💪 繼續進步！';
      dialogue.textContent = '每次練習都係進步！你已經做得好好，繼續加油！';
    } else {
      stamp.textContent = '練'; title.textContent = '✏️ 好的開始！';
      dialogue.textContent = '萬事起頭難，你踏出咗第一步！多練幾次就會越寫越好㗎！';
    }
  }

  _renderPassResults(stamp, title, dialogue, nextBtn, levelKey) {
    stamp.textContent = '合';
    stamp.style.color = stamp.style.borderColor = 'var(--correct-green)';
    title.textContent = '🎉 修行通過！';
    dialogue.textContent = getDialogue(levelKey, 'levelComplete');
    const levelNum = parseInt(levelKey.replace('level', ''));
    nextBtn.style.display = levelNum < 3 ? '' : 'none';
  }

  _renderFailResults(stamp, title, dialogue, nextBtn, levelKey) {
    stamp.textContent = '未';
    stamp.style.color = stamp.style.borderColor = 'var(--wrong-red)';
    title.textContent = '修行未通過…';
    dialogue.textContent = getDialogue(levelKey, 'levelFail');
    nextBtn.style.display = 'none';
  }

  retryLevel() {
    if (this.state.currentLevel) this.startLevel(this.state.currentLevel);
  }

  goNextLevel() {
    const num = parseInt(this.state.currentLevel.replace('level', ''));
    if (num < 3) this.startLevel('level' + (num + 1));
  }

  // ── Custom Stage ────────────────────────────────────────
  loadCustomStage(data) {
    if (!data || !data.characters || !data.characters.length) return;

    CHARACTER_DB.custom = {
      name: data.name || '自訂關卡',
      nameEn: data.nameEn || 'Custom Stage',
      subtitle: data.subtitle || data.name || '自訂關卡',
      subtitleEn: data.subtitleEn || data.nameEn || 'Custom Stage',
      description: data.description || '自訂嘅練習題庫',
      descriptionEn: data.descriptionEn || 'Custom question bank',
      requiredScore: 0,
      passScore: data.passScore || 1200,
      characters: data.characters
    };

    const card = $('level-card-custom');
    if (card) {
      card.style.display = '';
      const titleEl = $('custom-level-title');
      const desc = $('custom-level-desc');
      if (titleEl) titleEl.textContent = CHARACTER_DB.custom.name;
      if (desc) desc.textContent = CHARACTER_DB.custom.description + ' (' + data.characters.length + ' 字)';
    }

    if (this.state.levelScores.custom !== undefined) {
      const scoreEl = $('score-custom');
      if (scoreEl) scoreEl.textContent = '最高分：' + this.state.levelScores.custom;
    }
  }

  loadCustomFromFile() {
    $('custom-file-input').click();
  }

  handleCustomFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = this._parseCustomData(e.target.result);
        if (data && data.characters) {
          localStorage.setItem('shodo-custom-stage', JSON.stringify(data));
          this.loadCustomStage(data);
        }
      } catch (err) {
        console.error('Failed to load custom stage:', err);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }

  _parseCustomData(text) {
    if (text.trim().startsWith('{')) return JSON.parse(text);
    const match = text.match(/(?:const|let|var)\s+\w+\s*=\s*(\{[\s\S]*\});?\s*$/);
    return match ? JSON.parse(match[1]) : null;
  }

  // ── Hints ───────────────────────────────────────────────
  showHint() {
    const charData = this.state.characters[this.state.currentCharIndex];
    if (!charData) return;

    const hintIndex = this.state.hintsUsed;
    if (hintIndex >= charData.hints.length) {
      $('btn-hint').disabled = true;
      return;
    }

    this.state.hintsUsed++;
    this.state.hintsUsedTotal++;
    this.playSFX('hint');
    this.showDialogue('hint');
    this.setExpression('hint');

    const listEl = $('hints-list');
    if (hintIndex === 0) listEl.innerHTML = '';

    const item = document.createElement('div');
    item.className = 'hint-item';
    item.textContent = charData.hints[hintIndex];
    listEl.appendChild(item);

    if (this.state.hintsUsed >= charData.hints.length) $('btn-hint').disabled = true;
  }

  // ── Voice ───────────────────────────────────────────────
  speakCharacter() {
    const charData = this.state.characters[this.state.currentCharIndex];
    if (!charData || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(charData.char);
    utter.lang = 'zh-HK';
    utter.rate = 0.8;
    utter.volume = this.sfxVolume;
    window.speechSynthesis.speak(utter);
  }

  // ── Audio System ────────────────────────────────────────
  initAudio() {
    // Audio will be initialized on first user interaction
    const startAudio = () => {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        this.startBGM();
      }
      document.removeEventListener('click', startAudio);
    };
    document.addEventListener('click', startAudio);
  }

  startBGM() {
    if (!this.audioCtx) return;
    if (this.bgmNodes) this.stopBGM();

    // Create ambient dojo BGM using oscillators
    // Generates a meditative Japanese-style ambient sound
    const ctx = this.audioCtx;
    const masterGain = ctx.createGain();
    masterGain.gain.value = this.bgmVolume * 0.15;
    masterGain.connect(ctx.destination);

    const nodes = [];

    // Deep drone (base)
    const drone = ctx.createOscillator();
    drone.type = 'sine';
    drone.frequency.value = 110; // A2
    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.3;
    drone.connect(droneGain);
    droneGain.connect(masterGain);
    drone.start();
    nodes.push(drone);

    // Soft pad
    const pad = ctx.createOscillator();
    pad.type = 'triangle';
    pad.frequency.value = 220; // A3
    const padGain = ctx.createGain();
    padGain.gain.value = 0.1;
    pad.connect(padGain);
    padGain.connect(masterGain);
    pad.start();
    nodes.push(pad);

    // Gentle shimmer (pentatonic)
    const shimmer = ctx.createOscillator();
    shimmer.type = 'sine';
    shimmer.frequency.value = 330; // E4
    const shimmerGain = ctx.createGain();
    shimmerGain.gain.value = 0.05;
    shimmer.connect(shimmerGain);
    shimmerGain.connect(masterGain);
    shimmer.start();
    nodes.push(shimmer);

    // Animate shimmer frequency for gentle movement (pentatonic: A, C, D, E, G)
    const pentatonic = [220, 261.63, 293.66, 329.63, 392];
    let noteIdx = 0;
    this.bgmInterval = setInterval(() => {
      if (shimmer.frequency) {
        noteIdx = (noteIdx + 1) % pentatonic.length;
        shimmer.frequency.linearRampToValueAtTime(
          pentatonic[noteIdx],
          ctx.currentTime + 2
        );
      }
    }, 4000);

    // LFO for subtle volume modulation
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.15;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.05;
    lfo.connect(lfoGain);
    lfoGain.connect(masterGain.gain);
    lfo.start();
    nodes.push(lfo);

    this.bgmNodes = { nodes, masterGain };
  }

  stopBGM() {
    if (this.bgmInterval) clearInterval(this.bgmInterval);
    if (this.bgmNodes) {
      this.bgmNodes.nodes.forEach(n => { try { n.stop(); } catch(e) {} });
      this.bgmNodes = null;
    }
  }

  setBgmVolume(val) {
    this.bgmVolume = val / 100;
    $('bgm-volume-label').textContent = val + '%';
    if (this.bgmNodes && this.bgmNodes.masterGain) {
      this.bgmNodes.masterGain.gain.value = this.bgmVolume * 0.15;
    }
  }

  setSfxVolume(val) {
    this.sfxVolume = val / 100;
    $('sfx-volume-label').textContent = val + '%';
  }

  playSFX(type) {
    if (!this.audioCtx || this.sfxVolume === 0) return;
    const ctx = this.audioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.value = this.sfxVolume * 0.3;

    const sfxMap = {
      correct: { wave: 'sine', freq: 880, dur: 0.3 },
      wrong:   { wave: 'square', freq: 200, dur: 0.2 },
      hint:    { wave: 'triangle', freq: 523.25, dur: 0.25 }
    };
    const cfg = sfxMap[type];
    if (!cfg) return;

    osc.type = cfg.wave;
    osc.frequency.value = cfg.freq;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + cfg.dur);
    osc.start();
    osc.stop(ctx.currentTime + cfg.dur);
  }

  // ── UI Updates ──────────────────────────────────────────
  updateGameUI() {
    const chars = this.state.characters;
    const idx = this.state.currentCharIndex;
    const total = chars.length;
    const data = CHARACTER_DB[this.state.currentLevel];

    $('game-level-badge').textContent = data.name;
    $('char-counter').textContent = (idx + 1) + ' / ' + total;
    $('game-score').textContent = this.state.score;
    $('game-progress-bar').style.width = ((idx / total) * 100) + '%';
  }

  showStrokeFeedback(text, isCorrect) {
    const el = $('stroke-feedback');
    el.textContent = text;
    el.className = 'stroke-feedback ' + (isCorrect ? 'show-correct' : 'show-wrong');
    setTimeout(() => { el.className = 'stroke-feedback'; }, 600);
  }

  // ── Settings & Toggles ─────────────────────────────────
  toggleSettings() {
    const modal = $('settings-modal');
    modal.style.display = modal.style.display === 'none' ? 'flex' : 'none';
  }

  toggleAutoDemo(enabled) { this.state.showStrokeDemo = enabled; }
  toggleOutline(enabled) { this.state.showOutline = enabled; }
  toggleVoice(enabled) { this.voiceEnabled = enabled; }

  confirmQuit() { $('quit-modal').style.display = 'flex'; }
  closeQuitModal() { $('quit-modal').style.display = 'none'; }

  quitLevel() {
    $('quit-modal').style.display = 'none';
    this.cleanupWriters();
    this.showScreen('level-select');
  }

  quitToLobby() {
    $('quit-modal').style.display = 'none';
    this.cleanupWriters();
    this.showScreen('title-screen');
  }

  toggleLang() {
    this.lang = this.lang === 'zh' ? 'en' : 'zh';
    this.applyI18n();
  }

  applyI18n() {
    const dict = GAME_I18N[this.lang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) el.textContent = dict[key];
    });
    const langBtn = $('btn-lang');
    if (langBtn) langBtn.title = this.lang === 'zh' ? '語言 / Language' : 'Language / 語言';
  }

  cleanupWriters() {
    if (this.demoWriter) { $('hanzi-demo').innerHTML = ''; this.demoWriter = null; }
    if (this.quizWriter) { $('hanzi-quiz').innerHTML = ''; this.quizWriter = null; }
  }

  // ── Rules Screen ────────────────────────────────────────
  populateRules() {
    const listEl = $('rules-list');
    STROKE_RULES.forEach((rule, i) => {
      const item = document.createElement('div');
      item.className = 'rule-item';
      item.innerHTML =
        '<span class="rule-number">' + (i + 1) + '</span>' +
        '<div class="rule-text"><strong>' + rule.rule + '</strong><span>' + rule.ruleEn + '</span></div>' +
        '<span class="rule-example">' + rule.example + '</span>';
      listEl.appendChild(item);
    });

    const gridEl = $('stroke-grid');
    Object.entries(STROKE_TYPES).forEach(([key, val]) => {
      const item = document.createElement('div');
      item.className = 'stroke-item';
      item.innerHTML =
        '<div class="stroke-zh">' + val.zh + '</div>' +
        '<div class="stroke-en">' + val.en + ' (' + key + ')</div>';
      gridEl.appendChild(item);
    });
  }
}

// ── Initialize Game ─────────────────────────────────────
const game = new ShodoDojo();
