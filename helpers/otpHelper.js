const User = require("../models/userModel");
const { EMAIL, PASSWORD } = require("../env");
const nodemailer = require("nodemailer");



const otpGeneration=(email)=>{
    return new Promise((resolve,reject)=>{
        let otp = "";

  for (let i = 0; i < 6; i++) {
    otp += Math.floor(Math.random() * 10);
  } 
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL,
      pass: PASSWORD,
    },
  });

  const mailOptions = {
    from: EMAIL,
    to: email,
    subject: "OTP Verification",
    text: `Your otp is ${otp}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
    } else {
      console.log(otp)
      console.log("Email sent: " + info.response);
      
      
    }
  });

  
  let response ={
    otp:otp,
    expirationTime : Date.now() + 60 * 1000

  }
  
  resolve(response);
    })
}



module.exports={
    otpGeneration
}