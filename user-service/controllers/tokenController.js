const { generateToken } = require("../lib/generateToken");
const user = require("../models/user");

exports.refreshToken = async (req, res) => {
  try {
    // req.user comes from verifyToken middleware (has old token data)
    const userId = req.user._id;

    // Fetch latest user data from database (has updated organizationId)
    const currentUser = await user.findById(userId);

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate NEW token with updated organizationId from DB
    generateToken(
      currentUser._id,
      currentUser.email,
      currentUser.organizationDetails?.organizationId ?? null,
      res
    );

    return res.status(200).json({
      message: "Token refreshed successfully",
      _id: currentUser._id,
      fullname: currentUser.fullname,
      email: currentUser.email,
      organizationId: currentUser.organizationDetails?.organizationId,
    });
  } catch (error) {
    console.error("Error refreshing token:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};
