const user = require("../models/user");

const checkOrganizer = async (req, res, next) => {
  try {
    const userId = req.userId;
    const curruser = await user.findById(userId);

    if (!curruser.organizationId) {
      return res
        .status(401)
        .json({ message: "No Organization Found"});
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = checkOrganizer;
