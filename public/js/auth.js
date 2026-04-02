(function () {
  'use strict';

  // --- Check if already logged in ---
  fetch('/api/auth/me', { credentials: 'same-origin' })
    .then(r => { if (r.ok) window.location.href = '/library.html'; })
    .catch(() => {});

  // --- Tab switching ---
  const tabs = document.querySelectorAll('.auth-tab');
  const forms = document.querySelectorAll('.auth-form');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === target));
      forms.forEach(f => f.classList.toggle('active', f.id === target + '-form'));
      clearMessages();
    });
  });

  // --- Helpers ---
  function $(id) { return document.getElementById(id); }

  function showMessage(id, text, type) {
    const el = $(id);
    el.textContent = text;
    el.className = 'auth-message ' + type;
  }

  function clearMessages() {
    document.querySelectorAll('.auth-message').forEach(el => {
      el.className = 'auth-message';
      el.textContent = '';
    });
    document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
    document.querySelectorAll('input').forEach(el => el.classList.remove('invalid'));
  }

  function setLoading(btnId, loading) {
    const btn = $(btnId);
    if (loading) {
      btn.disabled = true;
      btn.dataset.text = btn.textContent;
      btn.innerHTML = '<span class="spinner"></span>Please wait...';
    } else {
      btn.disabled = false;
      btn.textContent = btn.dataset.text || btn.textContent;
    }
  }

  // --- Validation ---
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function getPasswordStrength(pw) {
    if (!pw) return { level: '', text: '' };
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (pw.length >= 12) score++;

    if (score <= 1) return { level: 'weak', text: 'Weak' };
    if (score <= 2) return { level: 'medium', text: 'Medium' };
    return { level: 'strong', text: 'Strong' };
  }

  // Password strength indicator
  const regPw = $('reg-password');
  if (regPw) {
    regPw.addEventListener('input', () => {
      const s = getPasswordStrength(regPw.value);
      $('pw-strength').className = 'pw-strength ' + s.level;
      const stEl = $('pw-strength-text');
      stEl.textContent = s.text;
      stEl.className = 'pw-strength-text ' + s.level;
    });
  }

  // --- Login ---
  $('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessages();

    const email = $('login-email').value.trim();
    const password = $('login-password').value;

    let hasError = false;
    if (!email || !isValidEmail(email)) {
      $('login-email-err').textContent = 'Enter a valid email';
      $('login-email').classList.add('invalid');
      hasError = true;
    }
    if (!password) {
      $('login-password-err').textContent = 'Password is required';
      $('login-password').classList.add('invalid');
      hasError = true;
    }
    if (hasError) return;

    setLoading('login-btn', true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        showMessage('login-msg', data.error || 'Login failed', 'error');
        return;
      }

      window.location.href = '/library.html';
    } catch (err) {
      showMessage('login-msg', 'Network error. Please try again.', 'error');
    } finally {
      setLoading('login-btn', false);
    }
  });

  // --- Register ---
  $('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessages();

    const displayName = $('reg-name').value.trim();
    const email = $('reg-email').value.trim();
    const password = $('reg-password').value;
    const confirm = $('reg-confirm').value;

    let hasError = false;

    if (!displayName || displayName.length < 1) {
      $('reg-name-err').textContent = 'Display name is required';
      $('reg-name').classList.add('invalid');
      hasError = true;
    }
    if (!email || !isValidEmail(email)) {
      $('reg-email-err').textContent = 'Enter a valid email';
      $('reg-email').classList.add('invalid');
      hasError = true;
    }
    if (!password || password.length < 8) {
      $('reg-password-err').textContent = 'At least 8 characters';
      $('reg-password').classList.add('invalid');
      hasError = true;
    } else if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      $('reg-password-err').textContent = 'Need uppercase, lowercase, and a number';
      $('reg-password').classList.add('invalid');
      hasError = true;
    }
    if (password !== confirm) {
      $('reg-confirm-err').textContent = 'Passwords do not match';
      $('reg-confirm').classList.add('invalid');
      hasError = true;
    }
    if (hasError) return;

    setLoading('register-btn', true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ email, password, displayName }),
      });
      const data = await res.json();

      if (!res.ok) {
        showMessage('register-msg', data.error || 'Registration failed', 'error');
        return;
      }

      window.location.href = '/library.html';
    } catch (err) {
      showMessage('register-msg', 'Network error. Please try again.', 'error');
    } finally {
      setLoading('register-btn', false);
    }
  });
})();
