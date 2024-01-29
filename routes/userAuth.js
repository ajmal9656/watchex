const express = require('express');
const router = express.Router();
const userController=require("../controllers/userController");
const userMiddleware = require("../middleware/userMiddleware")

router.get('/',userController.loadhome)
router.get('/login',userController.loadlogin);
router.post('/login',userController.loaduserhome);
router.get('/logout',userController.userlogout);
router.get('/register',userController.loadregister);
router.post('/register',userController.insertUser);
router.get('/otp-verification',userController.generateOtp)
router.post('/otp-verification',userMiddleware.otpExpiry,userController.verifyOtp)





module.exports=router