const fs = require('fs');
const path = require('path');

const BACK_BUTTON_HTML = `
<!-- Injected by game-portal -->
<style>
  #gp-back-btn{position:fixed;top:12px;left:12px;z-index:99999;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
  #gp-back-btn a{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;background:rgba(0,0,0,0.7);color:#fff;text-decoration:none;border-radius:24px;font-size:14px;font-weight:500;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.15);transition:all 0.2s ease;box-shadow:0 2px 8px rgba(0,0,0,0.3)}
  #gp-back-btn a:hover{background:rgba(0,0,0,0.9);transform:scale(1.05)}
</style>
<div id="gp-back-btn">
  <a href="/library.html">
    <span style="font-size:16px">🏠</span>
    <span>返回書庫</span>
  </a>
</div>
`;

function gameInjector(gamesDir) {
  return (req, res, next) => {
    // Only intercept requests for game index.html files
    // Match: /games/some-game/ or /games/some-game/index.html
    const match = req.path.match(/^\/games\/([^/]+)\/(index\.html)?$/);
    if (!match) {
      return next();
    }

    const gameId = match[1];
    const filePath = path.join(gamesDir, gameId, 'index.html');

    fs.readFile(filePath, 'utf8', (err, html) => {
      if (err) {
        return next(); // Fall through to static serving or 404
      }

      // Inject the back button before </body>
      let injected;
      if (html.includes('</body>')) {
        injected = html.replace('</body>', BACK_BUTTON_HTML + '\n</body>');
      } else {
        injected = html + BACK_BUTTON_HTML;
      }

      res.set('Content-Type', 'text/html; charset=utf-8');
      res.send(injected);
    });
  };
}

module.exports = gameInjector;
