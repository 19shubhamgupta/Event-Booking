const express = require('express');
const { postLogin, postSignup,getGoogle, postLogout, updatePicture, checkAuth, getGoogleCallback } = require('../controllers/authController');
const { refreshToken } = require('../controllers/tokenController');
const {verifyToken} = require('../middlewares/verifyToken');
const authRouter = express.Router();

authRouter.post('/login' , postLogin)

authRouter.post('/signup', postSignup)

authRouter.post('/logout', postLogout)

authRouter.get("/check", verifyToken, checkAuth);

authRouter.post("/refresh-token", verifyToken, refreshToken);

module.exports = authRouter;