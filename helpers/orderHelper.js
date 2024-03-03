const cartModel=require("../models/cartModel");
const orderModel=require("../models/orderModel");
const userModel=require("../models/userModel");
const productModel=require("../models/productModel");
const { Promise } = require("mongoose");
const ObjectId = require('mongoose').Types.ObjectId;
const offerModel = require("../models/offerModel");


const placeOrder = async(userId,body,cartItems)=>{
    return new Promise(async(resolve,reject)=>{

        
        const address = await userModel.findOne({_id:userId,"address._id":body.addressId},{"address.$":1,_id:0});
        
        const user = await userModel.findOne({ _id: userId });


        let products=[];

        for(const product of cartItems.products){
            products.push({product:product.productItemId,quantity:product.quantity,size:product.size})
        }

        if(address){
            const result = await orderModel.create({
                user: userId,
          products: products,
          address: {
            name: address.address[0].name,
            house: address.address[0].house,
            city: address.address[0].city,
            state: address.address[0].state,
            country: address.address[0].country,
            pincode: address.address[0].pincode,
            mobile: user.mobile,
          },
          paymentMethod: body.paymentOption,
          totalAmount: cartItems.totalAmount,

            })
            resolve(result)
        }
        

        







    })
}

// const getOrderDetails=async(userId)=>{
//     return new Promise(async(resolve,reject)=>{
//         const result = await orderModel.find({user:new ObjectId(userId)});
//         if(result){
            
//             resolve(result);
//         }
//     })

// }

const getOrderDetails = async (userId) => {
    try {
        const result = await orderModel.find({ user: new ObjectId(userId) });
        return result;
    } catch (error) {
        throw error;
    }
};


const getAllOrders = async(req,res)=>{
    return new Promise(async(resolve,reject)=>{
        const allOrders = await orderModel.aggregate([{$lookup:{
            from : "users",
            localField:"user",
            foreignField:"_id",
            as:"userDetails"
        }}])

        if(allOrders){
            resolve(allOrders)
        }
        else{
            console.log("error")
        }
    })

}

const orderStatusChange=async(orderId,changeStatus)=>{
    return new Promise(async(resolve,reject)=>{
        const result = await orderModel.findById(orderId);
        result.status=changeStatus;
        await result.save();
        resolve(result);



    })
}
const getOrders=async(orderId)=>{
    return new Promise(async(resolve,reject)=>{
        const result = await orderModel.aggregate([{$match:{_id:new ObjectId(orderId)}},{
            $unwind:"$products"
        },{$lookup:{
            from:"products",
            localField:"products.product",
            foreignField:"_id",
            as:"productDetails"
        }}])

     

        resolve(result);
        
        



    })
}

const orderCancellation=async(orderId)=>{
    return new Promise(async(resolve,reject)=>{




        const result = await orderModel.findOneAndUpdate({_id:orderId},{$set:{status:"cancelled"}});
        resolve(result);

        


    })  
}

const getSpecificOrder = async (orderId) => {
    try {
        const result = await orderModel.aggregate([
            { $match: { _id: new ObjectId(orderId) } },
            { $unwind: "$products" },
            {
                $lookup: {
                    from: "products",
                    localField: "products.product",
                    foreignField: "_id",
                    as: "orderedProduct"
                }
            }
        ]);
        
        return result;
    } catch (error) {
        throw error;
    }
};



// const getSpecificOrder=async(orderId)=>{
//     return new Promise(async(resolve,reject)=>{
//         const result = await orderModel.aggregate([{$match:{_id:new ObjectId(orderId)}},{$unwind:"$products"},
//     {$lookup:{from:"products",
//               localField:"products.product",
//               foreignField:"_id",
//               as:"orderedProduct"}}])


        

              
//               resolve(result)
//     })
    

// }
const eachOrderCancellation = async (orderId, productId) => {
    try {
        const result = await orderModel.findOneAndUpdate(
            { _id: orderId, "products.product": productId }, // Find the order by its ID and ensure the products array contains the specified product ID
            { $set: { "products.$.orderStatus": "cancelled" } }, // Update the orderStatus of the matched product
            { new: true } // Return the updated document after the update operation
        );
        return result;
    } catch (error) {
        throw error;
    }
};

const specificOrderStatusChange=async(orderId,productId,changeStatus)=>{
    return new Promise(async(resolve,reject)=>{
        const result = await orderModel.findOneAndUpdate(
            { _id: orderId, "products.product": productId }, // Find the order by its ID and ensure the products array contains the specified product ID
            { $set: { "products.$.orderStatus": changeStatus } }, // Update the orderStatus of the matched product
            { new: true } // Return the updated document after the update operation
        );
        console.log(result)
        resolve(result);



    })
}
const orderProductOfferCheck = async (response) => {
    try {
        const currentDate = Date.now();
        for (const order of response) {
            for (const products of order.orderedProduct) {
                const prodOffers = await offerModel.findOne({
                    "productOffer.product": products._id,
                    status: true,
                    startingDate: { $lte: currentDate },
                    endingDate: { $gte: currentDate },
                });
                const catOffers = await offerModel.findOne({
                    "categoryOffer.category": products.product_category,
                    status: true,
                    startingDate: { $lte: currentDate },
                    endingDate: { $gte: currentDate },
                });

                if (prodOffers && catOffers) {
                    if (prodOffers.productOffer.discount >= catOffers.categoryOffer.discount) {
                        let discount =
                            parseInt(products.product_discount) +
                            parseInt(prodOffers.productOffer.discount);

                        products.offerPrice = Math.round(
                            products.product_price - (products.product_price * discount) / 100
                        );

                    } else {
                        let discount =
                            parseInt(products.product_discount) +
                            parseInt(catOffers.categoryOffer.discount);

                        products.offerPrice = Math.round(
                            products.product_price - (products.product_price * discount) / 100
                        );

                    }

                } else if (prodOffers) {
                    let discount =
                        parseInt(products.product_discount) +
                        parseInt(prodOffers.productOffer.discount);

                    products.offerPrice = Math.round(
                        products.product_price - (products.product_price * discount) / 100
                    );
                } else if (catOffers) {
                    let discount =
                        parseInt(products.product_discount) +
                        parseInt(catOffers.categoryOffer.discount);

                    products.offerPrice = Math.round(
                        products.product_price - (products.product_price * discount) / 100
                    );
                } else {
                    products.offerPrice = Math.round(
                        products.product_price - (products.product_price * products.product_discount) / 100
                    );
                }
            }
        }
        return response;
    } catch (error) {
        throw error;
    }
};


// const orderProductOfferCheck=async(response)=>{
//     return new Promise(async(resolve,reject)=>{
//         const currentDate = Date.now();
//         for (const order of response) {
//             for (const products of order.orderedProduct) {
//                 const prodOffers = await offerModel.findOne({
//                     "productOffer.product": products._id,
//                     status: true,
//                     startingDate: { $lte: currentDate },
//                     endingDate: { $gte: currentDate },
//                   });
//                   const catOffers = await offerModel.findOne({
//                     "categoryOffer.category": products.product_category,
//                     status: true,
//                     startingDate: { $lte: currentDate },
//                     endingDate: { $gte: currentDate },
//                   });
                  
                  
              
//                   if (prodOffers && catOffers) {
//                     if(prodOffers.productOffer.discount>=catOffers.categoryOffer.discount){
//                       let discount =
//                       parseInt(products.product_discount) +
//                       parseInt(prodOffers.productOffer.discount)
                    
//                     products.offerPrice = Math.round(
//                       products.product_price - (products.product_price * discount) / 100
//                     );
              
//                     }else{
//                       let discount =
//                       parseInt(products.product_discount) +
//                       parseInt(catOffers.categoryOffer.discount);
                    
//                     products.offerPrice = Math.round(
//                       products.product_price - (products.product_price * discount) / 100
//                     );
              
//                     }
                    
//                   } else if (prodOffers) {
//                     let discount =
//                       parseInt(products.product_discount) +
//                       parseInt(prodOffers.productOffer.discount);
                    
//                     products.offerPrice = Math.round(
//                       products.product_price - (products.product_price * discount) / 100
//                     );
//                   } else if (catOffers) {
                    
//                       let discount =
//                         parseInt(products.product_discount) +
//                         parseInt(catOffers.categoryOffer.discount);
                      
//                       products.offerPrice = Math.round(
//                         products.product_price - (products.product_price * discount) / 100
//                       );
                    
//                   } else {
//                     products.offerPrice = Math.round(
//                       products.product_price -
//                         (products.product_price * products.product_discount) / 100
//                     );
//                   }





             
//             }
//           }
//           resolve(response)

//     })
// }



module.exports={
    placeOrder,
    getOrderDetails,
    getAllOrders,
    orderStatusChange,
    getOrders,
    orderCancellation,
    getSpecificOrder,
    eachOrderCancellation,
    specificOrderStatusChange,
    orderProductOfferCheck
}