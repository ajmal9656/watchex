const express = require('express');
const router = express.Router();
const userController=require("../controllers/userController");
const userMiddleware = require("../middleware/userMiddleware")

router.get('/',userMiddleware.isRegistered,userController.loadhome)
router.get('/login',userMiddleware.isRegistered,userController.loadlogin);
router.post('/login',userController.loaduserhome);
router.get('/logout',userMiddleware.isLogout,userController.userlogout);
router.get('/register',userMiddleware.isRegistered,userController.loadregister);
router.post('/register',userController.insertUser);
router.get('/otp-verification',userController.generateOtp)
router.post('/otp-verification',userMiddleware.otpExpiry,userController.verifyOtp);
router.get('/productView/:id',userMiddleware.isCheck,userController.viewProduct);

router.get('/cartView',userController.userCart);
router.post('/addToCart/:id/:size',userController.addToCart);
router.patch('/updateQuantity',userController.updateQuantity);
router.delete('/removeProduct/:id',userController.removeFromCart);

router.get('/whishlistView',userController.userWhishlist);
router.post('/addToWishlist/:id',userController.addToWishlist);

router.get('/profileView',userController.loadUserProfile);
router.put('/addAddress',userController.addAddress);






module.exports=router