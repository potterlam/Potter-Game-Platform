/**
 * ScreenManager – controls which screen is visible,
 * handles 4-scene intro and cutscene overlays.
 */
class ScreenManager {
    constructor() {
        this.allScreens = [
            'mainMenuScreen','introScreen','rulesScreen','gameMenuScreen',
            'gameContainer','endingScreen'
        ];
        this.current = null;
    }

    show(id) {
        this.allScreens.forEach(s => {
            const el = document.getElementById(s);
            if (el) el.classList.remove('active');
        });
        const target = document.getElementById(id);
        if (target) { target.classList.add('active'); this.current = id; }
        // hide cutscene overlay
        const cs = document.getElementById('cutsceneOverlay');
        if (cs) cs.classList.remove('active');
    }

    /** Show a story cutscene overlay before a game */
    showCutscene(title, text, callback, charImg) {
        const overlay = document.getElementById('cutsceneOverlay');
        const csCard = overlay.querySelector('.cs-card');
        // Remove old character image if any
        const oldImg = csCard.querySelector('.cutscene-character');
        if (oldImg) oldImg.remove();
        // Add character image
        if (charImg) {
            const img = document.createElement('img');
            img.src = charImg;
            img.className = 'cutscene-character';
            img.alt = '';
            csCard.insertBefore(img, csCard.firstChild);
        }
        document.getElementById('csTitle').textContent = title;
        document.getElementById('csText').textContent  = text;
        overlay.classList.add('active');

        document.getElementById('csContinueBtn').onclick = () => {
            window.audioManager.playClick();
            overlay.classList.remove('active');
            if (callback) callback();
        };
    }
}

window.screenManager = null;
