const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("🔐 Decoded token:", decoded);

    // Assumiamo che il token contenga 'id'. Adatta se usi 'sub' o altro
    req.user = { id: decoded.id || decoded.sub || decoded.userId };

    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token." });
  }
};

module.exports = authMiddleware;
