// src/middlewares/authMiddlewares.js
const jwt = require("jsonwebtoken");

function authenticate(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });

    // Expect the token to carry role and centreId
    // e.g. { sub: 'userId', role: 'Admin'|'SuperAdmin', centreId: 'A' }
    if (!user?.role || !user?.centreId) {
      return res.status(403).json({ message: "Token missing role/centreId" });
    }

    req.user = {
      id: user.sub || user.id,
      role: user.role,
      centreId: user.centreId,
    };
    next();
  });
}

module.exports = { authenticate };
