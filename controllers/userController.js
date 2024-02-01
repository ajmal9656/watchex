const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const { EMAIL, PASSWORD } = require("../env");
const userHelper=require('../helpers/userHelper');
const otpHelper=require('../helpers/otpHelper');
const productHelper=require('../helpers/productHelper');
const productModel=require("../models/productModel")

const loadhome = async (req, res) =>{

  const productData = await productHelper.getAllProducts();
  



  if (req.session.user) {
    res.render("user/indexx",{message:"hi",product:productData});
  } 
  // else if (req.session.admin) {
  //   res.render("admin/index");
  // }
   else {


    res.render("user/indexx",{product:productData});
  }
};

const loadlogin = function (req, res) {
  if (req.session.user) {
    
    res.redirect("/");}
  //    else if (req.session.admin) {
  //   res.send("/adminhome");
  // }
   else {
    const message=req.flash("message")
    res.render("user/login-page",{message:message});
   
  }
};



const loadregister = function (req, res) {
  const message=req.flash("message")
  res.render("user/login-register",{message:message});
};

const userlogout= function(req,res){
  try{
    if(req.session.user){
      req.session.destroy((error)=>{
        if(error){
          res.redirect("/login")

        }
        else{
          res.redirect("/");
        }
      })
    }else{
      res.redirect("/login")

    }

  }catch(error){
    console.log(error)

  }
}

const insertUser = async (req, res) => {

  const user = req.body;
  userHelper.signUpHelper(user).then((response)=>{
    
    if(response.registeredData){

      req.session.userdata=response.registeredData;
      req.session.email=response.registeredData.email;

      res.redirect("/otp-verification");
    }
    else{

      req.flash("message",response.errorMessage);
      res.redirect("/register")
    }

  })
  // try {
  //   const { username, email, mobile, password } = req.body;

  //   const check = await User.findOne({
  //     $or: [{ email: email }, { mobile: mobile }],
  //   });
  //   if (!check) {
  //     const hashedPassword = await bcrypt.hash(password, 10);
  //     req.session.email = email;

  //     const userIn = {
  //       name: username,
  //       email: email,
  //       mobile: mobile,
  //       password: hashedPassword,
  //       isAdmin: 0,
  //     };

  //     req.session.user = userIn;

  //     res.redirect("/otp-verification");
  //   } else {
  //     res.send("user exist");
  //   }
  // } catch (error) {
  //   res.send(error.message);
  // }
};
const generateOtp = async (req, res) => {
  // let otp = "";

  // for (let i = 0; i < 6; i++) {
  //   otp += Math.floor(Math.random() * 10);
  // }
  // req.session.otp = otp;
  // req.session.expirationTime = Date.now() + 60 * 1000;

  otpHelper.otpGeneration().then((response)=>{
    req.session.otp=response.otp;
    req.session.expirationTime=response.expirationTime;
    console.log(req.session.otp);
    console.log(req.session.expirationTime)

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EMAIL,
        pass: PASSWORD,
      },
    });
  
    const mailOptions = {
      from: EMAIL,
      to: req.session.email,
      subject: "OTP Verification",
      text: `Your otp is ${req.session.otp}`,
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
      } else {
        console.log("Email sent: " + info.response);
        
        
      }
    });

    res.render("user/otp-verification");})
  };

  

  

const verifyOtp = async (req, res) => {
  const userData = req.session.userdata;

  const storedOtp = req.session.otp;
  
  const enteredOtp = req.body.otp;


  if (storedOtp === enteredOtp) {
    const result = await User.create(userData);
    if (result) {
      delete req.session.userdata;
      req.flash("message","OTP verified.You can login now");
      res.redirect("/login")
    }
  } else {
    
      res.render("user/otp-verification",{message:"Invalid OTP"})
  }
};

const loaduserhome = async (req, res) => {
  const user=req.body;
   userHelper.loginHelper(user).then((response)=>{
    console.log(response);
    if(response.logId){
      
      
        req.session.user=response.data;
      res.redirect("/");

      
    }
    else{
      req.flash("message",response.errorMessage);
      res.redirect("/login")
    }
  })
  // try {
  //   const { email, password } = req.body;

  //   const userdata = await User.findOne({ email: email });

  //   if (userdata) {
  //     const check = await bcrypt.compare(password, userdata.password);
  //     if (check) {
  //       req.session.user = userdata._id;
  //       res.redirect("/");
  //     } else {
  //       res.send("wrong password");
  //     }
  //   } else {
  //     res.send("user not found");
  //   }
  // } catch (error) {
  //   res.send(error.message);
  // }
};

const viewProduct = async(req,res)=>{
  const id = req.params.id;
  userHelper.getProductDetails(id).then((response)=>{
    if(req.session.user){
    res.render("user/productView",{product:response});
    }
    else{
      
      res.redirect("/login")
    }
  })
  // const products = await productModel.findById(id)
  // console.log(products);
  // res.render("user/productView",{product:products});

}

module.exports = {
  loadlogin,
  loadregister,
  insertUser,
  loadhome,
  generateOtp,
  verifyOtp,
  loaduserhome,
  userlogout,
  viewProduct
};
