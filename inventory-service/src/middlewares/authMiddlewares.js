const jwt = require("jsonwebtoken");

function authenticate(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });

    if (!decoded?.role) {
      return res.status(403).json({ message: "Token missing role" });
    }

    // Attach user info to request
    req.user = {
      id: decoded.adminId || decoded.sub || decoded.id,
      role: decoded.role,
      centreId: decoded.centreId || null, // super_admin may have null
    };

    next();
  });
}

function authorize(roles = []) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
}

module.exports = { authenticate, authorize };
