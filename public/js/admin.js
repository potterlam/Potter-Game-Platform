(function () {
  'use strict';

  let currentUser = null;
  let currentPage = 1;

  // --- Auth check ---
  async function init() {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'same-origin' });
      if (!res.ok) { window.location.href = '/login.html'; return; }
      const user = await res.json();
      if (user.role !== 'admin') { window.location.href = '/library.html'; return; }
      currentUser = user;
      loadUsers(1);
    } catch (err) {
      window.location.href = '/login.html';
    }
  }

  // --- Tab switching ---
  document.querySelectorAll('.admin-tabs button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.admin-tabs button').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.panel).classList.add('active');

      if (btn.dataset.panel === 'logs-panel') loadLogs();
    });
  });

  // --- Load users ---
  async function loadUsers(page) {
    currentPage = page;
    try {
      const res = await fetch(`/api/admin/users?page=${page}&limit=20`, { credentials: 'same-origin' });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();

      // Stats from server
      document.getElementById('stat-total').textContent = data.total;

      const tbody = document.getElementById('users-tbody');
      tbody.innerHTML = '';

      if (data.users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="loading-text">No users found</td></tr>';
        return;
      }

      document.getElementById('stat-admin').textContent = data.adminCount || 0;
      document.getElementById('stat-banned').textContent = data.bannedCount || 0;

      data.users.forEach(u => {

        const tr = document.createElement('tr');
        const isSelf = u.id === currentUser.id;
        tr.innerHTML = `
          <td>${u.id}</td>
          <td>${esc(u.displayName)}</td>
          <td>${esc(u.email)}</td>
          <td><span class="badge badge-${u.role}">${u.role}</span></td>
          <td><span class="badge ${u.isBanned ? 'badge-banned' : 'badge-active'}">${u.isBanned ? 'Banned' : 'Active'}</span></td>
          <td>${u.loginCount}${u.failedCount ? ' <span style="color:var(--danger)">(' + u.failedCount + ' fail)</span>' : ''}</td>
          <td>${u.lastLogin ? formatDate(u.lastLogin) : '—'}</td>
          <td>${formatDate(u.createdAt)}</td>
          <td>
            ${isSelf ? '<span style="color:var(--text-muted);font-size:12px">You</span>' : `
              <button class="action-btn danger" onclick="window._banUser(${u.id})">${u.isBanned ? 'Unban' : 'Ban'}</button>
              <button class="action-btn" onclick="window._promoteUser(${u.id})">${u.role === 'admin' ? 'Demote' : 'Promote'}</button>
            `}
          </td>
        `;
        tbody.appendChild(tr);
      });

      // Pagination
      const pag = document.getElementById('users-pagination');
      pag.innerHTML = '';
      if (data.totalPages > 1) {
        const prevBtn = document.createElement('button');
        prevBtn.textContent = '← Prev';
        prevBtn.disabled = page <= 1;
        prevBtn.onclick = () => loadUsers(page - 1);
        pag.appendChild(prevBtn);

        const info = document.createElement('span');
        info.className = 'page-info';
        info.textContent = `Page ${page} / ${data.totalPages}`;
        pag.appendChild(info);

        const nextBtn = document.createElement('button');
        nextBtn.textContent = 'Next →';
        nextBtn.disabled = page >= data.totalPages;
        nextBtn.onclick = () => loadUsers(page + 1);
        pag.appendChild(nextBtn);
      }
    } catch (err) {
      document.getElementById('users-tbody').innerHTML =
        '<tr><td colspan="9" class="loading-text">Failed to load users</td></tr>';
    }
  }

  // --- Load logs ---
  async function loadLogs() {
    try {
      const res = await fetch('/api/admin/logs?limit=100', { credentials: 'same-origin' });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();

      const tbody = document.getElementById('logs-tbody');
      tbody.innerHTML = '';

      if (data.logs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="loading-text">No logs</td></tr>';
        return;
      }

      data.logs.forEach(l => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${formatDate(l.createdAt)}</td>
          <td>${esc(l.email || '—')}</td>
          <td>${esc(l.displayName || '—')}</td>
          <td>${esc(l.ip || '—')}</td>
          <td><span class="badge ${l.success ? 'badge-success' : 'badge-fail'}">${l.success ? '✓ Success' : '✗ Failed'}</span></td>
        `;
        tbody.appendChild(tr);
      });
    } catch (err) {
      document.getElementById('logs-tbody').innerHTML =
        '<tr><td colspan="5" class="loading-text">Failed to load logs</td></tr>';
    }
  }

  // --- Actions ---
  window._banUser = async function (id) {
    if (!confirm('Toggle ban for this user?')) return;
    try {
      await fetch(`/api/admin/users/${id}/ban`, {
        method: 'POST', credentials: 'same-origin',
      });
      loadUsers(currentPage);
    } catch (e) { alert('Failed'); }
  };

  window._promoteUser = async function (id) {
    if (!confirm('Toggle admin role for this user?')) return;
    try {
      await fetch(`/api/admin/users/${id}/promote`, {
        method: 'POST', credentials: 'same-origin',
      });
      loadUsers(currentPage);
    } catch (e) { alert('Failed'); }
  };

  // --- Logout ---
  document.getElementById('logout-btn').addEventListener('click', async () => {
    try { await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' }); } catch (e) {}
    window.location.href = '/login.html';
  });

  // --- Helpers ---
  function esc(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function formatDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('en-HK', { year: 'numeric', month: 'short', day: 'numeric' })
      + ' ' + d.toLocaleTimeString('en-HK', { hour: '2-digit', minute: '2-digit' });
  }

  init();
})();
