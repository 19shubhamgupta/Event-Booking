const express = require('express');
const { postLogin, postSignup,getGoogle, postLogout, updatePicture, checkAuth, getGoogleCallback } = require('../controllers/authController');
const { checkUser } = require('../middlewares/checkUser');
const authRouter = express.Router();

authRouter.post('/login' , postLogin)

authRouter.post('/signup', postSignup)

authRouter.post('/logout', postLogout)


authRouter.get("/check", checkUser, checkAuth);

authRouter.get('/google' , getGoogle);

authRouter.get('/google/callback', getGoogleCallback)
module.exports = authRouter;