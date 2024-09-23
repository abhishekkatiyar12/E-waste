const jwt=require("jsonwebtoken");
const sellerModel=require("../Models/seller");
const bcrypt=require("bcrypt");

const generateToken=(x)=>{
    return jwt.sign({userId:x},'mysecret123',
        {expiresIn:'1d'
        })
}


const hashPassword = async(x) => {
    return await bcrypt.hash(x, 12);
}




const sellerLogin=async(req,res)=>{
    try{
        const {email,password}=req.body;
        if(!email || !password){
            return res.status(401).json({
              status:'fail',
              message:'please provide the valid email and password'
            })
        }

        const user=await sellerModel.findOne({email})
        if(user){
            const hashedPAssword=user.password;
            const result=await bcrypt.compare(password,hashedPAssword);
            if(result){
                res.send(500).json({
                    status:'success',
                    data:{
                        user:user,
                        token:generateToken(user.id),
                    }
                });
            }else{
                res.status(500).json({
                    status:'fail',
                    message:'Email or Password is Incorrect',
                })
            }
        }
    }

    catch(err){
        res.status(500).json({
            status:'fail',
            message:err?.message,
         })
    }
}

const sellerSignup= async (req,res)=>{
    try{
      const {email,password, name, contactNumber, address}=req.body;
  
      if(!email || !password) {
          return res.status(401).json({
              status: 'fail',
              message: "Invalid email or password",
          })
      }
  
      const newPassword= await hashPassword(password);
      const user = await sellerModel.create({email, password:newPassword, name, contactNumber, address});
      res.status(201).json({
          status: 'success',
          data:{
              user: user,
              token: generateToken(user.id),
          }
      })
  
  }
  catch(err){
      res.status(500).json({
          status: 'fail',
          message: err?.message,
      })
  }
  }
  
  
  
  module.exports={sellerLogin,sellerSignup};