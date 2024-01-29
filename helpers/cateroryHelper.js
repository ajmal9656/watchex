const categorySchema = require("../models/categoryModel");

const categoryList = async () => {
  return new Promise(async (resolve, reject) => {
    await categorySchema
      .find()
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        console.log(error);
      });
  });
};

const addCategory = async (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const check = await categorySchema.findOne({
        name: data.categoryName
      });
      
      if (!check) {
        
        const catData = {
          name: data.categoryName,
          description: data.categoryDescription,
        };
        const result = await categorySchema.create(catData);
        if (result) {
          resolve({status:true});
        }
      } else {
        
        resolve({ status: false });
      }
    } catch (error) {
      console.log(error);
    }
  });
};

const catSoftDeletion = async (id) => {
  return new Promise(async (resolve, reject) => {
    const category = await categorySchema.findOne({ _id: id });

    if (category) {
      category.status = !category.status;
      category.save();
      resolve(category);
    }
  });
};

const editCategory = async(id)=>{
  return new Promise(async(resolve,reject)=>{
    
  })

}

module.exports = {
  categoryList,
  addCategory,
  catSoftDeletion,
};
