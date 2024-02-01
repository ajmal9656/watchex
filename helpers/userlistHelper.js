const User = require("../models/userModel");

const getList = async ()=>{
    return new Promise(async(resolve,reject)=>{
        await User.find().then((response)=>{
            resolve(response);
        }).catch((error)=>{
            console.log(error);
            reject(error);
        })
    })

}

const blockOrUnblock = async(userId)=>{
    return new Promise(async(resolve,reject)=>{
        const user=await User.findById(userId);
        user.isActive=!user.isActive;
        await user.save();
        resolve(user);
    })
}


module.exports={
    getList,
    blockOrUnblock

}