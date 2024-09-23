const express=require("express");
const{customerLogin,customerSignup}=require("../Controller/customerAuth");


const customerRouter=express.Router();

customerRouter.route('/signup')
.post(customerSignup);


customerRouter.route('/login')
.post(customerLogin);

module.exports= customerRouter