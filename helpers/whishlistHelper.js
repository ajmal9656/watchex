const whishlistModel = require("../models/whishlistModel");
const productModel = require("../models/productModel");

const ObjectId = require('mongoose').Types.ObjectId;

const getAllWhishlistItems=async(userId)=>{
    return new Promise(async(resolve,reject)=>{
        const userWhishlistData= await whishlistModel.aggregate([{
            $match:{user: new ObjectId(userId) }
        },{
            $unwind: "$products"
          },                       
          {
            $project: {
              item: "$products.productItemId"
             
            }
          },
          {
            $lookup: {
              from: 'products',
              localField: 'item',
              foreignField: '_id',
              as: 'product'
            }
          },
          {
            $project: {
              item: 1,
               _id:1,
              product: {
                $arrayElemAt: ['$product', 0]
              }
            }
          }])

          resolve(userWhishlistData);
    })

}

const addProductToWishlist = async (productId,userId)=>{
    return new Promise(async(resolve,reject)=>{
        const product = await productModel.findById(productId);
    
    const wishlistData= await whishlistModel.updateOne({user:userId},{$push:{products:{productItemId:productId}}},{upsert:true});
    resolve(wishlistData);
    })

}


module.exports={
    getAllWhishlistItems,
    addProductToWishlist
}