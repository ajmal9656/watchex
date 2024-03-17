const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const { EMAIL, PASSWORD } = require("../env");
const { KEY_ID, KEY_SECRET } = require("../env");
const userHelper = require("../helpers/userHelper");
const otpHelper = require("../helpers/otpHelper");
const productHelper = require("../helpers/productHelper");
const productModel = require("../models/productModel");
const cartHelper = require("../helpers/cartHelper");
const cartModel = require("../models/cartModel");
const categoryModel = require("../models/categoryModel");
const whishlistHelper = require("../helpers/whishlistHelper");
const categoryHelper = require("../helpers/cateroryHelper");
const passHelper = require("../helpers/passwordHelper");
const walletHelper = require("../helpers/walletHelper");
const orderHelper = require("../helpers/orderHelper");
const couponHelper = require("../helpers/couponHelper");
const bannerHelper = require("../helpers/bannerHelper");
const offerHelper = require("../helpers/offerHelper");
const offerModel = require("../models/offerModel");
const { response } = require("express");
const moment = require("moment");
const Razorpay = require("razorpay");
const { resolve } = require("node:path");
var razorpay = new Razorpay({
  key_id: "rzp_test_3xAnxikxa5xZNZ",
  key_secret: "ok69vIQiyLSK9Y7aEzAL2Zax",
});

const loadhome = async (req, res,next) => {try{
  const productData = await productHelper.getAllProducts();
  const categoryData = await categoryHelper.getAllCategory();
  const bannerData = await bannerHelper.getAllBanner();

  const productDetails = await productHelper.AllProductOfferCheck(productData);

  
  

  if (req.session.user) {
    const userId = req.session.user._id;
    const cartCount = await cartHelper.userCartCount(userId);
    const wishlistCount = await whishlistHelper.userWishlistCount(userId);

    res.render("user/indexx", {
      message: "hi",
      product: productDetails,
      categories: categoryData,
      cartcount: cartCount,
      wishlistcount: wishlistCount,
      bannerData:bannerData
    });
  }
  // else if (req.session.admin) {
  //   res.render("admin/index");
  // }
  else {
    res.render("user/indexx", {
      product: productData,
      categories: categoryData,
      bannerData:bannerData
    });
  }}catch(error){
    next(error);
  }
  
};

const loadlogin = function (req, res,next) {
  try{
  if (req.session.user) {
    res.redirect("/");
  }
  //    else if (req.session.admin) {
  //   res.send("/adminhome");
  // }
  else {
    const message = req.flash("message");
    res.render("user/login-page", { message: message });
  }
}
catch(error){
  next(error)
}};

const loadregister = function (req, res,next) {
  try{
    const message = req.flash("message");
    res.render("user/login-register", { message: message });

  }catch(error){
    next(error)
  }
 
};

const userlogout = function (req, res,next) {
  try {
    if (req.session.user) {
      req.session.destroy((error) => {
        if (error) {
          res.redirect("/login");
        } else {
          res.redirect("/");
        }
      });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    next(error);
  }
};

const insertUser = async (req, res) => {
  const user = req.body;
  userHelper.signUpHelper(user).then((response) => {
    if (response.registeredData) {
      req.session.userdata = response.registeredData;

      res.redirect("/otp-verification");
    } else {
      req.flash("message", response.errorMessage);
      res.redirect("/register");
    }
  });
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
const generateOtp = async (req, res,next) => {
  try{
    const email = req.session.userdata.email;

  otpHelper.otpGeneration(email).then((response) => {
    req.session.otp = response.otp;
    req.session.expirationTime = response.expirationTime;

    res.render("user/otp-verification");
  });

  }catch(error){
    next(error)
  }
  
};

const verifyOtp = async (req, res) => {
  const userData = req.session.userdata;

  const storedOtp = req.session.otp;

  const enteredOtp = req.body.otp;

  if (storedOtp === enteredOtp) {
    const result = await User.create(userData);
    if (result) {
      delete req.session.userdata;
      req.flash("message", "OTP verified.You can login now");
      res.redirect("/login");
    }
  } else {
    res.render("user/otp-verification", { message: "Invalid OTP" });
  }
};
const resendOtp = async (req, res) => {
  const email = req.session.userdata.email;

  otpHelper.otpGeneration(email).then((response) => {
    req.session.otp = response.otp;
    req.session.expirationTime = response.expirationTime;

    res.json({ status: true });
  });
};

const loadForgotPass = async (req, res,next) => {
  try{
    const message = req.flash("message");
  res.render("user/forgot-pass", { message: message });

  }catch(error){
    next(error)
  }
  
};

const forgotPassword = async (req, res) => {
  const email = req.body.email;

  const check = await User.findOne({ email: email });

  if (check) {
    req.session.email = email;

    res.redirect("/otpEnter");
  } else {
    req.flash("message", "Email not found");

    res.redirect("/forgotPassword");
  }
};

const sendOtp = async (req, res,next) => {
  try{
    const email = req.session.email;

  otpHelper.otpGeneration(email).then((response) => {
    req.session.otp = response.otp;
    req.session.expirationTime = response.expirationTime;

    res.render("user/otp-page");
  });

  }catch(error){
    next(error)
  }
  
};
const resendOtpForgotPass = async (req, res) => {
  const email = req.session.email;

  otpHelper.otpGeneration(email).then((response) => {
    req.session.otp = response.otp;
    req.session.expirationTime = response.expirationTime;

    res.json({ status: true });
  });
};

const otpVerification = async (req, res) => {
  const storedOtp = req.session.otp;

  const enteredOtp = req.body.otp;

  if (storedOtp === enteredOtp) {
    // delete req.session.email;

    res.render("user/new-password");
  } else {
    res.render("user/otp-page", { message: "Invalid OTP" });
  }
};

const confirmPassword = async (req, res) => {
  const email = req.session.email;
  const password = req.body.password1;
  passHelper.setNewPassword(email, password).then((response) => {
    delete req.session.email;

    req.flash("message", "Password reset successfully");

    res.redirect("/login");
  });
};

const loaduserhome = async (req, res) => {
  const user = req.body;
  userHelper.loginHelper(user).then((response) => {
    if (response.logId) {
      req.session.user = response.data;
      res.redirect("/");
    } else {
      req.flash("message", response.errorMessage);
      res.redirect("/login");
    }
  });
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

const loadAllProduct = async (req, res,next) => {
  try{
    if(req.query.searchInput){
      let payload = req.query.searchInput.trim();
    try {
      let searchResult = await productModel
        .find({ product_name: { $regex: new RegExp("^" + payload + ".*", "i") } }).populate("product_category")
        .exec();
      // searchResult = searchResult.slice(0, 5);
      console.log("searchResult");
      console.log(searchResult);
      const productDetails = await productHelper.AllProductOfferCheck(searchResult);
      console.log(productDetails);
      
      const categoryData = await categoryHelper.getAllCategory();
      res.render("user/shop-product", {
        message: "hello",
        product: productDetails,
        categories: categoryData,
        sort:true
        // cartcount:cartCount,
        // wishlistcount:wishlistCount
      });
    } catch (error) {
      res.status(500).render("error", { error, layout: false });
    }
    }
    else{
      const productData = await productHelper.getAllProducts();
      
      const productDetails = await productHelper.AllProductOfferCheck(productData);
      
  
    
    const categoryData = await categoryHelper.getAllCategory();
   
    res.render("user/shop-product", {
      message: "hi",
      product: productDetails,
      categories: categoryData,
      sort:false
      // cartcount:cartCount,
      // wishlistcount:wishlistCount
    });
  
    }

  }catch(error){
    next(error)

  }
  
  
};

const viewProduct = async (req, res,next) => {
  try{
    const id = req.params.id;

  
   

    userHelper.getProductDetails(id).then(async(response) => {
      const productDetails = await productHelper.productOfferCheck(response);

      if(req.session.user){
        const userId = req.session.user._id;

        const cartStatus = await cartHelper.checkCart(id, userId);
        const wishListStatus = await whishlistHelper.checkWishlist(id, userId);
        if (cartStatus) {
          response.isCart = cartStatus;
        }
        if (wishListStatus) {
          response.isWishlist = wishListStatus;
        }

      }

     

      res.render("user/productView", { product: productDetails });
    });
   

  // const products = await productModel.findById(id)
  // console.log(products);
  // res.render("user/productView",{product:products});

  }catch(error){
    next(error)
  }
  
};

const userCart = async (req, res,next) => {
  try{
    const user = req.session.user._id;
    cartHelper.getAllCartItems(user).then(async (response) => {
  
      const productDetails = await cartHelper.cartProductOfferCheck(response);
      
      
  
  
      const removeCouponFromCart = await cartHelper.removeCoupon(user);
      let totalandSubTotal = await cartHelper.totalSubtotal(user, productDetails);
  
      
  
      res.render("user/cart-page", {
        products: productDetails,
        totalAmount: totalandSubTotal,
      });
    });
    
  }
  catch(error){
    next(error)
  }
 
};

const addToCart = async (req, res) => {
  const productId = req.params.id;
  const size = req.params.size;
  const userId = req.session.user._id;

  if(req.session.user){
    productHelper.cartChecking(productId,size,userId).then(async(response)=>{
      if(response.status){
        const stockCheck = await productHelper.stockChecking(productId, size);
        if (!stockCheck.status) {
          res.json({ status: false,message:"No stock available" });
        } else {
          cartHelper.addProductToCart(productId, userId, size).then((response) => {
            res.json({ status: true });
          });
        }

      }else{
        res.json({ status: false,message: "Product is already in cart"});

      }

    })
    

  

  }else{
    res.json({user:false});
  }

  
};


const updateQuantity = async (req, res) => {
  const productId = req.query.productId;
  const size = req.query.size;
  const price = parseInt(req.body.price);
  const quantity = parseInt(req.query.quantity);
  const userId = req.session.user._id;
  console.log("entered")
  console.log(price)

  cartHelper
    .quantityUpdation(productId, userId, quantity, size,price)
    .then(async(response) => {
      
      const cartData = await cartHelper.getAllCartItems(userId)
  
      const productDetails = await cartHelper.cartProductOfferCheck(cartData);
      
      
      let totalandSubTotal = await cartHelper.totalSubtotal(userId, productDetails);
     
      
      if (response.sizeExceed) {
        
        res.json({ sizeExceed: true,totalSubAmount:response.totalSubAmount ,productQuantity:response.product.quantity,total:totalandSubTotal});
      } else if (response.sizeLimit) {
        res.json({ sizeLimit: true ,totalSubAmount:response.totalSubAmount,productQuantity:response.product.quantity,total:totalandSubTotal});
      } else {
        res.json({ status: true ,totalSubAmount:response.totalSubAmount,productQuantity:response.productQuantity,total:totalandSubTotal});
      }
    })
    .catch((error) => {
      console.log(error);
    });
};

const removeFromCart = async (req, res) => {
  console.log("ent")
  const productId = req.params.id;
  const size = req.params.size;
  console.log(size)

  
  const userId = req.session.user._id;
  const result = await cartHelper.removeItem(userId, productId,size);

  if (result) {
    res.json({ status: true });
  } else {
    res.json({ status: false });
  }
};

const userWhishlist = async (req, res,next) => {
  try{
    const userId = req.session.user._id;

    whishlistHelper.getAllWhishlistItems(userId).then(async (response) => {
      const productDetails = await whishlistHelper.wishlistProductOfferCheck(userId,response);
      
      
  
      res.render("user/wishlist-page", { products: productDetails });
    });

  }catch(error){
    next(error)
  }
 
};

const addToWishlist = async (req, res) => {
  const productId = req.params.id;
  const userId = req.session.user._id;

  if(req.session.user){
    whishlistHelper.addProductToWishlist(productId, userId).then((response) => {
      res.json({ status: true });
    });

  }else{
    res.json({user:false});

  }

  
};

const removeFromWishlist = async (req, res) => {
  const productId = req.params.id;
  const userId = req.session.user._id;
  const result = await whishlistHelper.removeItem(userId, productId);

  if (result) {
    res.json({ status: true });
  } else {
    res.json({ status: false });
  }
};

const loadUserProfile = async (req, res,next) => {
  try{
    const userId = req.session.user._id;

  userHelper.getUserDetails(userId).then(async (response) => {
    const orderData = await orderHelper.getOrderDetails(userId);

    for (const order of orderData) {
      order.formattedDate = moment(order.orderedOn).format("MMM Do, YYYY");

      let quantity = 0;
      for (const product of order.products) {
        quantity += Number(product.quantity);
      }
      order.quantity = quantity;
    }
    const walletData = await userHelper.getUserDetails(userId);

    for (const amount of walletData.wallet.details) {
      amount.formattedDate = moment(amount.date).format("MMM Do, YYYY");

      
    }

    res.render("user/account", { userData: response, orderData ,walletData});
  });

  }catch(error){
    next(error)
  }
  
};

const addAddress = async (req, res) => {
  const userId = req.session.user._id;
  const body = req.body;

  const add = await userHelper.addUserAddress(userId, body);

  if (add) {
    res.json({ status: true });
  }
};

const addAddressPost = async (req, res) => {
  const userId = req.session.user._id;
  const body = req.body;

  const add = await userHelper.addUserAddress(userId, body);

  if (add) {
    res.json({ status: true });
  }
};

const deleteAddress = async (req, res) => {
  const addressId = req.params.id;
  const userId = req.session.user._id;

  userHelper.addressDeletion(addressId, userId).then((response) => {
    res.json({ status: true });
  });
};

const loadEditAddress = async (req, res,next) => {
  try{
    const addressId = req.query.addressId;
  const userId = req.session.user._id;
  userHelper.editAddress(userId, addressId).then((response) => {
    res.render("user/edit-address", { userData: response });
  });

  }catch(error){
    next(error)
  }
  
};

const editAddress = async (req, res) => {
  const addressId = req.query.addressId;
  const userId = req.session.user._id;
  const body = req.body;
  userHelper.postEditAddress(userId, addressId, body).then((response) => {
    res.redirect("/profileView");
  });
};

const changePassword = async (req, res) => {
  const userId = req.session.user._id;
  const body = req.body;

  passHelper.confirmNewPassword(userId, body).then(async (response) => {
    res.redirect("/profileView");
  });
};

const loadCheckout = async (req, res,next) => {
  try{
    const userId = req.session.user._id;

    const userData = await userHelper.getAllAddress(userId);
    const cartData = await cartHelper.getAllCartItems(userId);
    const couponData = await couponHelper.getAllCoupons();
  
    const productDetails = await cartHelper.cartProductOfferCheck(cartData);
    
  
    
    let totalandSubTotal = await cartHelper.totalSubtotal(userId, productDetails);
  
    res.render("user/checkout-page", {
      userData,
      cartItems: productDetails,
      totalandSubTotal,
      coupons: couponData,
    });

  }catch(error){
    next(error)
  }
 
};

const getEditAddress = async (req, res,next) => {
  try{
    const addressId = req.params.id;
    const userId = req.session.user._id;
  
    userHelper
      .addressDetails(addressId, userId)
      .then((response) => {
        res.json(response);
      })
      .catch((error) => {
        console.log(error);
      });

  }catch(error){
    next(error)
  }
 
};
const postEditAddress = async (req, res) => {
  const body = req.body;
  const userId = req.session.user._id;

  userHelper
    .addressEdit(userId, body)
    .then((response) => {
      
      res.redirect("/checkout");
    })
    .catch((error) => {
      console.log(error);
    });
};

const proceedPayment = async (req, res) => {
  const userId = req.session.user._id;
  const body = req.body;
  const cartItems = await cartModel.findOne({ user: userId }).populate("products.productItemId");
  
  
  const cartData = await cartHelper.offerCheck(cartItems);
  

  const result = await orderHelper.placeOrder(userId, body, cartData);

  if (result) {
    const allCartData = await cartHelper.getCart(userId);

    const stockUpdation = await productHelper.stockUpdation(allCartData);

    if (stockUpdation) {
      const cart = await cartHelper.clearAllCartItems(userId);
      if (cart) {
        res.json({ url: "/orderSuccess" });
      }
    }
  }
};
const createOrder = async (req, res) => {
  try {
    const amount = parseInt(req.body.totalPrice);
    
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: req.session.user._id,
    });

    

    res.json({ orderId: order });
  } catch (error) {
    console.log(error);
  }
};

const paymentSuccess = (req, res) => {
  try {
    const { paymentid, signature, orderId } = req.body;
    const { createHmac } = require("node:crypto");

    const hash = createHmac("sha256", "ok69vIQiyLSK9Y7aEzAL2Zax")
      .update(orderId + "|" + paymentid)
      .digest("hex");

    if (hash === signature) {
      console.log("success");
      res.status(200).json({ success: true, message: "Payment successful" });
    } else {
      console.log("skbvsbnc")
      console.log("error");
      res.json({ success: false, message: "Invalid payment details" });
    }
  } catch (error) {
    console.log("afasfgvrgvskbvsbnc")
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const orderSuccess = (req, res,next) => {
  try{
    res.render("user/orderSuccess");

  }catch(error){
    next(error)
  }
  
};

const cancelOrder = async (req, res) => {
  const orderId = req.params.id;
  orderHelper.orderCancellation(orderId).then(async (response) => {
    res.json(response);
  });
};

const orderDetails = async (req, res,next) => {
  try{
    const orderId = req.params.id;

    orderHelper.getSpecificOrder(orderId).then(async(response) => {
      console.log("response");
      console.log(response[0].orderedProduct);
  
      let check = true;
      let count = 0;
  
      for(const order of response){
        if(order.products.orderStatus=="delivered"){
          check = true;
          count++;
          
  
        }else if(order.products.orderStatus=="cancelled"){
          check = true;
  
        }else{
          check = false;
          break;
        }
      }
      if(check==true&&count>=1){
        response.deliveryStatus=true;
      }
  
      
      const productDetails = await orderHelper.orderProductOfferCheck(response);
      
  
      res.render("user/each-orders", { productDetails: response });
    });

  }catch(error){
    next(error)
  }

};

const cancelOrders = async (req, res) => {
  const orderId = req.params.orderId;
  const productId = req.params.productId;
  const subTotal = req.params.subTotal;
  const userId = req.session.user._id;
  orderHelper
    .eachOrderCancellation(orderId, productId,subTotal,userId)
    .then(async (response) => {
      const stockUpdation = await productHelper.stockIncreasion(
        orderId,
        productId
      );
      
      res.json(response);
    });
};

const returnOrders = async (req, res) => {
  const orderId = req.params.orderId;
  const productId = req.params.productId;
 
  orderHelper
    .eachOrderReturn(orderId, productId)
    .then( (response) => {
      
      res.json(response);
    });
};




const searchProduct = async (req, res) => {
  let payload = req.params.query.trim();
  try {
    let searchResult = await productModel
      .find({ product_name: { $regex: new RegExp("^" + payload + ".*", "i") } })
      .exec();
    searchResult = searchResult.slice(0, 5);
    console.log(searchResult);
    res.json({ searchResult: searchResult });
  } catch (error) {
    res.status(500).render("error", { error, layout: false });
  }
};

const sortedProductsLoad = async (req, res) => {
  try {
    if (req.query.category) {
      const products =JSON.parse(req.body.products);
      console.log("prod")
      console.log(products)
      const category = req.query.category;

    
      const categories = await categoryModel.find();

      const checkingCategory = products.filter((item)=>{
        if(item.product_category._id){
          return item.product_category._id.toString()==category.toString()

        }else{
         return item.product_category.toString()==category.toString()

        }
          

      })
      for (const item of checkingCategory) {
        if (typeof item.product_category === "string") {
          const category = categories.find(
            (element) => item.product_category == element._id
          );
         
          item.product_category 
          
          = category;
        } else {
          continue;
        }
      }
const productDetails = await productHelper.AllProductOfferCheck(checkingCategory);

console.log("checkingCategory")
console.log(checkingCategory)

      
      res.json({product:productDetails})





    } else if (req.query.price) {

      
    } else if (req.query.category && req.query.price) {

    }
  } catch (error) {
    console.log(error);
  }
};
const priceSortedProductsLoad = async (req, res) => {
  try {
    if (req.query.sort) {
      const product =JSON.parse(req.body.products);

      const sort = req.query.sort;
      const products = await productHelper.AllProductOfferCheck(product);
      

      if(sort.toString()==="L"){

       const sortedProd = products.sort((a,b)=>{
          return a.offerPrice - b.offerPrice
        })
        console.log(sort)
        console.log(sortedProd)

        res.json({product:sortedProd})
        
      }else{
        const sortedProd =  products.sort((a,b)=>{
          return b.offerPrice - a.offerPrice
        })
        console.log(sort)
        console.log(sortedProd)
        res.json({product:sortedProd})

      }
      

    
      

      


      
      





    } else if (req.query.price) {

      
    } else if (req.query.category && req.query.price) {

    }
  } catch (error) {
    console.log(error);
  }
};

const addMoneyToWallet = async(req,res)=>{
  try{
    const userId = req.session.user._id;
    const amount = parseInt(req.body.totalPrice);
    console.log(amount);

    const walletAdding = await walletHelper.walletMoneyAdding(userId,amount);

    res.json({ url: "/orderSuccess" });
    



  }catch(error){
console.log(error)
  }
}


module.exports = {
  loadlogin,
  loadregister,
  insertUser,
  loadhome,
  generateOtp,
  sendOtp,
  resendOtp,
  verifyOtp,
  loaduserhome,
  userlogout,
  viewProduct,
  userCart,
  addToCart,
  userWhishlist,
  addToWishlist,
  updateQuantity,
  removeFromCart,
  loadUserProfile,
  addAddress,
  deleteAddress,
  loadEditAddress,
  editAddress,
  loadForgotPass,
  forgotPassword,
  otpVerification,
  confirmPassword,
  removeFromWishlist,
  loadCheckout,
  proceedPayment,
  orderSuccess,
  changePassword,
  paymentSuccess,
  cancelOrder,
  createOrder,
  orderDetails,
  cancelOrders,
  addAddressPost,
  resendOtpForgotPass,

  getEditAddress,
  postEditAddress,
  loadAllProduct,
  searchProduct,
  returnOrders,

  sortedProductsLoad,
  addMoneyToWallet,
  priceSortedProductsLoad
 
};
