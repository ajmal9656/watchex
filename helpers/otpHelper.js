const User = require("../models/userModel");



const otpGeneration=()=>{
    return new Promise((resolve,reject)=>{
        let otp = "";

  for (let i = 0; i < 6; i++) {
    otp += Math.floor(Math.random() * 10);
  } 
  
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