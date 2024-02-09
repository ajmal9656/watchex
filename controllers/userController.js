const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const { EMAIL, PASSWORD } = require("../env");
const userHelper=require('../helpers/userHelper');
const otpHelper=require('../helpers/otpHelper');
const productHelper=require('../helpers/productHelper');
const productModel=require("../models/productModel");
const cartHelper=require("../helpers/cartHelper");
const cartModel = require("../models/cartModel");
const whishlistHelper=require("../helpers/whishlistHelper");
const categoryHelper=require("../helpers/cateroryHelper");
const passHelper=require("../helpers/passwordHelper");
const { response } = require("express");


const loadhome = async (req, res) =>{

  const productData = await productHelper.getAllProducts();

  for(const product of productData){

  product.offerPrice=Math.round(product.product_price-(product.product_price*product.product_discount)/100);}
  const categoryData = await categoryHelper.getAllCategory();

console.log("helloo")
  console.log(productData);
  



  if (req.session.user) {
    res.render("user/indexx",{message:"hi",product:productData,categories:categoryData});
  } 
  // else if (req.session.admin) {
  //   res.render("admin/index");
  // }
   else {


    res.render("user/indexx",{product:productData,categories:categoryData});
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
      

      res.render("user/otp-verification");
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
// const generateOtp = async (req, res) => {

//   const email =req.session.userdata.email;
 

//   otpHelper.otpGeneration(email).then((response)=>{
//     req.session.otp=response.otp;
//     req.session.expirationTime=response.expirationTime;

    

    

    
//     res.render("user/otp-verification");})
//   };

  

  

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

const loadForgotPass = async(req,res)=>{
  const message=req.flash("message")
  res.render("user/forgot-pass",{message:message});


}

const forgotPassword=async(req,res)=>{

  const email = req.body.email;

  const check = await User.findOne({ email: email });
              
              if (check) {
                req.session.email=email;

                otpHelper.otpGeneration(email).then((response)=>{
                  req.session.otp=response.otp;
    req.session.expirationTime=response.expirationTime;

    console.log(req.session.otp);
    console.log(req.session.expirationTime);

    

    
    
                  res.render("user/otp-page");

    
                })
                
                
                 
              
                

                
    }
    else{

      req.flash("message","Email not found");
        
        res.redirect("/forgotPassword")
    }}

  

// const sendOtp = async (req, res) => {
 

//     const email =req.session.email;
   
  
//     otpHelper.otpGeneration(email).then((response)=>{
//       req.session.otp=response.otp;
//       req.session.expirationTime=response.expirationTime;
  
      
  
      
  
      
//       res.render("user/otp-page");})
    
//   };

const otpVerification =async(req,res)=>{
  

  const storedOtp = req.session.otp;
  
  const enteredOtp = req.body.otp;


  if (storedOtp === enteredOtp) {
    
    
      // delete req.session.email;
      
      res.render("user/new-password")
    
  } else {
    
      res.render("user/otp-page",{message:"Invalid OTP"})
  }

}

const confirmPassword = async(req,res)=>{

  const email = req.session.email;
  const password = req.body.password1;
  passHelper.setNewPassword(email,password).then((response)=>{

    delete req.session.email;

    req.flash("message","Password reset successfully");


    res.redirect("/login")

  })

}


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
  
  
    if(req.session.user){
      const userId= req.session.user._id;

      const cartStatus = await cartHelper.checkCart(id,userId);
      userHelper.getProductDetails(id).then((response)=>{

        

          response.offerPrice=Math.round(response.product_price-(response.product_price*response.product_discount)/100);

        console.log("hiiii");
        console.log(response)
        if(cartStatus){
          console.log(cartStatus)
          response.isCart = cartStatus;
        console.log(response)
        }
        

      


    res.render("user/productView",{product:response});})
    }
    else{
      
      res.redirect("/login")
    }
  
  // const products = await productModel.findById(id)
  // console.log(products);
  // res.render("user/productView",{product:products});

}


 const userCart = async (req,res)=>{
  const user = req.session.user;
  cartHelper.getAllCartItems(user._id).then((response)=>{
    for(const products of response){

      products.product.offerPrice=Math.round(products.product.product_price-(products.product.product_price*products.product.product_discount)/100);}

    
    res.render("user/cart-page",{products:response});
  })

  

 }

 const 
 addToCart = async(req,res)=>{
  const productId = req.params.id;
  const size = req.params.size;
  const userId = req.session.user._id;
  console.log(userId)

  cartHelper.addProductToCart(productId,userId,size).then((response)=>{

    
    res.json({status:true})


  }) }

  const updateQuantity = async(req,res)=>{
    const productId = req.query.productId;
    const quantity = parseInt(req.query.quantity);
    const userId = req.session.user._id;

    cartHelper.quantityUpdation(productId,userId,quantity).then((response)=>{

      res.json({status:true})

    }).catch((error)=>{
      console.log(error)
    })

  }

  const removeFromCart = async (req,res)=>{

  const productId= req.params.id;
  const userId = req.session.user._id;
  const result = await cartHelper.removeItem(userId,productId);

if(result){
  res.json({status:true})
}
else{
  res.json({status:false})
}

  }


  const userWhishlist = async(req,res)=>{
    const user = req.session.user;

    whishlistHelper.getAllWhishlistItems(user._id).then((response)=>{
      res.render("user/wishlist-page",{products:response});
    })

  }

  const addToWishlist = async(req,res)=>{
    const productId = req.params.id;
    const userId = req.session.user._id;
    console.log(userId)
  
    whishlistHelper.addProductToWishlist(productId,userId).then((response)=>{
  
      
      res.json({status:true})
  
  
    }) }

    const loadUserProfile = async(req,res)=>{
      const userId = req.session.user._id;

      userHelper.getUserDetails(userId).then((response)=>{
        res.render("user/account",{userData:response});

      })

      

      

    }

    const addAddress = async(req,res)=>{
      const userId=req.session.user._id;
      const body = req.body;

      const add = await userHelper.addUserAddress(userId,body);
      console.log(add)

      if(add){
        res.json({status:true})
      }
        

       

      



    }

    const deleteAddress = async(req,res)=>{
      const addressId = req.params.id;
      const userId= req.session.user._id;
      console.log("deletion`")
      console.log(userId)


      userHelper.addressDeletion(addressId,userId).then((response)=>{

        res.json({status:true})

      })

    }


const loadEditAddress = async (req, res) => {
      const addressId = req.query.addressId;
      const userId= req.session.user._id;
     userHelper.editAddress(userId,addressId).then((response)=>{
      res.render("user/edit-address", { userData:response });

     })
      
      
    };

 const editAddress = async(req,res)  =>{
  const addressId = req.query.addressId;
      const userId= req.session.user._id;
      const body= req.body;
      userHelper.postEditAddress(userId,addressId,body).then((response)=>{
        res.redirect("/profileView");
  
       })
 } 
    



module.exports = {
  loadlogin,
  loadregister,
  insertUser,
  loadhome,
  verifyOtp,
  loaduserhome,
  userlogout,
  viewProduct,
  userCart,
  addToCart,userWhishlist,
  addToWishlist,
  updateQuantity,
  removeFromCart,
  loadUserProfile,
  addAddress,deleteAddress,
  loadEditAddress,
  editAddress,
  loadForgotPass,
  forgotPassword,
  otpVerification,
  confirmPassword
};
