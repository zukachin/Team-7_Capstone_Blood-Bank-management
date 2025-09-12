// src/middlewares/authMiddleware.js
require('dotenv').config();
const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Unauthorized: No token provided' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // STANDARDIZE: attach userId property so controllers can read req.user.userId
    req.user = { userId: payload.userId ?? payload.id ?? payload.sub };
    // if no userId found, reject
    if (!req.user.userId) {
      return res.status(401).json({ message: 'Unauthorized: No user in token' });
    }
    next();
  } catch (err) {
    console.error("requireAuth verify error:", err && err.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

module.exports = { requireAuth };
