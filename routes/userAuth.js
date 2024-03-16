const express = require('express');
const router = express.Router();
const userController=require("../controllers/userController");
const userMiddleware = require("../middleware/userMiddleware");
const couponController=require("../controllers/couponController");


router.get('/',userMiddleware.isRegistered,userController.loadhome)
router.get('/login',userController.loadlogin);
router.post('/login',userController.loaduserhome);
router.get('/logout',userMiddleware.isLogout,userController.userlogout);
router.get('/register',userMiddleware.isRegistered,userController.loadregister);
router.post('/register',userController.insertUser);
router.get('/otp-verification',userController.generateOtp)
router.post('/otp-verification',userMiddleware.otpExpiry,userController.verifyOtp);
router.post('/resendOtp',userController.resendOtp);


router.get('/forgotPassword',userController.loadForgotPass)
router.post('/forgotPassword',userController.forgotPassword)
router.get('/otpEnter',userController.sendOtp)
router.post('/otpEnter',userMiddleware.forgotOtpExpiry,userController.otpVerification);
router.post('/newPassword',userController.confirmPassword)
router.post('/resendOtpForgot',userController.resendOtpForgotPass);



router.get('/productView/:id',userController.viewProduct);
router.get('/shopProduct',userController.loadAllProduct);

router.get('/cartView',userMiddleware.isCheck,userController.userCart);
router.post('/addToCart/:id/:size',userMiddleware.isCheck,userController.addToCart);
router.patch('/updateQuantity',userController.updateQuantity);
router.delete('/removeProduct/:id/:size',userController.removeFromCart);

router.get('/whishlistView',userMiddleware.isCheck,userController.userWhishlist);
router.post('/addToWishlist/:id',userMiddleware.isCheck,userController.addToWishlist);
router.delete('/removeFromWishlist/:id',userController.removeFromWishlist);

router.get('/profileView',userMiddleware.isCheck,userController.loadUserProfile);
router.put('/addAddress',userController.addAddress);
router.patch('/deleteAddress/:id',userMiddleware.isCheck,userController.deleteAddress);
router.get('/editAddress',userMiddleware.isCheck,userController.loadEditAddress);
router.post('/editAddress',userController.editAddress);
router.post('/addressPost',userController.addAddressPost);
router.patch('/addMoneyToWallet',userMiddleware.isCheck,userController.addMoneyToWallet);

router.post('/changepassword',userMiddleware.isCheck,userController.changePassword);

router.post('/applyCoupon/:totalAmount',couponController.applyCoupon)

router.get('/checkout',userMiddleware.isCheck,userController.loadCheckout);
router.get('/editAddress/:id',userMiddleware.isCheck,userController.getEditAddress);
router.post('/edit-address',userMiddleware.isCheck,userController.postEditAddress);
router.post('/placeOrder',userMiddleware.isCheck,userController.proceedPayment);
router.post('/createorder',userMiddleware.isCheck,userController.createOrder);
router.post('/paymentSuccess',userMiddleware.isCheck,userController.paymentSuccess);
router.get('/orderSuccess',userMiddleware.isCheck,userController.orderSuccess);
router.patch('/cancelOrder/:id',userController.cancelOrder);
router.get('/orderDetails/:id',userMiddleware.isCheck,userController.orderDetails); 


router.patch('/cancelOrders/:orderId/:productId/:subTotal',userController.cancelOrders);
router.patch('/returnOrders/:orderId/:productId',userController.returnOrders);






router.post('/searchProduct/:query',userController.searchProduct);
router.post('/sortedProducts',userController.sortedProductsLoad);
router.post('/priceSortProducts',userController.priceSortedProductsLoad);



// router.get('/productDisplay/:id',userMiddleware.isCheck,userController.productDisplay);









module.exports=router