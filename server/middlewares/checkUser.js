const User = require("../models/user");
const jwt = require("jsonwebtoken");

exports.checkUser = async (req, res, next) => {
  try {
    const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  if (!decoded || !decoded.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await User.findById(decoded.userId).select("-password");
    
  req.user = user
  next();
    
  } catch (error) {
    
    res.status(500).json({ message: "Internal Server Error" });
  }

};
