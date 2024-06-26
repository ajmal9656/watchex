const express = require('express');
const router = express.Router();
const userController=require("../controllers/userController");
const userMiddleware = require("../middleware/userMiddleware");
const couponController=require("../controllers/couponController");


router.get('/',userController.loadhome)
router.get('/login',userController.loadlogin);
router.post('/login',userController.loaduserhome);
router.get('/logout',userMiddleware.isLogout,userController.userlogout);
router.get('/register',userController.loadregister);
router.post('/register',userController.insertUser);
router.get('/otp-verification',userController.generateOtp)
router.post('/otp-verification',userMiddleware.otpExpiry,userController.verifyOtp);
router.post('/resendOtp',userController.resendOtp);


router.get('/forgotPassword',userController.loadForgotPass)
router.post('/forgotPassword',userController.forgotPassword)
router.get('/otpEnter',userController.sendOtp)
router.post('/otpEnter',userMiddleware.forgotOtpExpiry,userController.otpVerification);
router.post('/newPassword',userController.confirmPassword)
router.get('/new-password',userController.getNewPassword)
router.post('/resendOtpForgot',userController.resendOtpForgotPass);



router.get('/productView/:id',userMiddleware.isCheck,userController.viewProduct);
router.get('/shopProduct',userMiddleware.isCheck,userController.loadAllProduct);
router.get("/shopFilter",userMiddleware.isCheck, userController.shopFilterLoad);

router.get('/cartView',userMiddleware.isCheck,userController.userCart);
router.post('/addToCart/:id/:size',userMiddleware.isCheck,userController.addToCart);
router.patch('/updateQuantity',userMiddleware.isCheck,userController.updateQuantity);
router.delete('/removeProduct/:id/:size',userMiddleware.isCheck,userController.removeFromCart);

router.get('/whishlistView',userMiddleware.isCheck,userController.userWhishlist);
router.post('/addToWishlist/:id',userMiddleware.isCheck,userController.addToWishlist);
router.delete('/removeFromWishlist/:id',userMiddleware.isCheck,userController.removeFromWishlist);

router.get('/profileView',userMiddleware.isCheck,userController.loadUserProfile);
router.put('/addAddress',userMiddleware.isCheck,userController.addAddress);
router.patch('/deleteAddress/:id',userMiddleware.isCheck,userController.deleteAddress);
router.get('/editAddress',userMiddleware.isCheck,userController.loadEditAddress);
router.post('/editAddress',userMiddleware.isCheck,userController.editAddress);
router.post('/addressPost',userMiddleware.isCheck,userController.addAddressPost);
router.put('/editAccount',userMiddleware.isCheck,userController.editAccount);
router.patch('/addMoneyToWallet',userMiddleware.isCheck,userController.addMoneyToWallet);

router.post('/changepassword',userMiddleware.isCheck,userController.changePassword);

router.post('/applyCoupon/:totalAmount',userMiddleware.isCheck,couponController.applyCoupon)

router.get('/checkout',userMiddleware.cartCheck,userController.loadCheckout);
router.get('/editAddress/:id',userMiddleware.isCheck,userController.getEditAddress);
router.post('/edit-address',userMiddleware.isCheck,userController.postEditAddress);
router.post('/placeOrder',userMiddleware.isCheck,userController.proceedPayment);
router.post('/createorder',userMiddleware.isCheck,userController.createOrder);
router.post('/paymentSuccess',userMiddleware.isCheck,userController.paymentSuccess);
router.get('/orderSuccess',userMiddleware.isCheck,userController.orderSuccess);
router.patch('/cancelOrder/:id',userMiddleware.isCheck,userController.cancelOrder);
router.get('/orderDetails/:id',userMiddleware.isCheck,userController.orderDetails); 

router.get('/orderFailedPage',userMiddleware.isCheck,userController.getOrderFailed); 
router.post('/createorders',userMiddleware.isCheck,userController.createOrders);
router.post('/paymentSuccesses',userMiddleware.isCheck,userController.paymentSuccess);
router.patch('/retryPayment',userMiddleware.isCheck,userController.retryPayment); 


router.patch('/cancelOrders/:orderId/:productId/:subTotal/:size',userMiddleware.isCheck,userController.cancelOrders);
router.patch('/returnOrders/:orderId/:productId/:size',userMiddleware.isCheck,userController.returnOrders);






router.post('/searchProduct/:query',userMiddleware.isCheck,userController.searchProduct);
router.post('/sortedProducts',userMiddleware.isCheck,userController.sortedProductsLoad);
router.post('/priceSortProducts',userMiddleware.isCheck,userController.priceSortedProductsLoad);












module.exports=router