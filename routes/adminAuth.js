const express = require('express');
const router = express.Router();
const adminController=require("../controllers/adminConroller");
const offerController=require("../controllers/offerController");
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

router.post("/orderStatusChange",adminController.changeSpecificOrderStatus);

router.get("/coupons",adminMiddleware.isLogout,adminController.loadCoupons);
router.post("/add-coupon",adminMiddleware.isLogout,adminController.addCoupon);
router.get("/deleteCoupon/:id",adminMiddleware.isLogout,adminController.deleteCoupon);
router.get("/edit-coupon/:id",adminMiddleware.isLogout,adminController.getEditCoupon);
router.post("/edit-coupon",adminMiddleware.isLogout,adminController.postEditCoupon);

router.get("/categoryOffers",adminMiddleware.isLogout,offerController.loadCategoryOffers);
router.post("/add-offer",adminMiddleware.isLogout,offerController.addCategoryOffer);
router.get("/edit-offer/:id",adminMiddleware.isLogout,offerController.getEditOffer);
router.post("/edit-offer",adminMiddleware.isLogout,offerController.postEditOffer);
router.get("/deleteCategoryOffer/:id",adminMiddleware.isLogout,offerController.softDeleteCategoryOffer);


router.get("/productOffers",adminMiddleware.isLogout,offerController.loadProductOffers);
router.post("/add-prodOffer",adminMiddleware.isLogout,offerController.addProductOffer);
router.get("/edit-prodOffer/:id",adminMiddleware.isLogout,offerController.getEditOffer);
router.post("/edit-prodOffer",adminMiddleware.isLogout,offerController.postEditProductOffer);
router.get("/deleteProductOffer/:id",adminMiddleware.isLogout,offerController.softDeleteProductOffer);

module.exports=router;