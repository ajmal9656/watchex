const express = require('express');
const router = express.Router();
const userController=require("../controllers/userController");
const userMiddleware = require("../middleware/userMiddleware")

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
// router.get('/otpEnter',userController.sendOtp)
router.post('/otpEnter',userMiddleware.forgotOtpExpiry,userController.otpVerification);
router.post('/newPassword',userController.confirmPassword)



router.get('/productView/:id',userMiddleware.isCheck,userController.viewProduct);

router.get('/cartView',userMiddleware.isCheck,userController.userCart);
router.post('/addToCart/:id/:size',userController.addToCart);
router.patch('/updateQuantity',userController.updateQuantity);
router.delete('/removeProduct/:id',userController.removeFromCart);

router.get('/whishlistView',userMiddleware.isCheck,userController.userWhishlist);
router.post('/addToWishlist/:id',userController.addToWishlist);
router.delete('/removeFromWishlist/:id',userController.removeFromWishlist);

router.get('/profileView',userMiddleware.isCheck,userController.loadUserProfile);
router.put('/addAddress',userController.addAddress);
router.get('/deleteAddress/:id',userMiddleware.isCheck,userController.deleteAddress);
router.get('/editAddress',userMiddleware.isCheck,userController.loadEditAddress);
router.post('/editAddress',userController.editAddress);
router.post('/addressPost',userController.addAddressPost);

router.post('/changepassword',userMiddleware.isCheck,userController.changePassword);

router.get('/checkout',userMiddleware.isCheck,userController.loadCheckout);
router.post('/proceedPayment',userMiddleware.isCheck,userController.proceedPayment);
router.get('/orderSuccess',userMiddleware.isCheck,userController.orderSuccess);
router.patch('/cancelOrder/:id',userController.cancelOrder);
router.get('/orderDetails/:id',userMiddleware.isCheck,userController.orderDetails); 

router.patch('/cancelOrders/:orderId/:productId',userController.cancelOrders);






module.exports=router