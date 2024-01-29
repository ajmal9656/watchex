const userlistHelper = require("../helpers/userlistHelper");
const categoryHelper = require("../helpers/cateroryHelper");
const productListHelper = require("../helpers/productHelper");
const adminHelper = require("../helpers/adminHelper");
const categoryModel = require("../models/categoryModel");
const adminModel = require("../models/adminModel");
const { response } = require("express");



const loadAdmin= function(req,res){
  if (req.session.admin) {
    res.render("admin/index");
  } 
   else {
    const message=req.flash("message")
    res.render("admin/login-page",{message:message});
  }

  
}
const loadAdminHome=async(req,res)=>{
  const admin=req.body;
  adminHelper.checkAdmin(admin).then((response)=>{
    if(response.logId){
      req.session.admin=response.data;
      res.redirect("/admin")

    }
    else{
      req.flash("message",response.errorMessage);
      res.redirect("/admin")

    }

  }).catch((error)=>{
    console.log(error)
  })
  
}

const userList = async (req, res) => {
  userlistHelper
    .getList()
    .then((response) => {
      res.render("admin/usersList", { users: response });
    })
    .catch((error) => {
      console.log(error);
    });
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

const loadCategory = async (req, res) => {
  categoryHelper.categoryList().then((category) => {
    res.render("admin/categoryList", { categories: category });
  });
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

const loadEditcategory = async (req, res) => {
  const id = req.query.catId;
  const catData = await categoryModel.findOne({ _id: id });
  console.log(catData);
  res.render("admin/editCategory", { category: catData });
};

const editCategory = async (req, res) => {
  const id = req.params.id;
  
  const check = await categoryModel.findOne({name:req.body.catName});
  console.log(check);
  const checks = await categoryModel.findOne({_id:id});


  if(!check){
    
    
    checks.name=req.body.catName;
    checks.description=req.body.catDescription;
    await checks.save();
    
    res.redirect("/admin/category")
    
  }
  else if(id==check._id){
   
    check.name=req.body.catName;
    check.description=req.body.catDescription;
    await check.save();
   
    
    res.redirect("/admin/category")
  }
  else{
    res.send("already exist")
  }
  };
const LoadProduct = async (req, res) => {
  productListHelper
    .productList()
    .then((response) => {
      res.render("admin/productList", { products: response });
    })
    .catch((error) => {
      console.log(error);
    });
};

const loadAddProduct = async (req, res) => {
  productListHelper.getAddProduct().then((response) => {
    res.render("admin/addProduct", { category: response });
  });
};

const addProduct = async (req,res)=>{
  const productData=req.body;
  const files=req.files;
  productListHelper.productAdd(productData,files).then((response)=>{
    res.redirect("/admin/productList");


  }).catch((error)=>{
    console.log(error)

  })

  }

  const softDeleteProduct=(req,res)=>{
    const id=req.params.id;
    productListHelper.deleteProduct(id).then((response)=>{

    }).catch((error)=>{
      console.log(error)
    })


  }


module.exports = {
  userList,
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
  softDeleteProduct
};