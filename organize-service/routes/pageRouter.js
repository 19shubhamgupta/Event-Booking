const express = require("express");
const {
  getpage,
  updatePage,
  createPage,
} = require("../controllers/pageController");
const { verifyToken } = require("../middlewares/verifyToken");

const pageRouter = express.Router();

pageRouter.post("/create-page", verifyToken, createPage);
pageRouter.get("/get-page/:id", verifyToken, getpage);
pageRouter.put("/update-page/:id", verifyToken, updatePage);

module.exports = pageRouter;
