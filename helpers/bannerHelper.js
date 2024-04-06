const { response } = require("express");
const bannerModel = require("../models/bannerModel");
const fs = require('fs');

const ObjectId = require("mongoose").Types.ObjectId;


const getAllBanners =async(req,res)=>{
    
    return new Promise(async(resolve,reject)=>{

        bannerModel.find().then((response)=>{
            resolve(response)
        })

    })

}

const bannerAdd=async(data,files)=>{
    try{
        return new Promise(async(resolve,reject)=>{
            let imageUrls = [];
      
          for (let i = 0; i < files.length; i++) {
            let file = files[i];
            let imageUrl = file.filename;
            imageUrls.push(imageUrl);
          }

          
      
          await bannerModel.create({
            title: data.title,
            description: data.description,
            
            
            startingDate: data.startDate,
            endingDate: data.endDate,
            
            
            
            image: imageUrls,
          }).then((result) => {
            resolve(result);
          }).catch((error) => {
            console.log(error);
          });
            

        })

    }catch(error){

    }
}

const editImages = async (oldImages, newImages) => {
    return new Promise((resolve, reject) => {
      if (newImages && newImages.length > 0) {
        // if new files are uploaded
        let filenames = [];
        for (let i = 0; i < newImages.length; i++) {
          filenames.push(newImages[i].filename);
        }
        // delete old images if they exist
        if (oldImages && oldImages.length > 0) {
          for (let i = 0; i < oldImages.length; i++) {
            fs.unlink("public/uploads/" + oldImages[i], (err) => {
              if (err) {
                reject(err);
              }
            });
          }
        }
        resolve(filenames);
      } else {
        // use old images if new images are not uploaded
        resolve(oldImages);
      }
    });
  }

  const deleteBanner= async(id)=>{
  
    return new Promise(async(resolve,reject)=>{
      const result = await bannerModel.findOne({_id:id});
      
      if(result){
        result.status=!result.status;
        await result.save();
        resolve(result)
  
      }
    })
  }

  const getAllBanner = async()=>{
    return new Promise(async(resolve,reject)=>{
      const result=await bannerModel.find({status:true});
      resolve(result);
    })
  
  }





module.exports={
    bannerAdd,
    getAllBanners,
    editImages,
    deleteBanner,getAllBanner
    
}