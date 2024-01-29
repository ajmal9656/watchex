const adminSchema=require("../models/adminModel");

const checkAdmin =async(admin)=>{
    return new Promise(async(resolve,reject)=>{
        const accountData = await adminSchema.findOne({ email: admin.email });
        let response = {};
        if(accountData){
            if(accountData.password===admin.password){
                
                response.logId=true;
                response.data=accountData;
                resolve(response);

            }
            else{
                response.errorMessage="Wrong password";
                resolve(response);
            }
        }
        else{
            response.errorMessage="invalid email";
            resolve(response);
        }

    })
}


module.exports={
    checkAdmin

}