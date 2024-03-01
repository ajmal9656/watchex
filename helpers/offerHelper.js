const offerModel = require("../models/offerModel");
const categoryModel = require("../models/categoryModel");
const ObjectId = require("mongoose").Types.ObjectId;
const moment = require("moment");

const getAllCatOffers =async(req,res)=>{
    
    return new Promise(async(resolve,reject)=>{

        offerModel.find({"categoryOffer.offerStatus":true}).populate("categoryOffer.category").then((response)=>{
            resolve(response)
        })

    })

}



const categoryOfferAdd=async(body)=>{

    return new Promise(async(resolve,reject)=>{
       
        
        const offer = await new offerModel({
            name : body.offerName,
            startingDate: body.offerStart,
            endingDate: body.offerEnd,
            "categoryOffer.category": body.category,
            "categoryOffer.discount": body.offerAmount,
            "categoryOffer.offerStatus": true,
            
           
        })

        await offer.save();
        resolve(offer);
         
    })

}

const offerDetails=async(offerId)=>{
    return new Promise(async(resolve,reject)=>{
        const result = await offerModel.findOne({_id:offerId}).lean();

        if(result){
            resolve(result);
        }

    })
}

const offerEdit=async(body)=>{
    return new Promise(async(resolve,reject)=>{
        const result = await offerModel.findOne({_id:body.offerId});

       const  categoryData = result.categoryOffer



            result.name = body.offerName
            categoryData.category = body.category
            categoryData.discount = body.offerAmount
            result.startingDate = body.offerStart
            result.endingDate = body.offerEnd
            await result.save();


        
            resolve(result);
        

    })
}

const catOfferSoftDeletion = async (id) => {
    return new Promise(async (resolve, reject) => {
      const offer = await offerModel.findOne({ _id: id });
  
      if (offer) {
        offer.status = !offer.status;
        offer.save();
        resolve(offer);
      }
    });
  };

  const getAllProdOffers =async(req,res)=>{
    
    return new Promise(async(resolve,reject)=>{

        offerModel.find({"productOffer.offerStatus":true}).populate("productOffer.product").then((response)=>{
            resolve(response)
        })

    })

}
const productOfferAdd=async(body)=>{

    return new Promise(async(resolve,reject)=>{
       
        
        const offer = await new offerModel({
            name : body.offerName,
            startingDate: body.offerStart,
            endingDate: body.offerEnd,
            "productOffer.product": body.product,
            "productOffer.discount": body.offerAmount,
            "productOffer.offerStatus": true,
            
           
        })

        await offer.save();
        resolve(offer);
         
    })

}
const prodOfferEdit=async(body)=>{
    return new Promise(async(resolve,reject)=>{
        const result = await offerModel.findOne({_id:body.offerId});

       const  productData = result.productOffer



            result.name = body.offerName
            productData.product = body.product
            productData.discount = body.offerAmount
            result.startingDate = body.offerStart
            result.endingDate = body.offerEnd
            await result.save();


        
            resolve(result);
        

    })
}



module.exports = {
    getAllCatOffers,
    getAllProdOffers,
    categoryOfferAdd,
    offerDetails,
    offerEdit,
    catOfferSoftDeletion,productOfferAdd,
    prodOfferEdit
    
  };
