const couponHelper = require("../helpers/couponHelper");

const moment = require("moment")

const loadCoupons = async(req,res,next)=>{
    try{
      const coupons = await couponHelper.getAllCoupons();
      
      for(const coupon of coupons){
        coupon.formattedDate = formatDate(coupon.expiryDate.toString())
        
      }
      let itemsPerPage = 2
      let currentPage = parseInt(req.query.page) || 1
      let startIndex = (currentPage-1)* itemsPerPage
      let endIndex = startIndex +itemsPerPage
      let totalPages = Math.ceil(coupons.length/itemsPerPage)
      const couponsAll = coupons.slice(startIndex,endIndex)
  
      res.render("admin/coupon",{coupons:couponsAll,totalPages,currentPage})
  
    }catch(error){
      next(error);
  
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
  
  const getEditCoupon = async(req,res,next)=>{
    try{
      const couponId= req.params.id;
  
    couponHelper.couponDetails(couponId).then((response)=>{
      
      
      
      res.json(response)
    }).catch((error)=>{
      console.log(error)
    })

    }catch(error){
      next(error)
    }
    
  
  }
  
  const postEditCoupon = async(req,res)=>{
    
    const body= req.body;
  
    couponHelper.couponEdit(body).then((response)=>{
      
      res.redirect("/admin/coupons")
    }).catch((error)=>{
      console.log(error)
    })
  
  }

  const applyCoupon = async (req, res) => {
    try {
  
      const userId = req.session.user._id;
      const couponCode = req.body.couponCode;
      const totalAmount = parseInt(req.params.totalAmount);
      
  
      const result = await couponHelper.applyCoupon(userId, couponCode,totalAmount);
      
      
      res.json(result);
    } catch (error) {
      console.log(error);
    }
  };
  function formatDate(dateString) {
    // Create a Date object from the string
    const date = new Date(dateString);
  
    // Get the year, month, and day components
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Add leading zero if needed
    const day = String(date.getDate()).padStart(2, "0"); // Add leading zero if needed
  
    // Format the date in YYYY/MM/DD format
    return `${year}-${month}-${day}`;
  }
  module.exports={
    loadCoupons,
  addCoupon,
  deleteCoupon,getEditCoupon,
  postEditCoupon,
  applyCoupon
  }