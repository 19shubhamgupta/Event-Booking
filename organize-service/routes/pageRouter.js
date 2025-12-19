const express = require("express");
const {
  getpage, updatePage
} = require("../controllers/pageController");
const { verifyToken } = require("../middlewares/verifyToken");

const pageRouter = express.Router();

pageRouter.get("/get-page/:id", verifyToken, getpage);
pageRouter.put("/update-page/:id", verifyToken, updatePage);

module.exports = pageRouter;
