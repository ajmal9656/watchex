const express = require('express');
const router = express.Router();
const adminController=require("../controllers/adminConroller");
const offerController=require("../controllers/offerController");
const couponController=require("../controllers/couponController");
const bannerController=require("../controllers/bannerController");
const adminMiddleware = require("../middleware/adminMiddleware");
const multerMiddleware = require("../middleware/multer");



router.get("/",adminController.loadAdmin);
router.post("/",adminController.loadAdminHome);
router.post("/showChart",adminMiddleware.isLogout,adminController.showChart)
router.get("/logout",adminMiddleware.isLogout,adminController.logoutAdmin);


router.get("/usersList",adminMiddleware.isLogout,adminController.userList);
router.patch("/block-unblock-user/:id",adminMiddleware.isLogout,adminController.blockOrUnblockUser);


router.get("/category",adminMiddleware.isLogout,adminController.loadCategory);
router.post("/createCategory",adminMiddleware.isLogout,adminController.createCategory);
router.patch("/deleteCategory/:id",adminMiddleware.isLogout,adminController.softDeleteCategory);
router.get("/editcategory",adminMiddleware.isLogout,adminController.loadEditcategory);
router.put("/editcategory/:id",adminMiddleware.isLogout,adminController.editCategory);


router.get("/productList",adminMiddleware.isLogout,adminController.LoadProduct);
router.get("/getAddProduct",adminMiddleware.isLogout,adminController.loadAddProduct);
router.post("/addProduct",adminMiddleware.isLogout,multerMiddleware.productUpload,adminController.addProduct);
router.patch("/delete-product/:id",adminMiddleware.isLogout,adminController.softDeleteProduct);
router.get("/edit-product/:id",adminMiddleware.isLogout,adminController.loadEditProduct);
router.put("/edit-product/:id",adminMiddleware.isLogout,multerMiddleware.productUpload,adminController.editProduct);
router.patch("/deleteImage/:id/:image",adminMiddleware.isLogout,adminController.deleteImage);


router.get("/allOrders",adminMiddleware.isLogout,adminController.loadOrders);
router.post("/orderStatus",adminMiddleware.isLogout,adminController.changeOrderStatus);
router.get("/orderDetails/:id",adminMiddleware.isLogout,adminController.loadOrderDetails);

router.post("/orderStatusChange",adminMiddleware.isLogout,adminController.changeSpecificOrderStatus);
router.post("/approveReturn/:subTotal",adminMiddleware.isLogout,adminController.acceptReturn);

router.get("/coupons",adminMiddleware.isLogout,couponController.loadCoupons);
router.post("/add-coupon",adminMiddleware.isLogout,couponController.addCoupon);
router.patch("/deleteCoupon/:id",adminMiddleware.isLogout,couponController.deleteCoupon);
router.get("/edit-coupon/:id",adminMiddleware.isLogout,couponController.getEditCoupon);
router.post("/edit-coupon",adminMiddleware.isLogout,couponController.postEditCoupon);

router.get("/categoryOffers",adminMiddleware.isLogout,offerController.loadCategoryOffers);
router.post("/add-offer",adminMiddleware.isLogout,offerController.addCategoryOffer);
router.get("/edit-offer/:id",adminMiddleware.isLogout,offerController.getEditOffer);
router.post("/edit-offer",adminMiddleware.isLogout,offerController.postEditOffer);
router.patch("/deleteCategoryOffer/:id",adminMiddleware.isLogout,offerController.softDeleteCategoryOffer);


router.get("/productOffers",adminMiddleware.isLogout,offerController.loadProductOffers);
router.post("/add-prodOffer",adminMiddleware.isLogout,offerController.addProductOffer);
router.get("/edit-prodOffer/:id",adminMiddleware.isLogout,offerController.getEditOffer);
router.post("/edit-prodOffer",adminMiddleware.isLogout,offerController.postEditProductOffer);
router.patch("/deleteProductOffer/:id",adminMiddleware.isLogout,offerController.softDeleteProductOffer);


router.get("/salesReport",adminMiddleware.isLogout,adminController.loadSalesReport);
router.post("/salesReportDateSort",adminMiddleware.isLogout,adminController.loadSalesReportDateSort);


router.get("/banners",adminMiddleware.isLogout,bannerController.loadBanners);
router.get("/getAddBanner",adminMiddleware.isLogout,bannerController.loadAddBanner);
router.post("/addBanner",adminMiddleware.isLogout,multerMiddleware.productUpload,bannerController.addBanner);
router.get("/edit-banner/:id",adminMiddleware.isLogout,bannerController.loadEditBanner);
router.put("/edit-banner/:id",adminMiddleware.isLogout,multerMiddleware.productUpload,bannerController.editBanner);
router.patch("/delete-banner/:id",adminMiddleware.isLogout,bannerController.softDeleteBanner);

module.exports=router;