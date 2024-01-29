const User = require("../models/userModel");
const bcrypt = require("bcrypt");

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
              console.log(response);
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

module.exports = {
  loginHelper,
  signUpHelper,
};
