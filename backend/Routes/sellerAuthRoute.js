const express=require("express");
const{sellerLogin,sellerSignup}=require("../Controller/SellerAuth");


const sellerRouter=express.Router();

sellerRouter.route('/signup')
.post(sellerSignup);


sellerRouter.route('/login')
.post(sellerLogin);

module.exports= sellerRouter;