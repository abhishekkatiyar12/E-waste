const express=require("express");
const{sellerLogin,sellerSignup,sellerPasswordReset,sellerVerifyOtpAndResetPassword,sellerLogout}=require("../Controller/SellerAuth");


const sellerRouter=express.Router();

sellerRouter.route('/signup')
.post(sellerSignup);


sellerRouter.route('/login')
.post(sellerLogin);

sellerRouter.route('logout')
.post(sellerLogout);


sellerRouter.route('/requestPasswordReset').post(sellerPasswordReset);

// Route to verify OTP and reset password
sellerRouter.route('/verifyOtpAndResetPassword').post(sellerVerifyOtpAndResetPassword);

module.exports= sellerRouter;