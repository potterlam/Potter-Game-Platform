const express = require('express');
const db = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// All admin routes require auth + admin
router.use(requireAuth, requireAdmin);

// --- GET /api/admin/users ---
router.get('/users', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const countResult = await db.query(
      `SELECT COUNT(*) AS total,
              COUNT(*) FILTER (WHERE role = 'admin') AS admin_count,
              COUNT(*) FILTER (WHERE is_banned = true) AS banned_count
       FROM users`
    );
    const total = parseInt(countResult.rows[0].total);
    const adminCount = parseInt(countResult.rows[0].admin_count);
    const bannedCount = parseInt(countResult.rows[0].banned_count);

    const result = await db.query(
      `SELECT u.id, u.email, u.display_name, u.role, u.is_banned, u.created_at,
              COUNT(l.id) FILTER (WHERE l.success = true) AS login_count,
              COUNT(l.id) FILTER (WHERE l.success = false) AS failed_count,
              MAX(l.created_at) FILTER (WHERE l.success = true) AS last_login
       FROM users u
       LEFT JOIN login_logs l ON l.user_id = u.id
       GROUP BY u.id
       ORDER BY u.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json({
      users: result.rows.map(u => ({
        id: u.id,
        email: u.email,
        displayName: u.display_name,
        role: u.role,
        isBanned: u.is_banned,
        createdAt: u.created_at,
        loginCount: parseInt(u.login_count) || 0,
        failedCount: parseInt(u.failed_count) || 0,
        lastLogin: u.last_login,
      })),
      total,
      adminCount,
      bannedCount,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('Admin users error:', err.message);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// --- POST /api/admin/users/:id/ban ---
router.post('/users/:id/ban', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (!userId || userId === req.user.id) {
      return res.status(400).json({ error: 'Cannot ban yourself' });
    }

    const result = await db.query(
      'UPDATE users SET is_banned = NOT is_banned WHERE id = $1 RETURNING id, is_banned',
      [userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: result.rows[0].id,
      isBanned: result.rows[0].is_banned,
    });
  } catch (err) {
    console.error('Admin ban error:', err.message);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// --- POST /api/admin/users/:id/promote ---
router.post('/users/:id/promote', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (!userId) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const result = await db.query(
      `UPDATE users SET role = CASE WHEN role = 'admin' THEN 'user' ELSE 'admin' END
       WHERE id = $1 RETURNING id, role`,
      [userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: result.rows[0].id,
      role: result.rows[0].role,
    });
  } catch (err) {
    console.error('Admin promote error:', err.message);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// --- GET /api/admin/logs ---
router.get('/logs', async (req, res) => {
  try {
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit) || 50));
    const result = await db.query(
      `SELECT l.id, l.user_id, u.email, u.display_name, l.ip, l.success, l.created_at
       FROM login_logs l
       LEFT JOIN users u ON u.id = l.user_id
       ORDER BY l.created_at DESC
       LIMIT $1`,
      [limit]
    );
    res.json({
      logs: result.rows.map(l => ({
        id: l.id,
        userId: l.user_id,
        email: l.email,
        displayName: l.display_name,
        ip: l.ip,
        success: l.success,
        createdAt: l.created_at,
      })),
    });
  } catch (err) {
    console.error('Admin logs error:', err.message);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

module.exports = router;
