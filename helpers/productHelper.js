const productSchema=require("../models/productModel");
const categorySchema=require("../models/categoryModel");
const fs = require('fs');
const { resolve } = require("path");
const productModel = require("../models/productModel");
const orderModel = require("../models/orderModel");
const { Console } = require("console");
const objectId = require('mongoose').Types.ObjectId;


const productList=async()=>{
    try{
        return new Promise(async(resolve,reject)=>{
            const result=await productSchema.aggregate([{$lookup:{
                    from:'categories',
                    localField:"product_category",
                    foreignField:"_id",
                    as:"category"
            }

            }])
            resolve(result);
        })

    }catch(error){

    }
}
const getAddProduct=async()=>{
    try{
        return new Promise(async(resolve,reject)=>{
            const category=await categorySchema.find();
            resolve(category);

        })

    }catch(error){
        
    }
}

const productAdd=async(data,files)=>{
    try{
        return new Promise(async(resolve,reject)=>{
            let imageUrls = [];
      
          for (let i = 0; i < files.length; i++) {
            let file = files[i];
            let imageUrl = file.filename;
            imageUrls.push(imageUrl);
          }

          const totalQuantity = parseInt(data.smallQuantity)+parseInt(data.mediumQuantity)+parseInt(data.largeQuantity)
      
          await productSchema.create({
            product_name: data.product_name,
            product_description: data.product_description,
            product_category: data.product_category,
            product_price: data.price,
            "product_quantity.S.quantity": data.smallQuantity,
            "product_quantity.M.quantity": data.mediumQuantity,
            "product_quantity.L.quantity": data.largeQuantity,
            total_quantity:totalQuantity,
            product_discount: data.discount,
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

const deleteProduct= async(id)=>{
  
  return new Promise(async(resolve,reject)=>{
    const result = await productSchema.findOne({_id:id});
    console.log(result);
    if(result){
      result.product_status=!result.product_status;
      await result.save();
      resolve(result)

    }
  })
}

const checkDuplicateProduct= async(productId,body)=>{
  return new Promise(async (resolve, reject) => {
    const checker = await productSchema.findOne({ _id: productId });
    const check = await productSchema.findOne({
      product_name: body.productName,
    });

    if (!check) {
      resolve({ status: 1 });
    } else if (productId == check._id) {
      resolve({ status: 2 });
    } else {
      resolve({ status: 3 });
    }
  });

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

const getAllProducts = async ()=>{
  try{
  return new Promise (async(resolve,reject)=>{
    const product =await productSchema.aggregate([{
      $lookup:{
        from:"categories",
        localField:"product_category",
        foreignField:"_id",
        as:"category"
      },
      
  },{$match:{product_status:true,"category.status":true}}]);
    

    // const activeproduct = product.filter((item)=>{
    //   const category=item.category[0];
    //   if(category.status){
    //     if(item.product_status){
    //       return true;
    //     }
    //     return false;
    
    //   }
    //   return false;
    // });

    resolve(product);
  })}catch(error){
    console.log(error);
  }
 

}
const stockUpdation=async(allCartData)=>{
  return new Promise(async(resolve,reject)=>{
    

    for(const order of allCartData){
      let item = order.item;
      let quantity=order.quantity;
      let size = order.size;
     

       let product = await productModel.findOne({_id:item});
       if (product && product.product_quantity && product.product_quantity[size]) {
        product.product_quantity[size].quantity -= quantity;

        // Save the updated product
        await product.save();
      }
    }
    resolve("stock updated successfully");

  })
}
const stockIncreasion=async(orderId,productId)=>{
  return new Promise(async(resolve,reject)=>{
    console.log(orderId);
    console.log(productId);

    const allOrders = await orderModel.aggregate([{$match:{_id:new objectId(orderId)}},{$unwind:"$products"},{$match:{"products.product":new objectId(productId)}},{
      $project: {
        item: "$products.product",
        quantity: "$products.quantity",
        size: "$products.size",
      },
    }])
    
    

    
      let item = allOrders[0].item;
      let quantity=allOrders[0].quantity;
      let size = allOrders[0].size;

      

       let product = await productModel.findOne({_id:item});
       if (product && product.product_quantity && product.product_quantity[size]) {
        product.product_quantity[size].quantity += quantity;

        // Save the updated product
        await product.save();
      }
    
    resolve("stock updated successfully");

  })
}

const stockChecking=async(productId,size)=>{
  return new Promise(async(resolve,reject)=>{
     const product =await productModel.findById(productId);
     
     if(product.product_quantity[size].quantity<=0){
      console.log(product.product_quantity[size].quantity);
      resolve({status:false})


     }
    
    resolve({status:true})
  })
}





module.exports={
    productList,
    getAddProduct,
    productAdd,
    deleteProduct,
    stockChecking,
    checkDuplicateProduct,
    editImages,
    getAllProducts,stockUpdation,
    stockIncreasion,
    

}