const offerHelper = require("../helpers/offerHelper");
const categoryHelper = require("../helpers/cateroryHelper");
const productHelper = require("../helpers/productHelper");
const moment = require("moment")
const offerModel = require("../models/offerModel");

const loadCategoryOffers = async(req,res)=>{
    try{
      const offers = await offerHelper.getAllCatOffers();
      const category = await categoryHelper.getAllCategory();

      for(const offer of offers){
        offer.formattedStartDate = formatDate(offer.startingDate.toString())
        offer.formattedEndDate = formatDate(offer.endingDate.toString())
      }

  
      res.render("admin/category-offer",{offers,category})
  
    }catch(error){
      console.log(error);
  
    }
  
  
    
  }
  const loadProductOffers = async(req,res)=>{
    try{
      const offers = await offerHelper.getAllProdOffers();
      const product = await productHelper.getAllProduct();

      for(const offer of offers){
        offer.formattedStartDate = formatDate(offer.startingDate.toString())
        offer.formattedEndDate = formatDate(offer.endingDate.toString())
      }

      console.log(product)
  
      res.render("admin/product-offer",{offers,product})
  
    }catch(error){
      console.log(error);
  
    }
  
  
    
  }
  
  const addCategoryOffer = async(req,res)=>{
    try{
      const body = req.body;
      const result = await offerHelper.categoryOfferAdd(body);
  
      if(result){
        res.redirect("/admin/categoryOffers")
  
      }
      else{
        console.log("something wrong")
      }
  
      
  
    }catch(error){
      console.log(error);
  
    }
  
  
    
  }

  const getEditOffer = async(req,res)=>{
    const offerId= req.params.id;
  
    offerHelper.offerDetails(offerId).then((response)=>{
      
        response.formattedStartDate = formatDate(response.startingDate.toString())
        response.formattedEndDate = formatDate(response.endingDate.toString())
      
      console.log(response)
      res.json(response)
    }).catch((error)=>{
      console.log(error)
    })
  
  }

  const postEditOffer = async(req,res)=>{
  
    const body= req.body;
  
    offerHelper.offerEdit(body).then((response)=>{
      console.log(response)
      res.redirect("/admin/categoryOffers")
    }).catch((error)=>{
      console.log(error)
    })
  
  }

  const softDeleteCategoryOffer = async (req, res) => {
    const id = req.params.id;
  
    offerHelper.catOfferSoftDeletion(id).then((response) => {
        console.log(response)
      if (response.status) {
        res
          .status(200)
          .json({ error: false, message: "offer listed", listed: true });
      } else {
        res
          .status(200)
          .json({ error: false, message: "offer unlisted", listed: false });
      }
    });
  };

  const addProductOffer = async(req,res)=>{
    try{
      const body = req.body;
      const result = await offerHelper.productOfferAdd(body);
  
      if(result){
        res.redirect("/admin/productOffers")
  
      }
      else{
        console.log("something wrong")
      }
  
      
  
    }catch(error){
      console.log(error);
  
    }
  
  
    
  }
  const postEditProductOffer = async(req,res)=>{
  
    const body= req.body;
  
    offerHelper.prodOfferEdit(body).then((response)=>{
      console.log(response)
      res.redirect("/admin/productOffers")
    }).catch((error)=>{
      console.log(error)
    })
  
  }
  const softDeleteProductOffer = async (req, res) => {
    const id = req.params.id;
  
    offerHelper.catOfferSoftDeletion(id).then((response) => {
        console.log(response)
      if (response.status) {
        res
          .status(200)
          .json({ error: false, message: "offer listed", listed: true });
      } else {
        res
          .status(200)
          .json({ error: false, message: "offer unlisted", listed: false });
      }
    });
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
    loadCategoryOffers,
  loadProductOffers,
  addCategoryOffer,
  getEditOffer,
  postEditOffer,
  softDeleteCategoryOffer,
  addProductOffer,
  postEditProductOffer,
  softDeleteProductOffer,
  

  }