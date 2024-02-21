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

const removeItem=async(userId,productId)=>{
  return new Promise(async(resolve,reject)=>{

    const removeItem = await whishlistModel.updateOne({user:userId},{$pull:{products:{productItemId:productId}}});

    resolve(removeItem);

  })

}

const checkWishlist = async(productId,userId)=>{
  return new Promise(async(resolve,reject)=>{
    try{

    
    const check = await whishlistModel.findOne({user:userId,"products.productItemId":productId});

    if(check){
      resolve(true);
    }else{
      resolve(false);
    }}catch(error){
      console.log(error);
    }


  })
}
const userWishlistCount = async (userId) => {
  return new Promise(async (resolve, reject) => {
    const result = await whishlistModel.aggregate([{$match:{user:new ObjectId(userId)}},
      {
        $project: {
          numberOfProducts: { $size: "$products" }
        }
      }
    ])
    
    if (result.length > 0) {
      resolve(result[0].numberOfProducts) ;
    } else {
      resolve(0) ; // Return 0 if no products are found in the cart
    }
    
  });
};
 
module.exports={
    getAllWhishlistItems,
    addProductToWishlist,
    removeItem,
    checkWishlist,
    userWishlistCount
}