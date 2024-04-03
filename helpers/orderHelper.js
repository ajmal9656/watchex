const cartModel=require("../models/cartModel");
const orderModel=require("../models/orderModel");
const userModel=require("../models/userModel");
const couponModel=require("../models/couponModel");
const productModel=require("../models/productModel");
const { Promise } = require("mongoose");
const ObjectId = require('mongoose').Types.ObjectId;
const offerModel = require("../models/offerModel");
const walletHelper = require("../helpers/walletHelper");
const moment = require("moment")


const placeOrder = async (userId, body, cartItems) => {
    try {
        const address = await userModel.findOne({_id: userId, "address._id": body.addressId}, {"address.$": 1, _id: 0});
        const user = await userModel.findOne({_id: userId});

        let couponAmount = 0;
        if(cartItems.coupon!=null){
            var couponAdded = await couponModel.findOne({code:cartItems.coupon});
            couponAmount = couponAdded.discount;

            
          }
        console.log("user")
        console.log(user)

        let products = [];
        for (const product of cartItems.products) {
            products.push({product: product.productItemId._id, quantity: product.quantity, size: product.size,productPrice:product.productItemId.offerPrice
            });
        }
        let orderStat = "pending"
        if(body.status){
           orderStat = "payment pending"
        }
        async function createOrder(userId, body, cartItems,products,address,orderStat){
            const results = await orderModel.create({
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
                status: orderStat,
                couponAmount:couponAmount,

            });
            return results;

        }
       
        console.log(body.paymentOption)
        if(body.paymentOption === "wallet"){
            if(cartItems.totalAmount<=user.wallet.balance){
                if (address) {
                    
                  const  result =await createOrder(userId, body, cartItems,products,address);

                    if(result){
                        const walletDecrese= await walletHelper.walletDecreasion(user,cartItems.totalAmount);
                        if(walletDecrese){
                            result.orderSuccess=true;
                            return result;

                        }
                    }
                    
                }
    
            
        
          }else{
            return {orderSuccess:false};



          }
        
        }else if(body.paymentOption === "COD"){
            if(cartItems.totalAmount>=1000){
                console.log("enterrrrvgf")
                if (address) {
                    const  result =await createOrder(userId, body, cartItems,products,address);
                    console.log(result)
                    result.orderSuccess=true;
                    return result;
                }

            }else{
                console.log("no")
                
                return {orderSuccess:null};
                

            }
           

        }else{
            if (address) {
                const  result =await createOrder(userId, body, cartItems,products,address,orderStat);
                result.orderSuccess=true;
                return result;
            }


        }

       
    } catch (error) {
        throw error;
    }
};
const placeOrderByWallet = async (userId, body, cartItems) => {
    try {
        const address = await userModel.findOne({_id: userId, "address._id": body.addressId}, {"address.$": 1, _id: 0});
        const user = await userModel.findOne({_id: userId});
        console.log("user")
        console.log(user)

        let products = [];
        for (const product of cartItems.products) {
            products.push({product: product.productItemId._id, quantity: product.quantity, size: product.size,productPrice:product.productItemId.offerPrice
            });
        }

       

        
    } catch (error) {
        throw error;
    }
};

// const placeOrder = async(userId,body,cartItems)=>{
//     return new Promise(async(resolve,reject)=>{

        
//         const address = await userModel.findOne({_id:userId,"address._id":body.addressId},{"address.$":1,_id:0});
        
//         const user = await userModel.findOne({ _id: userId });


//         let products=[];

//         for(const product of cartItems.products){
//             products.push({product:product.productItemId,quantity:product.quantity,size:product.size})
//         }

//         if(address){
//             const result = await orderModel.create({
//                 user: userId,
//           products: products,
//           address: {
//             name: address.address[0].name,
//             house: address.address[0].house,
//             city: address.address[0].city,
//             state: address.address[0].state,
//             country: address.address[0].country,
//             pincode: address.address[0].pincode,
//             mobile: user.mobile,
//           },
//           paymentMethod: body.paymentOption,
//           totalAmount: cartItems.totalAmount,

//             })
//             resolve(result)
//         }
        

        







//     })
// }

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

        for (const item of result) {
            for (const product of item.products) {
                const prod = await productModel.findOne({ _id: product.product });
                console.log("prod:", prod);

                // Check if the product has an image
                if (prod && prod.image && prod.image.length > 0) {
                    item.image = prod.image[0]; // Assign the first image to the order
                    break; // Once image is assigned, exit the loop
                }
            }
        }

        console.log("Order details:", result);
        return result;
    } catch (error) {
        throw error;
    }
};


const getAllOrders = async (req, res) => {
    try {
        const allOrders = await orderModel.aggregate([{
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "userDetails"
            }
        }]);

        return allOrders;
    } catch (error) {
        console.log("Error:", error);
        throw error; // Re-throwing the error to be caught elsewhere if needed.
    }
};


// const getAllOrders = async(req,res)=>{
//     return new Promise(async(resolve,reject)=>{
//         const allOrders = await orderModel.aggregate([{$lookup:{
//             from : "users",
//             localField:"user",
//             foreignField:"_id",
//             as:"userDetails"
//         }}])

//         if(allOrders){
//             resolve(allOrders)
//         }
//         else{
//             console.log("error")
//         }
//     })

// }

const orderStatusChange = async (orderId, changeStatus) => {
    try {
        const result = await orderModel.findById(orderId);
        result.status = changeStatus;
        await result.save();
        return result;
    } catch (error) {
        throw error; // You might want to handle errors appropriately in your actual application
    }
};


// const orderStatusChange=async(orderId,changeStatus)=>{
//     return new Promise(async(resolve,reject)=>{
//         const result = await orderModel.findById(orderId);
//         result.status=changeStatus;
//         await result.save();
//         resolve(result);



//     })
// }

const getOrders = async (orderId) => {
    try {
        const result = await orderModel.aggregate([
            { $match: { _id: new ObjectId(orderId) } },
            { $unwind: "$products" },
            { $lookup: { from: "products", localField: "products.product", foreignField: "_id", as: "productDetails" } }
        ]);

        return result;
    } catch (error) {
        console.log("Error:", error);
        throw error; // Re-throwing the error to be caught elsewhere if needed.
    }
};

const orderCancellation = async (orderId) => {
    try {
        const result = await orderModel.findOneAndUpdate({_id: orderId}, {$set: {status: "cancelled"}});
        return result;
    } catch (error) {
        throw error; // You might want to handle errors appropriately in your actual application
    }
};


// const getOrders=async(orderId)=>{
//     return new Promise(async(resolve,reject)=>{
//         const result = await orderModel.aggregate([{$match:{_id:new ObjectId(orderId)}},{
//             $unwind:"$products"
//         },{$lookup:{
//             from:"products",
//             localField:"products.product",
//             foreignField:"_id",
//             as:"productDetails"
//         }}])

     

//         resolve(result);
        
        



//     })
// }

// const orderCancellation=async(orderId)=>{
//     return new Promise(async(resolve,reject)=>{




//         const result = await orderModel.findOneAndUpdate({_id:orderId},{$set:{status:"cancelled"}});
//         resolve(result);

        


//     })  
// }

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
const eachOrderCancellation = async (orderId, productId,subTotal,userId,size) => {
    try {
        const cancelledProduct = await orderModel.findOne(
            { 
              _id: orderId, 
              products: { $elemMatch: { product: productId, size: size } } 
            },
            { 
              "products.$": 1 
            }
          );
          
        console.log("cancelledProduct",cancelledProduct)
        

        const result = await orderModel.findOneAndUpdate(
            { _id: orderId, "products.product": productId,"products.size": size }, // Find the order by its ID and ensure the products array contains the specified product ID
            { $set: { "products.$.orderStatus": "cancelled" } }, // Update the orderStatus of the matched product
            { new: true } // Return the updated document after the update operation
        );
        console.log("result")
        console.log(result)
        if(result.paymentMethod==="Razorpay"){
            const walletUpdation = await walletHelper.walletAmountAdding(userId,subTotal);

        }

        result.totalAmount = result.totalAmount - (cancelledProduct.products[0].productPrice*cancelledProduct.products[0].quantity);
        result.save();
        
        
        
        
        return result;
    } catch (error) {
        throw error;
    }
};
const eachOrderReturn = async (orderId, productId,size) => {
    try {
        const result = await orderModel.findOneAndUpdate(
            { _id: orderId, "products.product": productId, "products.size": size  }, // Find the order by its ID and ensure the products array contains the specified product ID
            { $set: { "products.$.orderStatus": "return pending" } }, // Update the orderStatus of the matched product
            { new: true } // Return the updated document after the update operation
        );

        
        return result;
    } catch (error) {
        throw error;
    }
};

const specificOrderStatusChange = async (orderId, productId, changeStatus,size) => {
    try {
        const result = await orderModel.findOneAndUpdate(
            { _id: orderId, "products.product": productId, "products.size": size}, // Find the order by its ID and ensure the products array contains the specified product ID
            { $set: { "products.$.orderStatus": changeStatus } }, // Update the orderStatus of the matched product
            { new: true } // Return the updated document after the update operation
        );
        console.log(result);
        return result;
    } catch (error) {
        throw error; // You might want to handle errors appropriately in your actual application
    }
};

const returnApproval = async (orderId, productId, changeStatus,subTotal,size) => {
    try {
        const result = await orderModel.findOneAndUpdate(
            { _id: orderId, "products.product": productId, "products.size": size }, // Find the order by its ID and ensure the products array contains the specified product ID
            { $set: { "products.$.orderStatus": changeStatus } }, // Update the orderStatus of the matched product
            { new: true } // Return the updated document after the update operation
        );
        console.log(result);
        
            const walletUpdation = await walletHelper.walletAmountAdding(result.user,subTotal);

        
        return result;
    } catch (error) {
        throw error; // You might want to handle errors appropriately in your actual application
    }
};


// const specificOrderStatusChange=async(orderId,productId,changeStatus)=>{
//     return new Promise(async(resolve,reject)=>{
//         const result = await orderModel.findOneAndUpdate(
//             { _id: orderId, "products.product": productId }, // Find the order by its ID and ensure the products array contains the specified product ID
//             { $set: { "products.$.orderStatus": changeStatus } }, // Update the orderStatus of the matched product
//             { new: true } // Return the updated document after the update operation
//         );
//         console.log(result)
//         resolve(result);



//     })
// }
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
const orderedProductOfferCheck = async (response) => {
    response.formattedDate = moment(response.orderedOn).format("MMM Do, YYYY");
    console.log("asasasasasa")

    
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
}


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

const salesReport = async () => {
    try {
        const result = await orderModel.aggregate([
            
            { $unwind: "$products" },
            { $match: {"products.orderStatus":"delivered"} },
            { $lookup: { from: "products", localField: "products.product", foreignField: "_id", as: "productDetails" } }
        ]);

        return result;
    } catch (error) {
        console.log("Error:", error);
        throw error; // Re-throwing the error to be caught elsewhere if needed.
    }
};
const salesReportDateSort = async (startDate, endDate) => {
    try {
        // Convert date strings to JavaScript Date objects
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);

        const result = await orderModel.aggregate([
            { $match: {
                "orderedOn": { $gte: startDateObj, $lte: endDateObj }
            }},
            { $unwind: "$products" },
            { $match: {"products.orderStatus":"delivered"} },
            { $lookup: { from: "products", localField: "products.product", foreignField: "_id", as: "productDetails" } },
            { $sort: { "orderedOn": 1 } } // 1 for ascending order, -1 for descending
        ]);

        return result;
    } catch (error) {
        console.log("Error:", error);
        throw error; // Re-throwing the error to be caught elsewhere if needed.
    }
};




module.exports={
    placeOrder,
    getOrderDetails,
    getAllOrders,
    orderStatusChange,
    orderCancellation,
    getSpecificOrder,
    eachOrderCancellation,
    specificOrderStatusChange,
    orderProductOfferCheck,
    eachOrderReturn,
    returnApproval,
    orderedProductOfferCheck,
    salesReport,salesReportDateSort
}