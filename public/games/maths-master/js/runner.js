/* ========================================
   RUNNER GAME ENGINE
   Endless forward-running with 3 lanes
   ======================================== */

const Runner = (() => {
    let canvas, ctx;
    let width, height;
    let animFrame = null;
    let running = false;

    // Game state
    let jedi = { lane: 1, targetLane: 1, x: 0, y: 0, animFrame: 0 };
    let speed = 4;
    let scrollOffset = 0;
    let stars = [];
    let particles = [];
    let answerBoxes = [];
    let lanePositions = [];
    let onAnswerCollision = null;
    let flashEffect = null;
    let trailParticles = [];

    // Visual constants
    const LANE_COUNT = 3;
    const JEDI_SIZE = 50;
    const BOX_WIDTH = 100;
    const BOX_HEIGHT = 60;
    const STAR_COUNT = 150;

    function init(canvasEl) {
        canvas = canvasEl;
        ctx = canvas.getContext('2d');
        resize();
        window.addEventListener('resize', resize);
        generateStars();
    }

    function resize() {
        width = canvas.parentElement.clientWidth;
        height = canvas.parentElement.clientHeight;
        canvas.width = width;
        canvas.height = height;

        // Calculate lane positions (3 lanes in perspective)
        const laneWidth = width / LANE_COUNT;
        lanePositions = [];
        for (let i = 0; i < LANE_COUNT; i++) {
            lanePositions.push(laneWidth * i + laneWidth / 2);
        }

        // Update jedi position
        jedi.y = height - 120;
        updateJediX();
    }

    function generateStars() {
        stars = [];
        for (let i = 0; i < STAR_COUNT; i++) {
            stars.push({
                x: Math.random() * 2000,
                y: Math.random() * 2000,
                size: Math.random() * 2 + 0.5,
                speed: Math.random() * 2 + 0.5,
                brightness: Math.random(),
            });
        }
    }

    function updateJediX() {
        jedi.x = lanePositions[jedi.lane] || lanePositions[1];
    }

    function setLane(lane) {
        if (lane < 0 || lane >= LANE_COUNT) return;
        jedi.targetLane = lane;
        jedi.lane = lane;
        updateJediX();
    }

    function setAnswerBoxes(options, correctIndex) {
        answerBoxes = options.map((val, i) => ({
            value: val,
            lane: i,
            y: -BOX_HEIGHT,
            isCorrect: i === correctIndex,
            active: true,
            opacity: 1,
        }));
    }

    function clearAnswerBoxes() {
        answerBoxes = [];
    }

    function setCollisionCallback(cb) {
        onAnswerCollision = cb;
    }

    function triggerFlash(correct) {
        flashEffect = {
            correct,
            alpha: 0.4,
            decay: 0.015,
        };
    }

    // Add trail particles behind jedi
    function addTrailParticle() {
        trailParticles.push({
            x: jedi.x,
            y: jedi.y + JEDI_SIZE / 2,
            vx: (Math.random() - 0.5) * 1.5,
            vy: Math.random() * 2 + 1,
            life: 1,
            decay: 0.02 + Math.random() * 0.02,
            size: Math.random() * 3 + 1,
            color: `hsl(${200 + Math.random() * 40}, 100%, 70%)`,
        });
    }

    function addExplosion(x, y, color, count = 10) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const spd = Math.random() * 4 + 2;
            particles.push({
                x, y,
                vx: Math.cos(angle) * spd,
                vy: Math.sin(angle) * spd,
                life: 1,
                decay: 0.02 + Math.random() * 0.02,
                size: Math.random() * 4 + 2,
                color,
            });
        }
    }

    // -- DRAWING --

    function drawBackground() {
        // Space gradient
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, '#050520');
        grad.addColorStop(0.5, '#0a0a2e');
        grad.addColorStop(1, '#0d1033');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Stars
        stars.forEach(star => {
            const sx = ((star.x + scrollOffset * star.speed * 0.1) % width + width) % width;
            const sy = ((star.y + scrollOffset * star.speed * 0.3) % height + height) % height;
            const twinkle = 0.5 + 0.5 * Math.sin(scrollOffset * 0.01 + star.brightness * 10);
            ctx.fillStyle = `rgba(255, 255, 255, ${twinkle * 0.8})`;
            ctx.fillRect(sx, sy, star.size, star.size);
        });
    }

    function drawLanes() {
        // Lane lines (perspective-like)
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.1)';
        ctx.lineWidth = 1;

        for (let i = 0; i <= LANE_COUNT; i++) {
            const x = (width / LANE_COUNT) * i;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        // Lane dashes (moving)
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.15)';
        ctx.lineWidth = 2;
        ctx.setLineDash([20, 30]);
        ctx.lineDashOffset = -scrollOffset * 2;

        for (let i = 1; i < LANE_COUNT; i++) {
            const x = (width / LANE_COUNT) * i;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        ctx.setLineDash([]);

        // Ground line
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, height - 60);
        ctx.lineTo(width, height - 60);
        ctx.stroke();
    }

    function drawJedi() {
        const x = jedi.x;
        const y = jedi.y;
        const bobble = Math.sin(scrollOffset * 0.08) * 3;

        // Glow
        ctx.save();
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#00d4ff';

        // Body
        ctx.fillStyle = '#1a3a5c';
        ctx.fillRect(x - 12, y - 25 + bobble, 24, 35);

        // Robe/cloak
        ctx.fillStyle = '#0d2840';
        ctx.beginPath();
        ctx.moveTo(x - 15, y - 10 + bobble);
        ctx.lineTo(x - 18, y + 15 + bobble);
        ctx.lineTo(x + 18, y + 15 + bobble);
        ctx.lineTo(x + 15, y - 10 + bobble);
        ctx.closePath();
        ctx.fill();

        // Head
        ctx.fillStyle = '#e8c090';
        ctx.beginPath();
        ctx.arc(x, y - 30 + bobble, 12, 0, Math.PI * 2);
        ctx.fill();

        // Hood
        ctx.fillStyle = '#0d2840';
        ctx.beginPath();
        ctx.arc(x, y - 32 + bobble, 14, Math.PI, Math.PI * 2);
        ctx.fill();

        // Lightsaber
        const saberWave = Math.sin(scrollOffset * 0.1) * 5;
        ctx.strokeStyle = '#4488ff';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#4488ff';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.moveTo(x + 14, y - 15 + bobble);
        ctx.lineTo(x + 22 + saberWave, y - 45 + bobble);
        ctx.stroke();

        // Saber glow
        ctx.strokeStyle = 'rgba(68, 136, 255, 0.3)';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(x + 14, y - 15 + bobble);
        ctx.lineTo(x + 22 + saberWave, y - 45 + bobble);
        ctx.stroke();

        // Handle
        ctx.fillStyle = '#888';
        ctx.fillRect(x + 12, y - 16 + bobble, 5, 10);

        ctx.restore();

        // Running legs animation
        const legSwing = Math.sin(scrollOffset * 0.15) * 8;
        ctx.strokeStyle = '#1a3a5c';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x - 5, y + 10 + bobble);
        ctx.lineTo(x - 5 - legSwing, y + 25 + bobble);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 5, y + 10 + bobble);
        ctx.lineTo(x + 5 + legSwing, y + 25 + bobble);
        ctx.stroke();

        // Boots
        ctx.fillStyle = '#333';
        ctx.fillRect(x - 8 - legSwing, y + 22 + bobble, 8, 5);
        ctx.fillRect(x + 2 + legSwing, y + 22 + bobble, 8, 5);
    }

    function drawAnswerBoxes() {
        answerBoxes.forEach(box => {
            if (!box.active) return;

            const x = lanePositions[box.lane];
            const y = box.y;

            if (y < -BOX_HEIGHT || y > height + BOX_HEIGHT) return;

            ctx.save();
            ctx.globalAlpha = box.opacity;

            // Box background
            const grad = ctx.createLinearGradient(x - BOX_WIDTH / 2, y, x + BOX_WIDTH / 2, y + BOX_HEIGHT);
            grad.addColorStop(0, 'rgba(0, 212, 255, 0.15)');
            grad.addColorStop(1, 'rgba(180, 77, 255, 0.15)');
            ctx.fillStyle = grad;

            // Rounded rect
            const bx = x - BOX_WIDTH / 2;
            const by = y;
            const r = 12;
            ctx.beginPath();
            ctx.moveTo(bx + r, by);
            ctx.lineTo(bx + BOX_WIDTH - r, by);
            ctx.arcTo(bx + BOX_WIDTH, by, bx + BOX_WIDTH, by + r, r);
            ctx.lineTo(bx + BOX_WIDTH, by + BOX_HEIGHT - r);
            ctx.arcTo(bx + BOX_WIDTH, by + BOX_HEIGHT, bx + BOX_WIDTH - r, by + BOX_HEIGHT, r);
            ctx.lineTo(bx + r, by + BOX_HEIGHT);
            ctx.arcTo(bx, by + BOX_HEIGHT, bx, by + BOX_HEIGHT - r, r);
            ctx.lineTo(bx, by + r);
            ctx.arcTo(bx, by, bx + r, by, r);
            ctx.closePath();
            ctx.fill();

            // Border
            ctx.strokeStyle = 'rgba(0, 212, 255, 0.5)';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Glow
            ctx.shadowBlur = 10;
            ctx.shadowColor = 'rgba(0, 212, 255, 0.3)';
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Text
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 24px "Orbitron", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(box.value, x, y + BOX_HEIGHT / 2);

            ctx.restore();
        });
    }

    function drawTrail() {
        trailParticles.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life * 0.5;
            ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        });
        ctx.globalAlpha = 1;
    }

    function drawParticles() {
        particles.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
    }

    function drawFlash() {
        if (!flashEffect) return;
        ctx.fillStyle = flashEffect.correct
            ? `rgba(0, 255, 102, ${flashEffect.alpha})`
            : `rgba(255, 51, 51, ${flashEffect.alpha})`;
        ctx.fillRect(0, 0, width, height);
    }

    // -- UPDATE --

    function update() {
        scrollOffset += speed;

        // Move answer boxes downward
        answerBoxes.forEach(box => {
            if (box.active) {
                box.y += speed;

                // Check collision with jedi
                if (
                    box.lane === jedi.lane &&
                    box.y + BOX_HEIGHT > jedi.y - 30 &&
                    box.y < jedi.y + 20 &&
                    box.active
                ) {
                    box.active = false;
                    if (onAnswerCollision) {
                        onAnswerCollision(box.isCorrect, box.value);
                    }

                    if (box.isCorrect) {
                        addExplosion(jedi.x, jedi.y, '#00ff66', 15);
                        triggerFlash(true);
                    } else {
                        addExplosion(jedi.x, jedi.y, '#ff3333', 12);
                        triggerFlash(false);
                    }
                }
            }
        });

        // Trail particles
        if (running && Math.random() < 0.4) {
            addTrailParticle();
        }

        trailParticles.forEach(p => {
            p.y += p.vy;
            p.x += p.vx;
            p.life -= p.decay;
        });
        trailParticles = trailParticles.filter(p => p.life > 0);

        // Particles
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= p.decay;
            p.vx *= 0.98;
            p.vy *= 0.98;
        });
        particles = particles.filter(p => p.life > 0);

        // Flash
        if (flashEffect) {
            flashEffect.alpha -= flashEffect.decay;
            if (flashEffect.alpha <= 0) flashEffect = null;
        }
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);
        drawBackground();
        drawLanes();
        drawTrail();
        drawAnswerBoxes();
        drawJedi();
        drawParticles();
        drawFlash();
    }

    function loop() {
        if (!running) return;
        update();
        draw();
        animFrame = requestAnimationFrame(loop);
    }

    function start() {
        running = true;
        scrollOffset = 0;
        jedi.lane = 1;
        jedi.targetLane = 1;
        updateJediX();
        particles = [];
        trailParticles = [];
        answerBoxes = [];
        flashEffect = null;
        resize();
        loop();
    }

    function stop() {
        running = false;
        if (animFrame) {
            cancelAnimationFrame(animFrame);
            animFrame = null;
        }
    }

    function setSpeed(s) {
        speed = s;
    }

    return {
        init,
        start,
        stop,
        setLane,
        setAnswerBoxes,
        clearAnswerBoxes,
        setCollisionCallback,
        setSpeed,
        resize,
    };
})();
