import jwt from 'jsonwebtoken';

// ProtectRoutes
export const protect = async (req, res, next) => {
  let token;

  // Get token from Authorization: Bearer <token>
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token || token === "null") {
    return res.status(401).json({ success: false, message: "Not authorized to access this route" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("Decoded token:", decoded);

    // IMPORTANT: Set req.user directly from token payload
    req.user = { id: decoded.id || decoded.uid };

    if (!req.user.id) {
      return res.status(401).json({ success: false, message: "Token missing user ID" });
    }

    next();
  } catch (err) {
    console.log(err.stack);
    return res.status(401).json({ success: false, message: "Not authorized to access this route" });
  }
};

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: `User role ${req.user.role} is not authorized to access this route` });
    }
    next();
  };
};
