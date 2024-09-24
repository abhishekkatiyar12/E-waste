'use strict';
const jwt = require("jsonwebtoken");
const customerModel = require("../Models/customer");
const bcrypt = require("bcrypt");
const authenticator = require('authenticator'); 
const nodemailer = require('nodemailer'); 
const { getMaxListeners } = require("nodemailer/lib/xoauth2");
var smtpTransport = require('nodemailer-smtp-transport');

const generateToken = (x) => {
    return jwt.sign({ userId: x }, 'mysecret123', { expiresIn: '1d' });
}

const hashPassword = async (x) => {
    return await bcrypt.hash(x, 12);
}

const customerLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(401).json({
                status: 'fail',
                message: 'Please provide the valid email and password'
            });
        }

        const user = await customerModel.findOne({ email });
        if (user) {
            const hashedPassword = user.password;
            const result = await bcrypt.compare(password, hashedPassword);
            if (result) {
                return res.status(200).json({
                    status: 'success',
                    data: {
                        user: user,
                        token: generateToken(user.id),
                    }
                });
            } else {
                return res.status(401).json({
                    status: 'fail',
                    message: 'Email or Password is Incorrect',
                });
            }
        } else {
            return res.status(404).json({
                status: 'fail',
                message: 'User not found',
            });
        }
    } catch (err) {
        return res.status(500).json({
            status: 'fail',
            message: err.message,
        });
    }
}

const customerSignup = async (req, res) => {
    try {
        const { email, password, name } = req.body;
        if (!email || !password || !name) {
            return res.status(400).json({
                status: 'fail',
                message: "Invalid email, password, or name",
            });
        }

        // Check if the email already exists
        const existingUser = await customerModel.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                status: 'fail',
                message: "Email already in use",
            });
        }

        const newPassword = await hashPassword(password);
        const user = await customerModel.create({ email, password: newPassword, name });
        res.status(201).json({
            status: 'success',
            data: {
                user: user,
                token: generateToken(user.id),
            }
        });
    } catch (err) {
        return res.status(500).json({
            status: 'fail',
            message: err.message,
        });
    }
}

// Email transport for sending OTP
// const transporter = nodemailer.createTransport({
//     service: 'Gmail',
//     auth: {
//         user: 'abhishek.katiyar.983932@gmail.com', 
//         pass: 'Kietmca2325@12'
//     }
// });

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
const customerPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if email is provided
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Find user by email
        const user = await customerModel.findOne({ email });
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
            text: `Your password reset OTP is: ${otp}. It is valid for 30 seconds.`
        };

       
        await transporter.sendMail(mailOptions);

        return res.status(200).json({ message: 'OTP sent to email' });
    } catch (error) {
        return res.status(500).json({ message: 'otp error', error });
    }
};

// Step 2: Verify OTP and allow password reset
const customerVerifyOtpAndResetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        // Check if email, otp, and newPassword are provided
        if (!email || !otp || !newPassword) {
            return res.status(400).json({ message: 'Email, OTP, and new password are required' });
        }

        // Find user by email
        const user = await customerModel.findOne({ email });
        if (!user || !user.resetPasswordKey) {
            return res.status(400).json({ message: 'Invalid request' });
        }

        // Check if OTP is expired (assuming valid for 30 seconds)
        const otpSentTime = user.otpSentAt;
        const currentTime = Date.now();
        if (currentTime - otpSentTime > 30 * 1000) {
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

module.exports = { customerLogin, customerSignup, customerPasswordReset, customerVerifyOtpAndResetPassword };
