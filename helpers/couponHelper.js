const { response } = require("express");
const couponModel = require("../models/couponModel");
const couponCode = require("voucher-code-generator");
const moment = require("moment");

const getAllCoupons =async(req,res)=>{
    
    return new Promise(async(resolve,reject)=>{

        couponModel.find().then((response)=>{
            resolve(response)
        })

    })

}

const couponAdd=async(body)=>{

    return new Promise(async(resolve,reject)=>{
        // const Date = moment(body.couponExpiry).format("MMM Do, YYYY");
        let voucherCode=couponCode.generate({
            length: 6,
            count: 1,
            charset: couponCode.charset("alphabetic")
        });
        const coupon = await new couponModel({
            couponName : body.couponName,
            code : voucherCode[0],
            discount : body.couponAmount,
            expiryDate : body.couponExpiry
        })

        await coupon.save();
        resolve(coupon);
         
    })

}

const couponDeletion=async(couponId)=>{
    return new Promise(async(resolve,reject)=>{
        const result = await couponModel.deleteOne({_id:couponId});

        if(result){
            resolve(result);
        }

    })
}

const couponDetails=async(couponId)=>{
    return new Promise(async(resolve,reject)=>{
        const result = await couponModel.findOne({_id:couponId});

        if(result){
            resolve(result);
        }

    })
}

const couponEdit=async(body)=>{
    return new Promise(async(resolve,reject)=>{
        const result = await couponModel.findOne({_id:body.couponId});

          result.couponName = body.couponName
            result.discount = body.couponAmount
            result.expiryDate = body.couponExpiry
            await result.save();


        
            resolve(result);
        

    })
}
 

module.exports = {
    getAllCoupons,
    couponAdd,
    couponDeletion,
    couponDetails,
    couponEdit
  };