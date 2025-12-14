const express = require("express");
const {
  getpage, updatePage
} = require("../controllers/pageController");
const { checkUser } = require("../middlewares/checkUser");

const pageRouter = express.Router();

pageRouter.get("/get-page/:id", checkUser, getpage);
pageRouter.put("/update-page/:id", checkUser, updatePage);

module.exports = pageRouter;
