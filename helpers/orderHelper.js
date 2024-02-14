const cartModel=require("../models/cartModel");
const orderModel=require("../models/orderModel");
const userModel=require("../models/userModel");
const ObjectId = require('mongoose').Types.ObjectId;


const placeOrder = async(userId,body,cartItems)=>{
    return new Promise(async(resolve,reject)=>{

        
        const address = await userModel.findOne({_id:userId,"address._id":body.addressId},{"address.$":1,_id:0});
        console.log(address)
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
            console.log("result")
            console.log(result)
            resolve(result);
        }
    })

}

module.exports={
    placeOrder,
    getOrderDetails
}