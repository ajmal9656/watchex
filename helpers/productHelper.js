const productSchema=require("../models/productModel");
const categorySchema=require("../models/categoryModel");
const fs = require('fs');


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
      
          await productSchema.create({
            product_name: data.product_name,
            product_description: data.product_description,
            product_category: data.product_category,
            product_price: data.price,
            product_quantity: data.quantity,
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
      }
    }]);
    

    const activeproduct = product.filter((item)=>{
      const category=item.category[0];
      if(category.status){
        if(item.product_status){
          return true;
        }
        return false;
    
      }
      return false;
    });

    resolve(activeproduct);
  })}catch(error){
    console.log(error);
  }
 

}





module.exports={
    productList,
    getAddProduct,
    productAdd,
    deleteProduct,
    checkDuplicateProduct,
    editImages,
    getAllProducts

}