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
const confirmNewPassword=async (userId,body)=>{
    return new Promise(async(resolve,reject)=>{

        const result = await User.findById(userId);
        

        if(result){

        const check = await bcrypt.compare(body.currentpassword,result.password)
        console.log(check);
        if(check){
            const password = body.password1;
            
            const hashedPassword = await bcrypt.hash(password, 10);
            

            result.password=hashedPassword;
            await result.save();
            resolve(result);

        }else{
            console.log("password wrong")
        }
            
            
        }else{
            console.log("no res")
        }

    })
    
}





module.exports={
    setNewPassword,confirmNewPassword
    

}