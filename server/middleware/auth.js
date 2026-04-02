const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const token = req.cookies?.token;
  if (!token) {
    // For API requests, return 401. For page/static requests, redirect.
    if (req.originalUrl.startsWith('/api/')) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    return res.redirect('/login.html');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.userId, role: decoded.role };
    next();
  } catch (err) {
    res.clearCookie('token');
    if (req.originalUrl.startsWith('/api/')) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    return res.redirect('/login.html');
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    if (req.originalUrl.startsWith('/api/')) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    return res.redirect('/library.html');
  }
  next();
}

module.exports = { requireAuth, requireAdmin };
