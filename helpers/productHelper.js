const productSchema=require("../models/productModel");
const categorySchema=require("../models/categoryModel");
const fs = require('fs');
const { resolve } = require("path");
const productModel = require("../models/productModel");
const orderModel = require("../models/orderModel");
const cartModel = require("../models/cartModel");
const offerModel = require("../models/offerModel");
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
      

      
        if(filenames.length<=3){
          
          
            let i = 0;
            while (filenames.length < 4 && i < oldImages.length) {
              filenames.push(oldImages[i]);
              
              i++;
            }
          

          if (oldImages && oldImages.length > 0) {
            
            for (let i = 3; i > 3 - newImages.length; i--) {
              
              fs.unlink("public/uploads/" + oldImages[i], (err) => {
                if (err) {
                  reject(err);
                }
              });
            }
            resolve(filenames);
          }else{
            resolve(oldImages);

          }
          
  
        }

      else{
        // delete old images if they exist
      if (oldImages && oldImages.length > 0) {
        
        for (let i = 0; i < oldImages.length; i++) {
          fs.unlink("public/uploads/" + oldImages[i], (err) => {
            if (err) {
              reject(err);
            }
          });
        }
        resolve(filenames);
      }else{
        resolve(oldImages);

      }

      }
     
      
      
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

const cartChecking=async(productId,size,userId)=>{
  return new Promise(async(resolve,reject)=>{
     
     const cart =await cartModel.findOne({user:userId});
     if(cart){
      const check = cart.products.find((item)=>{
        return item.productItemId.toString() == productId.toString()&&item.size.toString()==size.toString();

  
       })
       if(check){
        
        
        resolve({status:false})

       }else{
        resolve({status:true})
       }
       

     }else{
      resolve({status:true})

     }

     













      0.
      
     
    
    
  })
}

const stockChecking=async(productId,size)=>{
  return new Promise(async(resolve,reject)=>{
     const product =await productModel.findById(productId);
     
     if(product.product_quantity[size].quantity<=0){
      
      resolve({status:false})


     }else if(product.product_quantity[size].quantity>0){

      

     }
    
    resolve({status:true})
  })
}

const getAllProduct = async()=>{
  return new Promise(async(resolve,reject)=>{
    const result=await productModel.find();
    resolve(result);
  })

}

const AllProductOfferCheck=(productData)=>{
  return new Promise(async(resolve,reject)=>{
    const currentDate = Date.now();

  for (const product of productData) {
    const prodOffers = await offerModel.findOne({
      "productOffer.product": product._id,
      status: true,
      startingDate: { $lte: currentDate },
      endingDate: { $gte: currentDate },
    });
    const catOffers = await offerModel.findOne({
      "categoryOffer.category": product.product_category,
      status: true,
      startingDate: { $lte: currentDate },
      endingDate: { $gte: currentDate },
    });
    
    

    if (prodOffers && catOffers) {
      if(prodOffers.productOffer.discount>=catOffers.categoryOffer.discount){
        let discount =
        parseInt(product.product_discount) +
        parseInt(prodOffers.productOffer.discount)
      
      product.offerPrice = Math.round(
        product.product_price - (product.product_price * discount) / 100
      );

      }else{
        let discount =
        parseInt(product.product_discount) +
        parseInt(catOffers.categoryOffer.discount);
      
      product.offerPrice = Math.round(
        product.product_price - (product.product_price * discount) / 100
      );

      }
      
    } else if (prodOffers) {
      let discount =
        parseInt(product.product_discount) +
        parseInt(prodOffers.productOffer.discount);
      
      product.offerPrice = Math.round(
        product.product_price - (product.product_price * discount) / 100
      );
    } else if (catOffers) {
      
        let discount =
          parseInt(product.product_discount) +
          parseInt(catOffers.categoryOffer.discount);
        
        product.offerPrice = Math.round(
          product.product_price - (product.product_price * discount) / 100
        );
      
    } else {
      product.offerPrice = Math.round(
        product.product_price -
          (product.product_price * product.product_discount) / 100
      );
    }
    
  }
  resolve(productData)
  })

}

const productOfferCheck=(product)=>{
  return new Promise(async(resolve,reject)=>{
    const currentDate = Date.now();

  
    const prodOffers = await offerModel.findOne({
      "productOffer.product": product._id,
      status: true,
      startingDate: { $lte: currentDate },
      endingDate: { $gte: currentDate },
    });
    const catOffers = await offerModel.findOne({
      "categoryOffer.category": product.product_category,
      status: true,
      startingDate: { $lte: currentDate },
      endingDate: { $gte: currentDate },
    });
    
    

    if (prodOffers && catOffers) {
      if(prodOffers.productOffer.discount>=catOffers.categoryOffer.discount){
        let discount =
        parseInt(product.product_discount) +
        parseInt(prodOffers.productOffer.discount)
      
      product.offerPrice = Math.round(
        product.product_price - (product.product_price * discount) / 100
      );

      }else{
        let discount =
        parseInt(product.product_discount) +
        parseInt(catOffers.categoryOffer.discount);
      
      product.offerPrice = Math.round(
        product.product_price - (product.product_price * discount) / 100
      );

      }
      
    } else if (prodOffers) {
      let discount =
        parseInt(product.product_discount) +
        parseInt(prodOffers.productOffer.discount);
      
      product.offerPrice = Math.round(
        product.product_price - (product.product_price * discount) / 100
      );
    } else if (catOffers) {
      
        let discount =
          parseInt(product.product_discount) +
          parseInt(catOffers.categoryOffer.discount);
        
        product.offerPrice = Math.round(
          product.product_price - (product.product_price * discount) / 100
        );
      
    } else {
      product.offerPrice = Math.round(
        product.product_price -
          (product.product_price * product.product_discount) / 100
      );
    }
    
  
  resolve(product)
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
    getAllProduct,productOfferCheck,
    AllProductOfferCheck,cartChecking
    

}