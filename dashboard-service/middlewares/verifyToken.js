const jwt = require("jsonwebtoken");

// Lazy load public key (loaded when first request comes, after dotenv.config)
let publicKey = null;

const getPublicKey = () => {
  if (!publicKey) {
    publicKey = Buffer.from(
      process.env.JWT_PUBLIC_KEY || "",
      "base64"
    ).toString("utf8");

    if (!publicKey || publicKey.trim() === "") {
      throw new Error("JWT_PUBLIC_KEY not configured in environment variables");
    }
  }
  return publicKey;
};

const verifyToken = (req, res, next) => {
  try {
    // Get token from cookie or Authorization header
    const token =
      req.cookies.token || req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    // Verify JWT using public key (no User Service call needed!)
    const decoded = jwt.verify(token, getPublicKey(), {
      algorithms: ["RS256"],
      issuer: "event-booking-platform",
    });

    // Attach user info to request object
    req.user = {
      _id: decoded.userId,
      userId: decoded.userId,
      email: decoded.email,
      organizationId: decoded.organizationId,
    };

    next();
  } catch (error) {
    console.error("Token verification error:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

module.exports = { verifyToken };
