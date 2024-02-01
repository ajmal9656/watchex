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





module.exports=router