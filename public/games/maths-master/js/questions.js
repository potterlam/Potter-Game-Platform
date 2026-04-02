/* ========================================
   QUESTION BANK SYSTEM
   Levels: 1=+/-, 2=×, 3=÷, 4=all
   Human-readable symbols: ＋ − × ÷
   ======================================== */

const QuestionBank = (() => {
    // Shuffle array in place
    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function randInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Generate a single question for a given operation
    function generateQuestion(op) {
        let a, b, answer, display;

        switch (op) {
            case '+': {
                a = randInt(1, 50);
                b = randInt(1, 50);
                answer = a + b;
                display = `${a} ＋ ${b} = ?`;
                break;
            }
            case '-': {
                a = randInt(1, 50);
                b = randInt(1, a); // ensure non-negative
                answer = a - b;
                display = `${a} − ${b} = ?`;
                break;
            }
            case '*': {
                a = randInt(2, 12);
                b = randInt(2, 12);
                answer = a * b;
                display = `${a} × ${b} = ?`;
                break;
            }
            case '/': {
                b = randInt(2, 12);
                answer = randInt(1, 12);
                a = b * answer; // ensure clean division
                display = `${a} ÷ ${b} = ?`;
                break;
            }
        }

        return { display, answer, a, b, op };
    }

    // Generate wrong answers that are plausible
    function generateWrongAnswers(correct, op) {
        const wrongs = new Set();
        const range = Math.max(5, Math.abs(correct));

        while (wrongs.size < 2) {
            let wrong;
            const strategy = Math.random();

            if (strategy < 0.3) {
                // Close to correct
                wrong = correct + randInt(1, 5) * (Math.random() < 0.5 ? 1 : -1);
            } else if (strategy < 0.6) {
                // Off by multiplication factor
                wrong = correct + randInt(1, 3) * (Math.random() < 0.5 ? 1 : -1);
            } else {
                // Random in range
                wrong = randInt(Math.max(0, correct - range), correct + range);
            }

            // Ensure wrong is non-negative, different from correct, and integer
            if (wrong !== correct && wrong >= 0 && Number.isInteger(wrong)) {
                wrongs.add(wrong);
            }
        }

        return [...wrongs];
    }

    // Generate a full set of 10 questions for a level
    function generateLevel(level) {
        const operations = {
            1: ['+', '-'],
            2: ['*'],
            3: ['/'],
            4: ['+', '-', '*', '/'],
        };

        const ops = operations[level] || operations[1];
        const questions = [];

        for (let i = 0; i < 10; i++) {
            const op = ops[Math.floor(Math.random() * ops.length)];
            const q = generateQuestion(op);
            const wrongs = generateWrongAnswers(q.answer, q.op);

            // Create 3 answer options, shuffle them
            const options = shuffle([q.answer, ...wrongs]);
            const correctIndex = options.indexOf(q.answer);

            questions.push({
                display: q.display,
                answer: q.answer,
                options,
                correctIndex,
                questionNum: i + 1,
            });
        }

        return questions;
    }

    // Generate boss fight questions (3 questions)
    function generateBossQuestions(level) {
        const operations = {
            1: ['+', '-'],
            2: ['*'],
            3: ['/'],
            4: ['+', '-', '*', '/'],
        };

        const ops = operations[level] || operations[1];
        const questions = [];

        for (let i = 0; i < 3; i++) {
            const op = ops[Math.floor(Math.random() * ops.length)];
            const q = generateQuestion(op);
            const wrongs = generateWrongAnswers(q.answer, q.op);
            const options = shuffle([q.answer, ...wrongs]);
            const correctIndex = options.indexOf(q.answer);

            questions.push({
                display: q.display,
                answer: q.answer,
                options,
                correctIndex,
            });
        }

        return questions;
    }

    return {
        generateLevel,
        generateBossQuestions,
    };
})();
