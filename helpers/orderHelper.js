const cartModel=require("../models/cartModel");
const orderModel=require("../models/orderModel");
const userModel=require("../models/userModel");
const productModel=require("../models/productModel");
const ObjectId = require('mongoose').Types.ObjectId;


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

const getOrderDetails=async(userId)=>{
    return new Promise(async(resolve,reject)=>{
        const result = await orderModel.find({user:new ObjectId(userId)});
        if(result){
            
            resolve(result);
        }
    })

}

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

const getSpecificOrder=async(orderId)=>{
    return new Promise(async(resolve,reject)=>{
        const result = await orderModel.aggregate([{$match:{_id:new ObjectId(orderId)}},{$unwind:"$products"},
    {$lookup:{from:"products",
              localField:"products.product",
              foreignField:"_id",
              as:"orderedProduct"}}])


              console.log("skvsjncsjkncskj")
        

              
              resolve(result)
    })
    

}


module.exports={
    placeOrder,
    getOrderDetails,
    getAllOrders,
    orderStatusChange,
    getOrders,
    orderCancellation,
    getSpecificOrder
}