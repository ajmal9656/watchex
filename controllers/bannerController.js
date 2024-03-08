const bannerHelper = require("../helpers/bannerHelper");
const bannerModel = require("../models/bannerModel");


const loadBanners = async(req,res)=>{
    try{
      const banners = await bannerHelper.getAllBanners();

      for(const banner of banners){
        banner.formattedStartDate = formatDate(banner.startingDate.toString())
        banner.formattedEndDate = formatDate(banner.endingDate.toString())
      }
  
      res.render("admin/banner-page",{banners})
  
    }catch(error){
      console.log(error);
  
    }
  
  
    
  }

  const loadAddBanner = async (req, res) => {
    
      res.render("admin/addBanner");
    
  };
  const addBanner = async (req, res) => {
    const bannerData = req.body;
    const files = req.files;
    bannerHelper
      .bannerAdd(bannerData, files)
      .then((response) => {
        res.redirect("/admin/banners");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const loadEditBanner = async (req, res) => {
    const id = req.params.id;
    const bannerData = await bannerModel.findById(id);
    
    res.render("admin/editBanner", {
      banner: bannerData,
      
    });
  };

  const editBanner = async (req, res) => {
    try {
      console.log(req.body.title)
      console.log(req.body.description)
      console.log(req.body.startDate)
      console.log(req.body.endDate)
      const banner = await bannerModel.findById(req.params.id);
      console.log(banner)
      
     
      
     
    
        
          banner.title = req.body.title;
          banner.description = req.body.description;
          banner.startingDate = req.body.startDate;
          banner.endingDate = req.body.endDate;
         
         
       
          
        
      
  
      if (req.files) {
        const filenames = await bannerHelper.editImages(
          banner.image,
          req.files
        );
        banner.image = filenames;
      }
      await banner.save();
      res.redirect("/admin/banners");
    } catch (err) {
      console.log(err);
    }
  };
  const softDeleteBanner = (req, res) => {
    const id = req.params.id;
   
    bannerHelper
      .deleteBanner(id)
      .then((response) => {
        if (response.status) {
          res.json({ message: "Banner listed" });
        } else {
          res.json({ message: "Banner unlisted" });
        }
      })
      .catch((error) => {
        console.log(error);
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
    loadBanners,
    loadAddBanner,addBanner,
    loadEditBanner,
    editBanner,
    softDeleteBanner

}