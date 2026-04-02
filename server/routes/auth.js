const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// --- Validation helpers ---
function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim()) && email.trim().length <= 255;
}

function validatePassword(password) {
  if (!password || typeof password !== 'string') return null;
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[a-z]/.test(password)) return 'Password must contain a lowercase letter';
  if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain a number';
  return null; // valid
}

function sanitizeString(str, maxLen) {
  if (!str || typeof str !== 'string') return '';
  return str.trim().slice(0, maxLen).replace(/[<>"'&]/g, '');
}

function setTokenCookie(res, user) {
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
}

// --- POST /api/auth/register ---
router.post('/register', async (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    // Validate
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    const pwError = validatePassword(password);
    if (pwError) {
      return res.status(400).json({ error: pwError });
    }
    const name = sanitizeString(displayName, 50);
    if (name.length < 1) {
      return res.status(400).json({ error: 'Display name is required (1-50 characters)' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if email exists
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Determine role
    const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const role = normalizedEmail === adminEmail ? 'admin' : 'user';

    // Insert user
    const result = await db.query(
      `INSERT INTO users (email, password_hash, display_name, role)
       VALUES ($1, $2, $3, $4) RETURNING id, email, display_name, role, created_at`,
      [normalizedEmail, passwordHash, name, role]
    );
    const user = result.rows[0];

    // Set JWT cookie
    setTokenCookie(res, user);

    // Log successful registration
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    await db.query(
      'INSERT INTO login_logs (user_id, ip, success) VALUES ($1, $2, true)',
      [user.id, ip]
    );

    res.status(201).json({
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      role: user.role,
    });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// --- POST /api/auth/login ---
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user
    const result = await db.query(
      'SELECT id, email, password_hash, display_name, role, is_banned, failed_login_attempts, locked_until FROM users WHERE email = $1',
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      // Generic error — don't reveal that user doesn't exist
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // Check if banned
    if (user.is_banned) {
      return res.status(403).json({ error: 'Account has been suspended. Contact admin.' });
    }

    // Check if locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      const mins = Math.ceil((new Date(user.locked_until) - new Date()) / 60000);
      return res.status(429).json({
        error: `Too many failed attempts. Try again in ${mins} minute(s).`,
      });
    }

    // Compare password
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      // Increment failed attempts
      const attempts = user.failed_login_attempts + 1;
      const lockUntil = attempts >= 5
        ? new Date(Date.now() + 15 * 60 * 1000) // lock 15 min
        : null;

      await db.query(
        'UPDATE users SET failed_login_attempts = $1, locked_until = $2 WHERE id = $3',
        [attempts, lockUntil, user.id]
      );

      // Log failed attempt
      await db.query(
        'INSERT INTO login_logs (user_id, ip, success) VALUES ($1, $2, false)',
        [user.id, ip]
      );

      if (lockUntil) {
        return res.status(429).json({
          error: 'Too many failed attempts. Account locked for 15 minutes.',
        });
      }

      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Success — reset failed attempts
    await db.query(
      'UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = $1',
      [user.id]
    );

    // Log success
    await db.query(
      'INSERT INTO login_logs (user_id, ip, success) VALUES ($1, $2, true)',
      [user.id, ip]
    );

    // Set JWT cookie
    setTokenCookie(res, user);

    res.json({
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      role: user.role,
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// --- POST /api/auth/logout ---
router.post('/logout', (req, res) => {
  res.clearCookie('token', { path: '/' });
  res.json({ message: 'Logged out' });
});

// --- GET /api/auth/me ---
router.get('/me', requireAuth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, email, display_name, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) {
      res.clearCookie('token', { path: '/' });
      return res.status(401).json({ error: 'User not found' });
    }
    const user = result.rows[0];
    res.json({
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      role: user.role,
      createdAt: user.created_at,
    });
  } catch (err) {
    console.error('Me error:', err.message);
    res.status(500).json({ error: 'Failed to fetch user info' });
  }
});

module.exports = router;
