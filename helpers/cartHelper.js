const cartModel=require("../models/cartModel");
const productModel=require("../models/productModel");
const ObjectId = require('mongoose').Types.ObjectId;


const getAllCartItems = async (userId)=>{
    return new Promise (async(resolve,reject)=>{
        const userCartData= await cartModel.aggregate([
            {
              $match: { user: new ObjectId(userId) }
            },
            {
              $unwind: "$products"
            },                       
            {
              $project: {
                item: "$products.productItemId",
                quantity: "$products.quantity",
                size:"$products.size",
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
                quantity: 1,
                _id:1,
                size:1,
                product: {
                  $arrayElemAt: ['$product', 0]
                }
              }
            }
          ]);
          resolve(userCartData);
    
    })


}

const addProductToCart=async(productId,userId,size)=>{
  return new Promise (async(resolve,reject)=>{
    const product = await productModel.findById(productId);
    
    const cartData= await cartModel.updateOne({user:userId},{$push:{products:{productItemId:productId,quantity:1,size:size}}},{upsert:true});
    resolve(cartData);
  })

}

const checkCart = async(productId,userId)=>{
  return new Promise(async(resolve,reject)=>{
    try{

    
    const check = await cartModel.findOne({user:userId,"products.productItemId":productId});

    if(check){
      resolve(true);
    }else{
      resolve(false);
    }}catch(error){
      console.log(error);
    }


  })
}

const quantityUpdation =async(productId,userId,quantity)=>{
  return new Promise(async(resolve,reject)=>{

    const cart = await cartModel.findOne({user:userId});

    console.log("skjcfhsjhc");
    console.log(cart)

    const product = cart.products.find((item)=>{
      return item.productItemId.toString()==productId;
    })

    let newQuantity = product.quantity+parseInt(quantity);

    if(newQuantity<1){
      newQuantity=1;
    }
    product.quantity = newQuantity;

    await cart.save();
    resolve(cart);

    
    



  })
}

const removeItem=async(userId,productId)=>{
  return new Promise(async(resolve,reject)=>{

    const removeItem = await cartModel.updateOne({user:userId},{$pull:{products:{productItemId:productId}}});

    resolve(removeItem);

  })

}



module.exports={
    getAllCartItems,
    addProductToCart,
    checkCart,
    quantityUpdation,
    removeItem
}