(function () {
  'use strict';

  const loadingEl = document.getElementById('loading');
  const bookshelfArea = document.getElementById('bookshelf-area');
  const userInfo = document.getElementById('user-info');
  const adminLink = document.getElementById('admin-link');
  const logoutBtn = document.getElementById('logout-btn');

  // --- Auth check ---
  async function init() {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'same-origin' });
      if (!res.ok) {
        window.location.href = '/login.html';
        return;
      }
      const user = await res.json();

      // Show user info
      userInfo.textContent = 'Welcome, ' + user.displayName;
      if (user.role === 'admin') {
        adminLink.style.display = 'inline-block';
        const badge = document.createElement('span');
        badge.className = 'admin-badge';
        badge.textContent = 'ADMIN';
        userInfo.appendChild(document.createTextNode(' '));
        userInfo.appendChild(badge);
      }

      // Show bookshelf
      loadingEl.style.display = 'none';
      bookshelfArea.style.display = 'block';
    } catch (err) {
      window.location.href = '/login.html';
    }
  }

  // --- Book click ---
  document.querySelectorAll('.book').forEach(book => {
    book.addEventListener('click', () => {
      const href = book.dataset.href;
      if (href) window.location.href = href;
    });
  });

  // --- Logout ---
  logoutBtn.addEventListener('click', async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'same-origin',
      });
    } catch (e) {}
    window.location.href = '/login.html';
  });

  init();
})();
