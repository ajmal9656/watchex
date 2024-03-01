const couponHelper = require("../helpers/couponHelper");

const moment = require("moment")

const loadCoupons = async(req,res)=>{
    try{
      const coupons = await couponHelper.getAllCoupons();
  
      res.render("admin/coupon",{coupons})
  
    }catch(error){
      console.log(error);
  
    }
  
  
    
  }
  
  const addCoupon = async(req,res)=>{
    try{
      const body = req.body;
      const result = await couponHelper.couponAdd(body);
  
      if(result){
        res.redirect("/admin/coupons")
  
      }
      else{
        console.log("something wrong")
      }
  
      
  
    }catch(error){
      console.log(error);
  
    }
  
  
    
  }
  
  const deleteCoupon = async(req,res)=>{
    const couponId= req.params.id;
  
    couponHelper.couponDeletion(couponId).then((response)=>{
      res.json(response)
    }).catch((error)=>{
      console.log(error)
    })
  }
  
  const getEditCoupon = async(req,res)=>{
    const couponId= req.params.id;
  
    couponHelper.couponDetails(couponId).then((response)=>{
      console.log(response)
      res.json(response)
    }).catch((error)=>{
      console.log(error)
    })
  
  }
  
  const postEditCoupon = async(req,res)=>{
    
    const body= req.body;
  
    couponHelper.couponEdit(body).then((response)=>{
      console.log(response)
      res.redirect("/admin/coupons")
    }).catch((error)=>{
      console.log(error)
    })
  
  }

  const applyCoupon = async (req, res) => {
    try {
  
      const userId = req.session.user._id;
      const couponCode = req.body.couponCode;
      console.log(couponCode)
  
      const result = await couponHelper.applyCoupon(userId, couponCode);
      
      
      res.json(result);
    } catch (error) {
      console.log(error);
    }
  };

  module.exports={
    loadCoupons,
  addCoupon,
  deleteCoupon,getEditCoupon,
  postEditCoupon,
  applyCoupon
  }