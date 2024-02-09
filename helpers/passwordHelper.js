const User = require("../models/userModel");
const bcrypt = require("bcrypt");

const setNewPassword = async(email,password) => {
    return new Promise(async(resolve,reject)=>{

        const result = await User.findOne({email:email});

        if(result){
            const hashedPassword = await bcrypt.hash(password, 10);

            result.password=hashedPassword;
            await result.save();
            resolve(result);

        }

    }
        
)};






module.exports={
    setNewPassword
    

}