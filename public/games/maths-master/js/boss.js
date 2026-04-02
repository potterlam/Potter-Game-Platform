/* ========================================
   BOSS FIGHT SYSTEM
   ======================================== */

const BossFight = (() => {
    let questions = [];
    let currentQ = 0;
    let bossHP = 3;
    let onComplete = null;
    let onFail = null;
    let answering = true;

    const bossNames = {
        1: 'DARK CALCULATOR',
        2: 'MULTIPLICATION MENACE',
        3: 'DIVISION DEMON',
        4: 'EMPEROR OF EQUATIONS',
    };

    const bossEmojis = {
        1: '👾',
        2: '🤖',
        3: '👹',
        4: '💀',
    };

    function start(level, completeCb, failCb) {
        questions = QuestionBank.generateBossQuestions(level);
        currentQ = 0;
        bossHP = 3;
        onComplete = completeCb;
        onFail = failCb;
        answering = true;

        // Update UI
        const bossChar = document.getElementById('boss-character');
        bossChar.textContent = bossEmojis[level] || '👾';
        bossChar.title = bossNames[level] || 'DARK BOSS';

        updateBossHP();
        showQuestion();
        setupAnswerButtons();
    }

    function showQuestion() {
        if (currentQ >= questions.length) {
            // Boss defeated
            if (onComplete) onComplete();
            return;
        }

        const q = questions[currentQ];
        document.getElementById('boss-question').textContent = q.display;

        const btns = document.querySelectorAll('.boss-answer-btn');
        btns.forEach((btn, i) => {
            btn.textContent = q.options[i];
            btn.className = 'boss-answer-btn';
            btn.disabled = false;
        });

        document.getElementById('boss-feedback').classList.add('hidden');
        answering = true;
    }

    function setupAnswerButtons() {
        const btns = document.querySelectorAll('.boss-answer-btn');
        btns.forEach((btn, i) => {
            // Remove old listeners by cloning
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);

            newBtn.addEventListener('click', () => {
                if (!answering) return;
                answering = false;
                handleAnswer(i);
            });
        });
    }

    function handleAnswer(selectedIdx) {
        const q = questions[currentQ];
        const correct = selectedIdx === q.correctIndex;
        const btns = document.querySelectorAll('.boss-answer-btn');
        const feedback = document.getElementById('boss-feedback');

        btns.forEach((btn, i) => {
            btn.disabled = true;
            if (i === q.correctIndex) {
                btn.classList.add('correct-flash');
            }
            if (i === selectedIdx && !correct) {
                btn.classList.add('wrong-flash');
            }
        });

        if (correct) {
            bossHP--;
            updateBossHP();
            AudioSystem.sfxBossHit();

            // Boss hit animation
            document.getElementById('boss-character').classList.add('boss-hit');
            document.getElementById('boss-jedi').classList.add('jedi-attack');

            feedback.textContent = '⚔️ CRITICAL HIT!';
            feedback.style.color = '#00ff66';
            feedback.classList.remove('hidden');

            setTimeout(() => {
                document.getElementById('boss-character').classList.remove('boss-hit');
                document.getElementById('boss-jedi').classList.remove('jedi-attack');
            }, 600);

            if (bossHP <= 0) {
                setTimeout(() => {
                    AudioSystem.sfxBossDefeat();
                    feedback.textContent = '💥 BOSS DEFEATED!';
                    feedback.style.color = '#ffd700';
                    setTimeout(() => {
                        if (onComplete) onComplete();
                    }, 1500);
                }, 800);
                return;
            }
        } else {
            AudioSystem.sfxWrong();
            feedback.textContent = `❌ The answer was ${q.answer}`;
            feedback.style.color = '#ff3333';
            feedback.classList.remove('hidden');

            // Boss didn't take damage, player takes a hit
            document.getElementById('boss-jedi').style.opacity = '0.5';
            setTimeout(() => {
                document.getElementById('boss-jedi').style.opacity = '1';
            }, 300);
        }

        // Next question
        currentQ++;
        setTimeout(() => {
            if (currentQ >= questions.length && bossHP > 0) {
                // Boss survived
                if (onFail) onFail();
            } else if (bossHP > 0) {
                showQuestion();
                setupAnswerButtons();
            }
        }, 1500);
    }

    function updateBossHP() {
        const fill = document.getElementById('boss-hp-fill');
        const pct = (bossHP / 3) * 100;
        fill.style.width = pct + '%';

        if (pct <= 33) {
            fill.style.background = 'linear-gradient(90deg, #ff3333, #ff6644)';
        } else if (pct <= 66) {
            fill.style.background = 'linear-gradient(90deg, #ff6644, #ffaa00)';
        } else {
            fill.style.background = 'linear-gradient(90deg, #ff3333, #ff6644)';
        }
    }

    return { start };
})();
