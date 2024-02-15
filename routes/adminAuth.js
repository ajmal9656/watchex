const express = require('express');
const router = express.Router();
const adminController=require("../controllers/adminConroller");
const adminMiddleware = require("../middleware/adminMiddleware");
const multerMiddleware = require("../middleware/multer");



router.get("/",adminController.loadAdmin);
router.post("/",adminController.loadAdminHome);
router.get("/logout",adminMiddleware.isLogout,adminController.logoutAdmin);


router.get("/usersList",adminMiddleware.isLogout,adminController.userList);
router.get("/block-unblock-user/:id",adminMiddleware.isLogout,adminController.blockOrUnblockUser);


router.get("/category",adminMiddleware.isLogout,adminController.loadCategory);
router.post("/createCategory",adminController.createCategory);
router.get("/deleteCategory/:id",adminMiddleware.isLogout,adminController.softDeleteCategory);
router.get("/editcategory",adminMiddleware.isLogout,adminController.loadEditcategory);
router.put("/editcategory/:id",adminController.editCategory);


router.get("/productList",adminMiddleware.isLogout,adminController.LoadProduct);
router.get("/getAddProduct",adminMiddleware.isLogout,adminController.loadAddProduct);
router.post("/addProduct",multerMiddleware.productUpload,adminController.addProduct);
router.get("/delete-product/:id",adminMiddleware.isLogout,adminController.softDeleteProduct);
router.get("/edit-product/:id",adminMiddleware.isLogout,adminController.loadEditProduct);
router.put("/edit-product/:id",multerMiddleware.productUpload,adminController.editProduct);


router.get("/allOrders",adminMiddleware.isLogout,adminController.loadOrders);
router.post("/orderStatus",adminController.changeOrderStatus);
router.get("/orderDetails/:id",adminController.loadOrderDetails);

module.exports=router;