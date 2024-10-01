const express=require("express");
const{customerLogin,customerSignup,customerPasswordReset,customerVerifyOtpAndResetPassword,customerLogout}=require("../Controller/customerAuth");


const customerRouter=express.Router();

customerRouter.route('/signup')
.post(customerSignup);


customerRouter.route('/login')
.post(customerLogin);

customerRouter.route('/logout')
.post(customerLogout);



// Route to request OTP for password reset
customerRouter.route('/requestPasswordReset').post(customerPasswordReset);

// Route to verify OTP and reset password
customerRouter.route('/verifyOtpAndResetPassword').post(customerVerifyOtpAndResetPassword);




module.exports= customerRouter