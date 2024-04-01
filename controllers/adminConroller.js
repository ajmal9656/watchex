const userlistHelper = require("../helpers/userlistHelper");
const categoryHelper = require("../helpers/cateroryHelper");
const productListHelper = require("../helpers/productHelper");
const adminHelper = require("../helpers/adminHelper");
const categoryModel = require("../models/categoryModel");
const orderModel = require("../models/orderModel");
const productModel = require("../models/productModel");
const adminModel = require("../models/adminModel");
const { response } = require("express");
const orderHelper = require("../helpers/orderHelper");
const couponHelper = require("../helpers/couponHelper");
const productHelper = require("../helpers/productHelper");
const offerHelper = require("../helpers/offerHelper");
const moment = require("moment")
const fs = require('fs');

const loadAdmin = async function (req, res,next) {
  try{
    
    if (req.session.admin) {
      const salesDetails = await orderModel.find();

    // Fetch all products and categories
    const products = await productModel.find();
    const categories = await categoryModel.find();

    // Aggregate for finding the top selling products
    const topSellingProducts = await orderModel.aggregate([
      { $unwind: "$products" }, // Split orders into individual products
      {
        $group: {
          _id: "$products.product",
          totalQuantity: { $sum: "$products.quantity" },
        },
      }, // Group by productId and sum quantities
      { $sort: { totalQuantity: -1 } }, // Sort by total quantity descending
      { $limit: 10 }, // Limit to top 10 products
    ]);

    // Extract product IDs of top selling products
    const productIds = topSellingProducts.map((product) => product._id);

    
    // Fetch details of top selling products
    const productsData = await productModel.find(
      { _id: { $in: productIds } },
      { product_name: 1, image: 1 }
    );

    // Aggregate to find the top selling categories
    const topSellingCategories = await orderModel.aggregate([
      { $unwind: "$products" }, // Split orders into individual products
      {
        $lookup: {
          from: "products",
          localField: "products.product",
          foreignField: "_id",
          as: "product",
        },
      }, // Lookup products collection to get product details
      { $unwind: "$product" }, // Unwind the product array
      {
        $lookup: {
          from: "categories",
          localField: "product.product_category",
          foreignField: "_id",
          as: "category",
        },
      }, // Lookup categories collection to get category details
      { $unwind: "$category" }, // Unwind the category array
      {
        $group: {
          _id: "$category._id",
          totalQuantity: { $sum: "$products.quantity" },
        },
      }, // Group by categoryId and sum quantities
      { $sort: { totalQuantity: -1 } }, // Sort by total quantity descending
      { $limit: 10 }, // Limit to top 10 categories
    ]);

    // Fetch details of the top selling categories
    const topSellingCategoriesData = await categoryModel.find({
      _id: { $in: topSellingCategories.map((cat) => cat._id) },
    });

    res.render("admin/index", {
      salesDetails: salesDetails,
      products: products,
      categories: categories, // Pass categories to the rendering context
      productsData: productsData,
      topSellingCategories: topSellingCategoriesData,
      topSellingProducts: topSellingProducts,
    });
      
    } else {
      const message = req.flash("message");
      res.render("admin/login-page", { message: message });
    }

  }catch(error){
    next(error)
  }
  
};
const showChart = async (req, res) => {
  try {
    if (req.body.msg) {
      // Aggregate monthly sales data
      const monthlySalesData = await orderModel.aggregate([
        {
          $match: { "products.orderStatus": "delivered" }, // Consider only delivered orders
        },
        {
          $group: {
            _id: { $month: "$orderedOn" }, // Group by month
            totalAmount: { $sum: "$totalAmount" }, // Calculate total sales amount for each month
          },
        },
        {
          $sort: { _id: 1 }, // Sort by month
        },
      ]);
      console.log(monthlySalesData);

      // Aggregate daily sales data
      const dailySalesData = await orderModel.aggregate([
        {
          $match: { "products.orderStatus": "delivered" }, // Consider only delivered orders
        },
        {
          $group: {
            _id: { $dayOfMonth: "$orderedOn" }, // Group by day of month
            totalAmount: { $sum: "$totalAmount" }, // Calculate total sales amount for each day
          },
        },
        {
          $sort: { _id: 1 }, // Sort by day of month
        },
      ]);
      console.log("dailySalesData")
      console.log(dailySalesData)
      console.log("dailySalesData")

      const orderStatuses = await orderModel.aggregate([
        {
          $unwind: "$products", // Unwind the products array
        },
        {
          $group: {
            _id: "$products.orderStatus", // Group by order status
            count: { $sum: 1 }, // Count occurrences of each status
          },
        },
      ]);
      console.log(orderStatuses);

      // Map order statuses to object format
      const eachOrderStatusCount = {};
      orderStatuses.forEach((status) => {
        eachOrderStatusCount[status._id] = status.count;
      });
      console.log(eachOrderStatusCount);

      res
        .status(200)
        .json({ monthlySalesData, dailySalesData, eachOrderStatusCount });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const loadAdminHome = async (req, res) => {
  const admin = req.body;
  adminHelper
    .checkAdmin(admin)
    .then((response) => {
      if (response.logId) {
        req.session.admin = response.data;
        res.redirect("/admin");
      } else {
        req.flash("message", response.errorMessage);
        res.redirect("/admin");
      }
    })
    .catch((error) => {
      console.log(error);
    });
};
const loadDashboard = async (req, res, next) => {
  try {
    // Fetch all orders
    const salesDetails = await orderModel.find();

    // Fetch all products and categories
    const products = await productModel.find();
    const categories = await categoryModel.find();

    // Aggregate for finding the top selling products
    const topSellingProducts = await orderModel.aggregate([
      { $unwind: "$products" }, // Split orders into individual products
      {
        $group: {
          _id: "$products.product",
          totalQuantity: { $sum: "$products.quantity" },
        },
      }, // Group by productId and sum quantities
      { $sort: { totalQuantity: -1 } }, // Sort by total quantity descending
      { $limit: 10 }, // Limit to top 10 products
    ]);

    // Extract product IDs of top selling products
    const productIds = topSellingProducts.map((product) => product._id);

    
    // Fetch details of top selling products
    const productsData = await productModel.find(
      { _id: { $in: productIds } },
      { productName: 1, image: 1 }
    );

    // Aggregate to find the top selling categories
    const topSellingCategories = await orderModel.aggregate([
      { $unwind: "$products" }, // Split orders into individual products
      {
        $lookup: {
          from: "products",
          localField: "products.product",
          foreignField: "_id",
          as: "product",
        },
      }, // Lookup products collection to get product details
      { $unwind: "$product" }, // Unwind the product array
      {
        $lookup: {
          from: "categories",
          localField: "product.productCategory",
          foreignField: "_id",
          as: "category",
        },
      }, // Lookup categories collection to get category details
      { $unwind: "$category" }, // Unwind the category array
      {
        $group: {
          _id: "$category._id",
          totalQuantity: { $sum: "$products.quantity" },
        },
      }, // Group by categoryId and sum quantities
      { $sort: { totalQuantity: -1 } }, // Sort by total quantity descending
      { $limit: 10 }, // Limit to top 10 categories
    ]);

    // Fetch details of the top selling categories
    const topSellingCategoriesData = await categoryModel.find({
      _id: { $in: topSellingCategories.map((cat) => cat._id) },
    });

    res.render("admin/dashBoard", {
      salesDetails: salesDetails,
      products: products,
      categories: categories, // Pass categories to the rendering context
      productsData: productsData,
      topSellingCategories: topSellingCategoriesData,
      topSellingProducts: topSellingProducts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const logoutAdmin = async (req, res,next) => {
  try {
    if (req.session.admin) {
      req.session.destroy((error) => {
        if (error) {
          res.redirect("/admin");
        } else {
          res.redirect("/admin");
        }
      });
    } else {
      res.redirect("/admin");
    }
  } catch (error) {
    next(error);
  }
};

const userList = async (req, res,next) => {
  try{
    userlistHelper
    .getList()
    .then((response) => {
      let itemsPerPage = 2
      let currentPage = parseInt(req.query.page) || 1
      let startIndex = (currentPage-1)* itemsPerPage
      let endIndex = startIndex +itemsPerPage
      let totalPages = Math.ceil(response.length/itemsPerPage)
      const currentusers = response.slice(startIndex,endIndex)
      res.render("admin/usersList", { users: currentusers,currentPage,totalPages });
    })
    .catch((error) => {
      console.log(error);
    });

  }catch(error){
    next(error)
  }
 
};

const blockOrUnblockUser = async (req, res) => {
  let userId = req.params.id;
  await userlistHelper
    .blockOrUnblock(userId)
    .then((response) => {
      if (response.isActive) {
        res.status(200).json({
          error: false,
          message: "User has been unBlocked",
          user: response,
        });
      } else {
        delete req.session.user;
        res.status(200).json({
          error: false,
          message: "User has been Blocked",
          user: response,
        });
      }
    })
    .catch((error) => {
      res
        .status(200)
        .json({ error: true, message: "Something went wrong", user: result });
      console.log(error);
    });
};

const loadCategory = async (req, res,next) => {
  try{
    categoryHelper.categoryList().then((category) => {
      let itemsPerPage = 2
      let currentPage = parseInt(req.query.page) || 1
      let startIndex = (currentPage-1)* itemsPerPage
      let endIndex = startIndex +itemsPerPage
      let totalPages = Math.ceil(category.length/itemsPerPage)
      const currentProduct = category.slice(startIndex,endIndex)

      
      res.render("admin/categoryList", { categories: currentProduct,currentPage,totalPages });
    });

  }catch(error){
    next(error)
  }
  
};

const createCategory = async (req, res) => {
  const catDetails = req.body;
  categoryHelper.addCategory(catDetails).then((response) => {
    res.json(response);
  });
};

const softDeleteCategory = async (req, res) => {
  const id = req.params.id;

  categoryHelper.catSoftDeletion(id).then((response) => {
    if (response.status) {
      res
        .status(200)
        .json({ error: false, message: "category listed", listed: true });
    } else {
      res
        .status(200)
        .json({ error: false, message: "category unlisted", listed: false });
    }
  });
};

const loadEditcategory = async (req, res,next) => {
  try{
    const id = req.query.catId;
  const catData = await categoryModel.findOne({ _id: id });
  
  res.render("admin/editCategory", { category: catData });

  }catch(error){
    next(error)
  }
  
};

const editCategory = async (req, res) => {
  const id = req.params.id;

  const check = await categoryModel.findOne({ name: req.body.catName });
  
  const checks = await categoryModel.findOne({ _id: id });

  if (!check) {
    checks.name = req.body.catName;
    checks.description = req.body.catDescription;
    await checks.save();

    res.redirect("/admin/category");
  } else if (id == check._id) {
    check.name = req.body.catName;
    check.description = req.body.catDescription;
    await check.save();

    res.redirect("/admin/category");
  } else {
    res.send("already exist");
  }
};
const LoadProduct = async (req, res,next) => {
  try{
    productListHelper
    .productList()
    .then((response) => {
      let itemsPerPage = 2
        let currentPage = parseInt(req.query.page) || 1
        let startIndex = (currentPage-1)* itemsPerPage
        let endIndex = startIndex +itemsPerPage
        let totalPages = Math.ceil(response.length/itemsPerPage)
        const currentProduct = response.slice(startIndex,endIndex)
      
      res.render("admin/productList", { products: currentProduct,currentPage,totalPages });
    })
    .catch((error) => {
      console.log(error);
    });

  }catch(error){
    next(error)
  }
  
};

const loadAddProduct = async (req, res,next) => {
  try{
    productListHelper.getAddProduct().then((response) => {
      res.render("admin/addProduct", { category: response });
    });

  }catch(error){
    next(error)
  }
  
};

const addProduct = async (req, res) => {
  const productData = req.body;
  const files = req.files;
  productListHelper
    .productAdd(productData, files)
    .then((response) => {
      res.redirect("/admin/productList");
    })
    .catch((error) => {
      console.log(error);
    });
};

const softDeleteProduct = (req, res) => {
  const id = req.params.id;
 
  productListHelper
    .deleteProduct(id)
    .then((response) => {
      if (response.product_status) {
        res.json({ message: "Product listed" });
      } else {
        res.json({ message: "Product unlisted" });
      }
    })
    .catch((error) => {
      console.log(error);
    });
};

const loadEditProduct = async (req, res,next) => {
  try{
    const id = req.params.id;
  const productData = await productModel.findById(id);
  const catData = await categoryHelper.getAllCategory();
  console.log(productData)
  res.render("admin/editProduct", {
    product: productData,
    categories: catData,
  });

  }catch(error){
    next(error)
  }
  
};

const editProduct = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.id);
    const quantityS = product.product_quantity.S;
    const quantityM = product.product_quantity.M;
    const quantityL = product.product_quantity.L;
    const totalQuantity = parseInt(req.body.smallQuantity)+parseInt(req.body.mediumQuantity)+parseInt(req.body.largeQuantity)
    if (!product) {
      return res.redirect("/admin/productList");
    }
    const check = await productListHelper.checkDuplicateProduct(
      req.params.id,
      req.body
    );
    switch (check.status) {
      case 1:
        product.product_name = req.body.product_name;
        product.product_description = req.body.product_description;
        product.product_price = req.body.product_price;
        
        quantityS.quantity = req.body.smallQuantity;
        quantityM.quantity = req.body.mediumQuantity;
        quantityL.quantity = req.body.largeQuantity;
        product.total_quantity = totalQuantity;
        product.product_category = req.body.product_category;
        product.product_discount = req.body.product_discount;
        break;
      case 2:
        product.product_name = req.body.product_name;
        product.product_description = req.body.product_description;
        product.product_price = req.body.product_price;
        
        quantityS.quantity = req.body.smallQuantity;
        quantityM.quantity = req.body.mediumQuantity;
        quantityL.quantity = req.body.largeQuantity;
        product.product_category = req.body.product_category;
        product.product_discount = req.body.product_discount;
        
        break;
      case 3:
        console.log("Product already Exists");
        break;
      default:
        console.log("error");
        break;
    }

    if (req.files) {
      const filenames = await productListHelper.editImages(
        product.image,
        req.files
      );
      product.image = filenames;
    }
    await product.save();
    res.redirect("/admin/productList");
  } catch (err) {
    console.log(err);
  }
};
const deleteImage = async (req,res)=>{
  try{
    
    const productId = req.params.id;
    const image = req.params.image;

    console.log(image)

    const updatedProduct = await productModel.findByIdAndUpdate(
      {_id:productId},
      { $pull: { image: image } }, // Use $pull to remove the specified image from the images array
      { new: true } // Set { new: true } to return the updated document after the update operation
  );
  console.log(updatedProduct)
  fs.unlink("public/uploads/" + image, (err) => {
    if (err) {
      reject(err);
    }
  });

  if(updatedProduct){
    res.json({message : "image deleted"});

  }else{
    res.json({message : "something went wrong"});

  }
  





  }catch(error){
    console.log(error)

  }
}

const loadOrders = async(req,res,next)=>{
  try{
    const allOrders = await orderHelper.getAllOrders();

  for(const order of allOrders){
    order.formattedDate = moment(order.orderedOn).format("MMM Do, YYYY");
  }
  let itemsPerPage = 2
      let currentPage = parseInt(req.query.page) || 1
      let startIndex = (currentPage-1)* itemsPerPage
      let endIndex = startIndex +itemsPerPage
      let totalPages = Math.ceil(allOrders.length/itemsPerPage)
      const orders = allOrders.slice(startIndex,endIndex)

  res.render("admin/orders",{allOrders:orders,currentPage,totalPages});

  }catch(error){
    next(error)
  }

  



}

const changeOrderStatus = async (req,res)=>{
  const orderId = req.body.orderId;
  const changeStatus = req.body.status;

  await orderHelper.orderStatusChange(orderId,changeStatus).then((result)=>{
    
    res.json({status:true})

  })
}

const loadOrderDetails = async(req,res,next)=>{
  try{
    const orderId = req.params.id;

    orderHelper.getSpecificOrder(orderId).then(async(response)=>{
      console.log(response)
      console.log(response[0].orderedProduct)
      
  
      const productDetails = await orderHelper.orderedProductOfferCheck(response);
  
      console.log(response)
      console.log(response[0].orderedProduct)
      
  
  
      
  
      
  
      res.render("admin/order-details",{orderDetails:productDetails})
  
  
    })

  }catch(error){
    next(error)
  }

 



}
const changeSpecificOrderStatus = async (req,res)=>{
  const orderId = req.body.orderId;
  const productId = req.body.productId;
  const size = req.body.size;


  const changeStatus = req.body.status;
  console.log(orderId)
  console.log(productId)
  console.log(changeStatus)

  await orderHelper.specificOrderStatusChange(orderId,productId,changeStatus,size).then((result)=>{
    
    
    res.json({status:true})

  })
}

const acceptReturn = async (req,res)=>{
  const orderId = req.body.orderId;
  const productId = req.body.productId;
  const size = req.body.size;
  const subTotal = req.params.subTotal;
  

  const changeStatus = req.body.status;
  console.log(orderId)
  console.log(productId)
  console.log(changeStatus)

  await orderHelper.returnApproval(orderId,productId,changeStatus,subTotal,size).then(async(result)=>{
    const stockUpdation = await productHelper.stockIncreasion(
      orderId,
      productId
    );

    
    res.json({status:true})

  })
}

const loadSalesReport = async (req, res,next) => {
  try{
    orderHelper
    .salesReport()
    .then((response) => {
      console.log("sojiouajcn");
      console.log(response)
      response.forEach((order) => {
        const orderDate = new Date(order.orderedOn)
        const formattedDate = orderDate.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
        order.orderedOn = formattedDate
      })
      let itemsPerPage = 2
      let currentPage = parseInt(req.query.page) || 1
      let startIndex = (currentPage-1)* itemsPerPage
      let endIndex = startIndex +itemsPerPage
      let totalPages = Math.ceil(response.length/itemsPerPage)
      const responseAll = response.slice(startIndex,endIndex)
      
     
      res.render("admin/sales-report", { sales: responseAll,currentPage,totalPages });
    })
    .catch((error) => {
      console.log(error);
    });

  }catch(error){
    next(error)
  }
  
};

const loadSalesReportDateSort = async (req, res) => {

const startDate = req.body.startDate;
const endDate = req.body.endDate;
  orderHelper
    .salesReportDateSort(startDate,endDate)
    .then((response) => {
      console.log("sojiouajcn");
      console.log(response)
      response.forEach((order) => {
        const orderDate = new Date(order.orderedOn)
        const formattedDate = orderDate.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
        order.orderedOn = formattedDate
      })
      let itemsPerPage = 2
      let currentPage = parseInt(req.query.page) || 1
      let startIndex = (currentPage-1)* itemsPerPage
      let endIndex = startIndex +itemsPerPage
      let totalPages = Math.ceil(response.length/itemsPerPage)
      const responseAll = response.slice(startIndex,endIndex)
     
      res.json({ sales: responseAll,currentPage,totalPages });
    })
    .catch((error) => {
      console.log(error);
    });
};






module.exports = {
  userList,
  showChart,
  blockOrUnblockUser,
  loadCategory,
  createCategory,
  softDeleteCategory,
  LoadProduct,
  loadAddProduct,
  loadEditcategory,
  editCategory,
  addProduct,
  loadAdmin,
  loadAdminHome,
  softDeleteProduct,
  loadEditProduct,
  editProduct,
  logoutAdmin,
  loadOrders,
  changeOrderStatus,
  loadOrderDetails,
  changeSpecificOrderStatus,
  acceptReturn,
  loadSalesReport,
  loadSalesReportDateSort,
  deleteImage
  
  
};
