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
const whishlistHelper = require("../helpers/whishlistHelper");
const categoryHelper = require("../helpers/cateroryHelper");
const passHelper = require("../helpers/passwordHelper");
const orderHelper = require("../helpers/orderHelper");
const couponHelper = require("../helpers/couponHelper");
const offerHelper = require("../helpers/offerHelper");
const offerModel = require("../models/offerModel");
const { response } = require("express");
const moment = require("moment");
const razorpay = require("razorpay")

const loadhome = async (req, res) => {
  const productData = await productHelper.getAllProducts();
  const categoryData = await categoryHelper.getAllCategory();

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
    });
  }
  // else if (req.session.admin) {
  //   res.render("admin/index");
  // }
  else {
    res.render("user/indexx", {
      product: productData,
      categories: categoryData,
    });
  }
};

const loadlogin = function (req, res) {
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
};

const loadregister = function (req, res) {
  const message = req.flash("message");
  res.render("user/login-register", { message: message });
};

const userlogout = function (req, res) {
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
    console.log(error);
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
const generateOtp = async (req, res) => {
  const email = req.session.userdata.email;

  otpHelper.otpGeneration(email).then((response) => {
    req.session.otp = response.otp;
    req.session.expirationTime = response.expirationTime;

    res.render("user/otp-verification");
  });
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

const loadForgotPass = async (req, res) => {
  const message = req.flash("message");
  res.render("user/forgot-pass", { message: message });
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

const sendOtp = async (req, res) => {
  const email = req.session.email;

  otpHelper.otpGeneration(email).then((response) => {
    req.session.otp = response.otp;
    req.session.expirationTime = response.expirationTime;

    res.render("user/otp-page");
  });
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

const loadAllProduct = async (req, res) => {
  const productData = await productHelper.getAllProducts();

  for (const product of productData) {
    product.offerPrice = Math.round(
      product.product_price -
        (product.product_price * product.product_discount) / 100
    );
  }
  const categoryData = await categoryHelper.getAllCategory();
  res.render("user/shop-product", {
    message: "hi",
    product: productData,
    categories: categoryData,
    // cartcount:cartCount,
    // wishlistcount:wishlistCount
  });
};

const viewProduct = async (req, res) => {
  const id = req.params.id;

  if (req.session.user) {
    const userId = req.session.user._id;

    const cartStatus = await cartHelper.checkCart(id, userId);
    const wishListStatus = await whishlistHelper.checkWishlist(id, userId);

    userHelper.getProductDetails(id).then(async(response) => {
      const productDetails = await productHelper.productOfferCheck(response);

      if (cartStatus) {
        response.isCart = cartStatus;
      }
      if (wishListStatus) {
        response.isWishlist = wishListStatus;
      }

      res.render("user/productView", { product: productDetails });
    });
  } else {
    res.redirect("/login");
  }

  // const products = await productModel.findById(id)
  // console.log(products);
  // res.render("user/productView",{product:products});
};

const userCart = async (req, res) => {
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
};

const addToCart = async (req, res) => {
  const productId = req.params.id;
  const size = req.params.size;
  const userId = req.session.user._id;

  const stockCheck = await productHelper.stockChecking(productId, size);
  if (!stockCheck.status) {
    res.json({ status: false });
  } else {
    cartHelper.addProductToCart(productId, userId, size).then((response) => {
      res.json({ status: true });
    });
  }
};

const updateQuantity = async (req, res) => {
  const productId = req.query.productId;
  const size = req.query.size;
  const quantity = parseInt(req.query.quantity);
  const userId = req.session.user._id;

  cartHelper
    .quantityUpdation(productId, userId, quantity, size)
    .then((response) => {
      if (response.sizeExceed) {
        res.json({ sizeExceed: true });
      } else if (response.sizeLimit) {
        res.json({ sizeLimit: true });
      } else {
        res.json({ status: true });
      }
    })
    .catch((error) => {
      console.log(error);
    });
};

const removeFromCart = async (req, res) => {
  const productId = req.params.id;
  const userId = req.session.user._id;
  const result = await cartHelper.removeItem(userId, productId);

  if (result) {
    res.json({ status: true });
  } else {
    res.json({ status: false });
  }
};

const userWhishlist = async (req, res) => {
  const userId = req.session.user._id;

  whishlistHelper.getAllWhishlistItems(userId).then(async (response) => {
    const productDetails = await whishlistHelper.wishlistProductOfferCheck(userId,response);
    console.log(productDetails)
    

    res.render("user/wishlist-page", { products: productDetails });
  });
};

const addToWishlist = async (req, res) => {
  const productId = req.params.id;
  const userId = req.session.user._id;

  whishlistHelper.addProductToWishlist(productId, userId).then((response) => {
    res.json({ status: true });
  });
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

const loadUserProfile = async (req, res) => {
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

    res.render("user/account", { userData: response, orderData });
  });
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

const loadEditAddress = async (req, res) => {
  const addressId = req.query.addressId;
  const userId = req.session.user._id;
  userHelper.editAddress(userId, addressId).then((response) => {
    res.render("user/edit-address", { userData: response });
  });
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

const loadCheckout = async (req, res) => {
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
};

const getEditAddress = async (req, res) => {
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
};
const postEditAddress = async (req, res) => {
  const body = req.body;
  const userId = req.session.user._id;

  userHelper
    .addressEdit(userId, body)
    .then((response) => {
      console.log(response);
      res.redirect("/checkout");
    })
    .catch((error) => {
      console.log(error);
    });
};

const proceedPayment = async (req, res) => {
  const userId = req.session.user._id;
  const body = req.body;
  const cartItems = await cartModel.findOne({ user: userId });

  const result = await orderHelper.placeOrder(userId, body, cartItems);

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

const orderSuccess = (req, res) => {
  res.render("user/orderSuccess");
};

const cancelOrder = async (req, res) => {
  const orderId = req.params.id;
  orderHelper.orderCancellation(orderId).then(async (response) => {
    res.json(response);
  });
};

const orderDetails = async (req, res) => {
  const orderId = req.params.id;

  orderHelper.getSpecificOrder(orderId).then(async(response) => {
    const productDetails = await orderHelper.orderProductOfferCheck(response);
    

    res.render("user/each-orders", { productDetails: response });
  });
};

const cancelOrders = async (req, res) => {
  const orderId = req.params.orderId;
  const productId = req.params.productId;
  orderHelper
    .eachOrderCancellation(orderId, productId)
    .then(async (response) => {
      const stockUpdation = await productHelper.stockIncreasion(
        orderId,
        productId
      );
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
  cancelOrder,
  orderDetails,
  cancelOrders,
  addAddressPost,
  resendOtpForgotPass,

  getEditAddress,
  postEditAddress,
  loadAllProduct,
  searchProduct,
};
