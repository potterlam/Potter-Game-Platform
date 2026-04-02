/**
 * App Initialisation
 */
window.gameState = {
    currentLanguage: 'zh',
    practiceMode: 'pastTense', // 'pastTense' or 'extension'
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

document.addEventListener('DOMContentLoaded', () => {
    // Fake loading screen
    setTimeout(() => {
        document.getElementById('loadingScreen').classList.add('hidden');
        window.gameSystem = new GameSystem();
        window.gameSystem.showMainMenu();
    }, 1200);
});
