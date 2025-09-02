const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const authHeader = req.headers["authorization"];
  console.log("👉 Raw Authorization Header:", authHeader);

  if (!authHeader) return res.status(401).json({ message: "Access denied. No token." });

  const token = authHeader.split(" ")[1];
  console.log("👉 Extracted Token:", token);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("👉 Decoded Token:", decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("👉 JWT Verification Error:", err.message);
    return res.status(403).json({ message: "Invalid or expired token." });
  }
};

// middleware/authMiddleware.js
// const jwt = require("jsonwebtoken");

// module.exports = (req, res, next) => {
//   const authHeader = req.headers["authorization"];
//   if (!authHeader) {
//     return res.status(401).json({ message: "Access denied. No token." });
//   }

//   const token = authHeader.split(" ")[1];
//   if (!token) {
//     return res.status(401).json({ message: "Access denied. Invalid token." });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // 🔥 Normalize so controllers can keep using req.user.id
//     req.user = { id: decoded.userId, email: decoded.email };

//     next();
//   } catch (err) {
//     console.error("JWT verification error:", err.message);
//     res.status(401).json({ message: "Invalid or expired token." });
//   }
// };
