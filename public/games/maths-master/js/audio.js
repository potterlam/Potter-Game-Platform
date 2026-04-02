/* ========================================
   AUDIO SYSTEM - Web Audio API BGM & SFX
   ======================================== */

const AudioSystem = (() => {
    let audioCtx = null;
    let masterGain = null;
    let bgmGain = null;
    let sfxGain = null;
    let currentBgm = null;
    let bgmPlaying = false;

    function init() {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = audioCtx.createGain();
        masterGain.gain.value = 0.5;
        masterGain.connect(audioCtx.destination);

        bgmGain = audioCtx.createGain();
        bgmGain.gain.value = 0.3;
        bgmGain.connect(masterGain);

        sfxGain = audioCtx.createGain();
        sfxGain.gain.value = 0.6;
        sfxGain.connect(masterGain);
    }

    function ensureCtx() {
        if (!audioCtx) init();
        if (audioCtx.state === 'suspended') audioCtx.resume();
    }

    // Generate a simple tone
    function playTone(freq, duration, type = 'sine', gainVal = 0.3, target = sfxGain) {
        ensureCtx();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.value = gainVal;
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(target);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + duration);
    }

    // Play a sequence of notes
    function playMelody(notes, target = sfxGain) {
        ensureCtx();
        let time = audioCtx.currentTime;
        notes.forEach(([freq, dur, type = 'sine', vol = 0.2]) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = type;
            osc.frequency.value = freq;
            gain.gain.value = vol;
            gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
            osc.connect(gain);
            gain.connect(target);
            osc.start(time);
            osc.stop(time + dur);
            time += dur * 0.8;
        });
    }

    // BGM: space ambient loop
    function startBgm(theme = 'space') {
        ensureCtx();
        stopBgm();
        bgmPlaying = true;

        const themes = {
            space: () => loopSpaceBgm(),
            boss: () => loopBossBgm(),
            victory: () => loopVictoryBgm(),
        };

        (themes[theme] || themes.space)();
    }

    function loopSpaceBgm() {
        if (!bgmPlaying) return;
        const now = audioCtx.currentTime;

        // Deep bass drone
        const bass = audioCtx.createOscillator();
        const bassG = audioCtx.createGain();
        bass.type = 'sine';
        bass.frequency.value = 55;
        bassG.gain.value = 0.15;
        bass.connect(bassG);
        bassG.connect(bgmGain);
        bass.start(now);
        bass.stop(now + 4);
        bassG.gain.exponentialRampToValueAtTime(0.001, now + 4);

        // Pad chords
        [130.81, 164.81, 196].forEach((freq, i) => {
            const osc = audioCtx.createOscillator();
            const g = audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.value = freq;
            g.gain.value = 0.06;
            osc.connect(g);
            g.connect(bgmGain);
            osc.start(now + i * 0.1);
            osc.stop(now + 3.5);
            g.gain.exponentialRampToValueAtTime(0.001, now + 3.5);
        });

        // High sparkle
        const sparkle = audioCtx.createOscillator();
        const sG = audioCtx.createGain();
        sparkle.type = 'sine';
        sparkle.frequency.value = 880 + Math.random() * 440;
        sG.gain.value = 0.03;
        sparkle.connect(sG);
        sG.connect(bgmGain);
        sparkle.start(now + 1);
        sparkle.stop(now + 2);
        sG.gain.exponentialRampToValueAtTime(0.001, now + 2);

        currentBgm = setTimeout(() => loopSpaceBgm(), 3800);
    }

    function loopBossBgm() {
        if (!bgmPlaying) return;
        const now = audioCtx.currentTime;

        // Aggressive bass
        const bass = audioCtx.createOscillator();
        const bG = audioCtx.createGain();
        bass.type = 'sawtooth';
        bass.frequency.value = 55;
        bG.gain.value = 0.12;
        bass.connect(bG);
        bG.connect(bgmGain);
        bass.start(now);
        bass.stop(now + 0.3);
        bG.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        // Staccato hits
        [0, 0.4, 0.8, 1.0, 1.4].forEach((t) => {
            const osc = audioCtx.createOscillator();
            const g = audioCtx.createGain();
            osc.type = 'square';
            osc.frequency.value = 110;
            g.gain.value = 0.08;
            osc.connect(g);
            g.connect(bgmGain);
            osc.start(now + t);
            osc.stop(now + t + 0.15);
            g.gain.exponentialRampToValueAtTime(0.001, now + t + 0.15);
        });

        // Tension melody
        [329.63, 311.13, 293.66, 277.18].forEach((freq, i) => {
            const osc = audioCtx.createOscillator();
            const g = audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.value = freq;
            g.gain.value = 0.06;
            osc.connect(g);
            g.connect(bgmGain);
            osc.start(now + i * 0.5);
            osc.stop(now + i * 0.5 + 0.4);
            g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.5 + 0.4);
        });

        currentBgm = setTimeout(() => loopBossBgm(), 1900);
    }

    function loopVictoryBgm() {
        if (!bgmPlaying) return;
        const now = audioCtx.currentTime;

        // Triumphant chord
        [261.63, 329.63, 392, 523.25].forEach((freq, i) => {
            const osc = audioCtx.createOscillator();
            const g = audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.value = freq;
            g.gain.value = 0.08;
            osc.connect(g);
            g.connect(bgmGain);
            osc.start(now + i * 0.15);
            osc.stop(now + 3);
            g.gain.exponentialRampToValueAtTime(0.001, now + 3);
        });

        currentBgm = setTimeout(() => loopVictoryBgm(), 3500);
    }

    function stopBgm() {
        bgmPlaying = false;
        if (currentBgm) {
            clearTimeout(currentBgm);
            currentBgm = null;
        }
    }

    // SFX functions
    function sfxCorrect() {
        playMelody([
            [523.25, 0.12, 'sine', 0.3],
            [659.25, 0.12, 'sine', 0.3],
            [783.99, 0.25, 'sine', 0.25],
        ]);
    }

    function sfxWrong() {
        playMelody([
            [200, 0.15, 'sawtooth', 0.2],
            [150, 0.3, 'sawtooth', 0.15],
        ]);
    }

    function sfxEquipUnlock() {
        playMelody([
            [440, 0.1, 'sine', 0.2],
            [554.37, 0.1, 'sine', 0.2],
            [659.25, 0.1, 'sine', 0.25],
            [880, 0.3, 'triangle', 0.2],
        ]);
    }

    function sfxBossHit() {
        playTone(100, 0.3, 'sawtooth', 0.3);
        setTimeout(() => playTone(80, 0.2, 'square', 0.2), 100);
    }

    function sfxBossDefeat() {
        playMelody([
            [200, 0.2, 'sawtooth', 0.2],
            [160, 0.2, 'sawtooth', 0.2],
            [120, 0.3, 'sawtooth', 0.15],
            [80, 0.5, 'sawtooth', 0.1],
        ]);
    }

    function sfxVictory() {
        playMelody([
            [392, 0.15, 'sine', 0.25],
            [523.25, 0.15, 'sine', 0.25],
            [659.25, 0.15, 'sine', 0.25],
            [783.99, 0.15, 'sine', 0.25],
            [1046.50, 0.4, 'triangle', 0.2],
        ]);
    }

    function sfxClick() {
        playTone(800, 0.08, 'sine', 0.15);
    }

    function sfxSwitch() {
        playTone(600, 0.06, 'sine', 0.12);
    }

    function sfxGameOver() {
        playMelody([
            [300, 0.3, 'sawtooth', 0.2],
            [250, 0.3, 'sawtooth', 0.18],
            [200, 0.3, 'sawtooth', 0.15],
            [150, 0.6, 'sawtooth', 0.1],
        ]);
    }

    return {
        init,
        startBgm,
        stopBgm,
        sfxCorrect,
        sfxWrong,
        sfxEquipUnlock,
        sfxBossHit,
        sfxBossDefeat,
        sfxVictory,
        sfxClick,
        sfxSwitch,
        sfxGameOver,
    };
})();
