const productSchema=require("../models/productModel");
const categorySchema=require("../models/categoryModel");


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





module.exports={
    productList,
    getAddProduct,
    productAdd,
    deleteProduct

}