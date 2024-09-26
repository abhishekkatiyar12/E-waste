const jwt=require("jsonwebtoken");
const sellerModel=require("../Models/seller");
const bcrypt=require("bcrypt");
const authenticator = require('authenticator'); 
const nodemailer = require('nodemailer'); 



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
  

  const transporter = nodemailer.createTransport({
    service:"gmail",
    secure:true,
    port: 465,
    auth: {
        user: 'anup.yadav14750@gmail.com',
        pass: 'ezgf dwzb enrs rsvp'
    }
});

// Step 1: Generate OTP and send it via email
const sellerPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if email is provided
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Find user by email
        const user = await sellerModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate secret key and OTP
        const secretKey = authenticator.generateKey();
        const otp = authenticator.generateToken(secretKey);
console.log(otp);
        // Save secret key and OTP timestamp to user's account for later OTP verification
        user.resetPasswordKey = secretKey;
        user.otpSentAt = Date.now(); // Save the time when the OTP is sent
        await user.save();

        // Send OTP to user's email
        const mailOptions = {
            from: 'anup.yadav14750@gmail.com',
            to: user.email,
            subject: 'Password Reset OTP',
            text: `Your password reset OTP is: ${otp}. It is valid for 60 seconds.`
        };

       
        await transporter.sendMail(mailOptions);

        return res.status(200).json({ message: 'OTP sent to email' });
    } catch (error) {
        return res.status(500).json({ message: 'otp error', error });
    }
};

// Step 2: Verify OTP and allow password reset
const sellerVerifyOtpAndResetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        // Check if email, otp, and newPassword are provided
        if (!email || !otp || !newPassword) {
            return res.status(400).json({ message: 'Email, OTP, and new password are required' });
        }

        // Find user by email
        const user = await sellerModel.findOne({ email });
        if (!user || !user.resetPasswordKey) {
            return res.status(400).json({ message: 'Invalid request' });
        }

        // Check if OTP is expired (assuming valid for 30 seconds)
        const otpSentTime = user.otpSentAt;
        const currentTime = Date.now();
        if (currentTime - otpSentTime > 60 * 1000) {
            return res.status(400).json({ message: 'OTP has expired' });
        }

        // Verify the OTP using the secret key saved earlier
        const verification = authenticator.verifyToken(user.resetPasswordKey, otp);
        if (!verification || verification.delta !== 0) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // If OTP is valid, reset the password
        const hashedPassword = await bcrypt.hash(newPassword, 10); // Hash the new password
        user.password = hashedPassword;
        user.resetPasswordKey = undefined; // Clear the reset key after successful reset
        user.otpSentAt = undefined; // Clear OTP sent time
        await user.save();

        return res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'error from verify and reset password', error });
    }
};


  
  
  module.exports={sellerLogin,sellerSignup,sellerPasswordReset,sellerVerifyOtpAndResetPassword};