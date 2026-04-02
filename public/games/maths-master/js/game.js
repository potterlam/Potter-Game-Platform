/* ========================================
   MAIN GAME CONTROLLER
   ======================================== */

const Game = (() => {
    // State
    let currentLevel = 1;
    let questions = [];
    let currentQuestion = 0;
    let score = 0;
    let streak = 0;
    let bestStreak = 0;
    let correctCount = 0;
    let totalAnswered = 0;
    let levelsCompleted = new Set();
    let equipmentUnlocked = [];
    let questionActive = false;
    let questionDelay = null;
    let totalScore = 0;
    let totalCorrect = 0;
    let totalQuestions = 0;

    // Equipment progression per level
    const EQUIPMENT = {
        1: [
            { id: 'helmet', icon: '⛑️', name: 'Padawan Helmet', slot: 'equip-helmet' },
            { id: 'saber', icon: '🔵', name: 'Training Saber', slot: 'equip-saber' },
        ],
        2: [
            { id: 'armor', icon: '🛡️', name: 'Knight Armor', slot: 'equip-armor' },
            { id: 'saber2', icon: '💚', name: 'Green Lightsaber', slot: 'equip-saber' },
        ],
        3: [
            { id: 'boots', icon: '👟', name: 'Force Boots', slot: 'equip-boots' },
            { id: 'saber3', icon: '💜', name: 'Purple Lightsaber', slot: 'equip-saber' },
        ],
        4: [
            { id: 'force', icon: '⚡', name: 'Force Mastery', slot: 'equip-force' },
            { id: 'saber4', icon: '🌟', name: 'Golden Lightsaber', slot: 'equip-saber' },
        ],
    };

    // Milestones for equipment unlock (after question # correct)
    const EQUIP_MILESTONES = [3, 7]; // unlock 1st at 3 correct, 2nd at 7 correct

    // DOM references
    const $ = (id) => document.getElementById(id);

    function init() {
        // Init audio on first interaction
        document.addEventListener('click', () => AudioSystem.init(), { once: true });
        document.addEventListener('keydown', () => AudioSystem.init(), { once: true });

        // Init canvas
        Runner.init($('game-canvas'));

        // Setup event listeners
        setupNavigation();
        setupGameControls();
        setupLevelCards();

        // Load progress
        loadProgress();
    }

    function setupNavigation() {
        $('btn-start').addEventListener('click', () => {
            AudioSystem.sfxClick();
            showScreen('level-screen');
        });

        $('btn-how-to-play').addEventListener('click', () => {
            AudioSystem.sfxClick();
            showScreen('howto-screen');
        });

        $('btn-back-title').addEventListener('click', () => {
            AudioSystem.sfxClick();
            showScreen('title-screen');
        });

        $('btn-back-title2').addEventListener('click', () => {
            AudioSystem.sfxClick();
            showScreen('title-screen');
        });

        $('btn-next-level').addEventListener('click', () => {
            AudioSystem.sfxClick();
            if (currentLevel < 4) {
                currentLevel++;
                startLevel(currentLevel);
            } else {
                showFinalVictory();
            }
        });

        $('btn-back-levels').addEventListener('click', () => {
            AudioSystem.sfxClick();
            AudioSystem.stopBgm();
            showScreen('level-screen');
        });

        $('btn-retry').addEventListener('click', () => {
            AudioSystem.sfxClick();
            startLevel(currentLevel);
        });

        $('btn-go-levels').addEventListener('click', () => {
            AudioSystem.sfxClick();
            AudioSystem.stopBgm();
            showScreen('level-screen');
        });

        $('btn-play-again').addEventListener('click', () => {
            AudioSystem.sfxClick();
            AudioSystem.stopBgm();
            // Reset all progress
            levelsCompleted.clear();
            totalScore = 0;
            totalCorrect = 0;
            totalQuestions = 0;
            saveProgress();
            updateLevelCards();
            showScreen('level-screen');
        });
    }

    function setupGameControls() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (!$('game-screen').classList.contains('active')) return;

            switch (e.key.toLowerCase()) {
                case 'a':
                case 'arrowleft':
                    Runner.setLane(0);
                    AudioSystem.sfxSwitch();
                    break;
                case 's':
                case 'arrowdown':
                    Runner.setLane(1);
                    AudioSystem.sfxSwitch();
                    break;
                case 'd':
                case 'arrowright':
                    Runner.setLane(2);
                    AudioSystem.sfxSwitch();
                    break;
            }
        });

        // Touch/click controls
        document.querySelectorAll('.lane-zone').forEach(zone => {
            zone.addEventListener('click', () => {
                if (!$('game-screen').classList.contains('active')) return;
                const lane = parseInt(zone.dataset.lane);
                Runner.setLane(lane);
                AudioSystem.sfxSwitch();
            });
        });
    }

    function setupLevelCards() {
        document.querySelectorAll('.level-card').forEach(card => {
            card.addEventListener('click', () => {
                const level = parseInt(card.dataset.level);
                if (card.classList.contains('locked')) return;
                AudioSystem.sfxClick();
                currentLevel = level;
                startLevel(level);
            });
        });
    }

    function updateLevelCards() {
        document.querySelectorAll('.level-card').forEach(card => {
            const level = parseInt(card.dataset.level);

            // Remove existing states
            card.classList.remove('locked', 'completed');
            const lockOverlay = card.querySelector('.lock-overlay');

            if (levelsCompleted.has(level)) {
                card.classList.add('completed');
                if (lockOverlay) lockOverlay.style.display = 'none';
            } else if (level === 1 || levelsCompleted.has(level - 1)) {
                // Unlocked
                if (lockOverlay) lockOverlay.style.display = 'none';
            } else {
                card.classList.add('locked');
                if (lockOverlay) lockOverlay.style.display = '';
            }
        });
    }

    function showScreen(id) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        $(id).classList.add('active');

        if (id === 'level-screen') {
            updateLevelCards();
        }
    }

    // ---------- GAME FLOW ----------

    function startLevel(level) {
        currentLevel = level;
        questions = QuestionBank.generateLevel(level);
        currentQuestion = 0;
        score = 0;
        streak = 0;
        bestStreak = 0;
        correctCount = 0;
        totalAnswered = 0;
        equipmentUnlocked = [];
        questionActive = false;

        // Reset equipment display
        document.querySelectorAll('.equip-slot').forEach(s => {
            s.classList.remove('unlocked');
        });

        // Update HUD
        const levelNames = { 1: 'LEVEL 1 — ＋ −', 2: 'LEVEL 2 — ×', 3: 'LEVEL 3 — ÷', 4: 'LEVEL 4 — ＋ − × ÷' };
        $('hud-level').textContent = levelNames[level] || `LEVEL ${level}`;
        $('score-value').textContent = '0';
        $('streak-value').textContent = '0';
        $('hud-qnum').textContent = '1';

        // Show game screen
        showScreen('game-screen');

        // Start BGM
        AudioSystem.startBgm('space');

        // Start runner
        Runner.setSpeed(3 + level * 0.5);
        Runner.start();

        // Start first question after a brief delay
        Runner.setCollisionCallback(handleCollision);
        setTimeout(() => presentQuestion(0), 1500);
    }

    function presentQuestion(index) {
        if (index >= questions.length) {
            // All questions done - go to boss fight
            Runner.stop();
            setTimeout(() => startBoss(), 500);
            return;
        }

        currentQuestion = index;
        const q = questions[index];

        // Update HUD
        $('hud-question').textContent = q.display;
        $('hud-qnum').textContent = q.questionNum;

        // Set answer boxes in runner
        questionActive = true;
        Runner.setAnswerBoxes(q.options, q.correctIndex);
    }

    function handleCollision(isCorrect, value) {
        if (!questionActive) return;
        questionActive = false;
        totalAnswered++;

        if (isCorrect) {
            correctCount++;
            streak++;
            if (streak > bestStreak) bestStreak = streak;

            // Score calculation (bonus for streaks)
            const basePoints = 100;
            const streakBonus = Math.min(streak - 1, 5) * 20;
            const earned = basePoints + streakBonus;
            score += earned;

            $('score-value').textContent = score;
            $('streak-value').textContent = streak;

            AudioSystem.sfxCorrect();
            showFeedback(true, `+${earned}`, streak > 1 ? `🔥 ${streak} STREAK!` : '');

            // Check equipment unlock
            checkEquipmentUnlock();

        } else {
            streak = 0;
            $('streak-value').textContent = '0';

            AudioSystem.sfxWrong();
            const q = questions[currentQuestion];
            showFeedback(false, `Answer: ${q.answer}`, '');
        }

        // Clear boxes and present next question
        if (questionDelay) clearTimeout(questionDelay);
        questionDelay = setTimeout(() => {
            Runner.clearAnswerBoxes();
            presentQuestion(currentQuestion + 1);
        }, 2000);
    }

    function showFeedback(correct, text, subtext) {
        const overlay = $('feedback-overlay');
        const icon = $('feedback-icon');
        const textEl = $('feedback-text');

        overlay.className = correct ? 'correct' : 'wrong';
        icon.textContent = correct ? '✅' : '❌';
        textEl.innerHTML = `${text}${subtext ? '<br><small>' + subtext + '</small>' : ''}`;

        overlay.classList.remove('hidden');

        setTimeout(() => {
            overlay.classList.add('hidden');
        }, 1500);
    }

    function checkEquipmentUnlock() {
        const levelEquip = EQUIPMENT[currentLevel] || [];

        EQUIP_MILESTONES.forEach((milestone, i) => {
            if (correctCount === milestone && i < levelEquip.length) {
                const equip = levelEquip[i];
                equipmentUnlocked.push(equip);
                unlockEquipment(equip);
            }
        });
    }

    function unlockEquipment(equip) {
        // Update slot visual
        const slot = $(equip.slot);
        if (slot) {
            slot.classList.add('unlocked');
            slot.querySelector('.equip-icon').textContent = equip.icon;
        }

        // Show notification
        const notif = $('equip-notification');
        $('equip-notif-icon').textContent = equip.icon;
        $('equip-notif-text').textContent = `${equip.name} Unlocked!`;
        notif.classList.remove('hidden');

        AudioSystem.sfxEquipUnlock();

        setTimeout(() => {
            notif.classList.add('hidden');
        }, 2500);
    }

    // ---------- BOSS FIGHT ----------

    function startBoss() {
        showScreen('boss-screen');
        AudioSystem.startBgm('boss');

        BossFight.start(
            currentLevel,
            () => onBossDefeated(),
            () => onBossSurvived()
        );
    }

    function onBossDefeated() {
        levelsCompleted.add(currentLevel);
        totalScore += score;
        totalCorrect += correctCount;
        totalQuestions += 10;
        saveProgress();

        AudioSystem.stopBgm();
        AudioSystem.sfxVictory();

        setTimeout(() => {
            if (currentLevel >= 4) {
                showFinalVictory();
            } else {
                showLevelVictory();
            }
        }, 1000);
    }

    function onBossSurvived() {
        AudioSystem.stopBgm();
        AudioSystem.sfxGameOver();

        setTimeout(() => {
            $('go-score').textContent = score;
            $('go-answered').textContent = totalAnswered;
            showScreen('gameover-screen');
        }, 1000);
    }

    function showLevelVictory() {
        AudioSystem.startBgm('victory');

        $('v-score').textContent = score;
        $('v-accuracy').textContent = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
        $('v-streak').textContent = bestStreak;

        // Show equipment
        const equipList = $('v-equip-list');
        equipList.innerHTML = '';
        equipmentUnlocked.forEach(e => {
            const span = document.createElement('span');
            span.textContent = e.icon;
            span.title = e.name;
            equipList.appendChild(span);
        });

        if (equipmentUnlocked.length === 0) {
            equipList.textContent = 'Keep practicing!';
            equipList.style.fontSize = '0.9rem';
        } else {
            equipList.style.fontSize = '';
        }

        showScreen('victory-screen');
    }

    function showFinalVictory() {
        AudioSystem.stopBgm();
        AudioSystem.startBgm('victory');
        AudioSystem.sfxVictory();

        $('f-total-score').textContent = totalScore + score;
        const allCorrect = totalCorrect + correctCount;
        const allQ = totalQuestions + 10;
        $('f-accuracy').textContent = allQ > 0 ? Math.round((allCorrect / allQ) * 100) : 0;

        // Showcase all equipment
        const showcase = $('final-equip-showcase');
        showcase.innerHTML = '';
        Object.values(EQUIPMENT).flat().forEach(e => {
            const span = document.createElement('span');
            span.textContent = e.icon;
            span.title = e.name;
            showcase.appendChild(span);
        });

        showScreen('final-screen');
    }

    // ---------- PERSISTENCE ----------

    function saveProgress() {
        try {
            const data = {
                levelsCompleted: [...levelsCompleted],
                totalScore,
                totalCorrect,
                totalQuestions,
            };
            localStorage.setItem('mathsmaster_progress', JSON.stringify(data));
        } catch (e) {
            // Storage not available
        }
    }

    function loadProgress() {
        try {
            const raw = localStorage.getItem('mathsmaster_progress');
            if (raw) {
                const data = JSON.parse(raw);
                levelsCompleted = new Set(data.levelsCompleted || []);
                totalScore = data.totalScore || 0;
                totalCorrect = data.totalCorrect || 0;
                totalQuestions = data.totalQuestions || 0;
            }
        } catch (e) {
            // Invalid data, reset
            levelsCompleted = new Set();
        }
        updateLevelCards();
    }

    return { init };
})();

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    Game.init();
});
