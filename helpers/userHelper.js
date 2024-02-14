const cartModel = require("../models/cartModel");
const productModel = require("../models/productModel");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const ObjectId = require('mongoose').Types.ObjectId;

const loginHelper = async (userData) => {
  return new Promise(async (resolve, reject) => {
    const accountData = await User.findOne({ email: userData.email });

    let response = {};

    if (accountData) {
      if (accountData.isActive) {
        bcrypt
          .compare(userData.password,accountData.password)
          .then((result) => {
            if (result) {
              response.logId = true;
              response.data = accountData;
              
              resolve(response);
            } else {
              response.errorMessage = "no result";
              resolve(response);
            }
          });
      } else {
        response.errorMessage = "Account is not active";
        resolve(response);
      }
    } else {
      response.errorMessage = "User not found";
      resolve(response);
    }
  });
};

const signUpHelper = async(data) => {
    return new Promise(async(resolve,reject)=>{
        const check = await User.findOne({
                $or: [{ email: data.email }, { mobile: data.mobile }],
              });
              let response = {};
              if (!check) {
                 const hashedPassword = await bcrypt.hash(data.password, 10);
              
                  const userIn = {
                     name: data.username,
                     email: data.email,
                     mobile: data.mobile,
                     password: hashedPassword,
                      isAdmin: 0,
                    };
                    response.registeredData=userIn;
                    resolve(response);

                
    }
    else{
        
        response.errorMessage="This email or mobile has been already registered";
        resolve(response);
    }}
)};

const getProductDetails = async(id)=>{
  return new Promise(async(resolve,reject)=>{

    // const productData=await productModel.aggregate([{$match:{_id:id}},{
    //   $lookup:{
    //     from:"categories",
    //     localField:"product_category",
    //     foreignField:"_id",
    //     as:"category"
    //   }
    // }]);
    // console.log(productData);
    // console.log(id);
    const productData = await productModel.findById(id)

    resolve(productData)


  })
}

const getUserDetails = async(userId)=>{
  return new Promise(async(resolve,reject)=>{
    const result = await User.findOne({_id:userId});

    if(result){
      resolve(result);
    }
    else{
      console.log("not found")
    }
  })
}
const addUserAddress=async(userId,body)=>{
  return new Promise(async(resolve,reject)=>{

    const result = await User.updateOne({_id:userId},{$push:{address:body}});

    console.log(result)

    resolve(result);
    

  })
}

const addressDeletion = async(addressId,userId)=>{
  return new Promise(async(resolve,reject)=>{

    const result = await User.updateOne({_id:userId},{$pull:{address:{_id:addressId}}});

    console.log(result)

    resolve(result);


  })
}

const editAddress=async(userId,addressId)=>{
  return new Promise(async(resolve,reject)=>{

    const result = await User.aggregate([{$match:{_id:new ObjectId(userId)}},{$unwind:"$address"},{
      $match:{"address._id":new ObjectId(addressId)}
    },{$project:{
      "address._id":1,
      "address.name":1,
      "address.house":1,
      "address.city":1,
      "address.state":1,
      "address.country":1,
      "address.pincode":1
      

    }}]);
    
    resolve(result);

    



  })

}

const postEditAddress=async(userId,addressId,body)=>{
  return new Promise(async(resolve,reject)=>{
    const result = await User.updateOne(
      { _id: new ObjectId(userId), 'address._id': new ObjectId(addressId) }, // Filter
      { $set: { 'address.$': body } } // Update
  );

  console.log("res")
  console.log(result)

  resolve(result);
  })
}

const getAllAddress= async(userId)=>{

  return new Promise (async(resolve,reject)=>{
    const userData = await User.findById(userId);

    resolve(userData);
  })

}



module.exports = {
  loginHelper,
  signUpHelper,
  getProductDetails,
  getUserDetails,
  addUserAddress,
  addressDeletion,
  editAddress,postEditAddress,
  getAllAddress
  
};
