const express = require('express');
const router = express.Router();
const adminController=require("../controllers/adminConroller");
const adminMiddleware = require("../middleware/adminMiddleware");
const multerMiddleware = require("../middleware/multer");



router.get("/",adminController.loadAdmin);
router.post("/",adminController.loadAdminHome);
router.get("/usersList",adminController.userList);
router.get("/block-unblock-user/:id",adminController.blockOrUnblockUser);
router.get("/category",adminController.loadCategory);
router.post("/createCategory",adminController.createCategory);
router.get("/deleteCategory/:id",adminController.softDeleteCategory);
router.get("/productList",adminController.LoadProduct);
router.get("/getAddProduct",adminController.loadAddProduct);
router.get("/editcategory",adminController.loadEditcategory);
router.put("/editcategory/:id",adminController.editCategory);
router.post("/addProduct",multerMiddleware.productUpload,adminController.addProduct);
router.get("/delete-product/:id",adminController.softDeleteCategory);


module.exports=router;