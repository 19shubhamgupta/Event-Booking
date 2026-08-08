const jwt = require("jsonwebtoken");

// Load private key from environment variable (base64 encoded)
const privateKey = Buffer.from(
  process.env.JWT_PRIVATE_KEY || "",
  "base64"
).toString("utf8");

const generateToken = (userId, email, organizationId, res) => {
  // Create JWT with user claims
  const token = jwt.sign(
    {
      userId: userId.toString(),
      email: email,
      organizationId: organizationId ? organizationId.toString() : null,
      type: "access",
    },
    privateKey,
    {
      algorithm: "RS256",
      expiresIn: "7d",
      issuer: "event-booking-platform",
      subject: userId.toString(),
    }
  );

  
  // Set HTTP-only cookie
  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return token;
};

module.exports = { generateToken };
