const otpExpiry = (req,res,next)=>{
    const expirationTime=req.session.expirationTime;
    if(Date.now()>=expirationTime){
        req.session.otp=null;
        
        console.log("time expired");
        console.log(req.session.otp);
        req.flash("message","Time expired");
        res.redirect("/login");
    }
    else{
        next();
    }
}
const forgotOtpExpiry = (req,res,next)=>{
    const expirationTime=req.session.expirationTime;
    if(Date.now()>=expirationTime){
        req.session.otp=null;
        
        console.log("time expired");
        console.log(req.session.otp);
        req.flash("message","Time expired");
        res.redirect("/forgotPassword");
    }
    else{
        next();
    }
}

const isLogin= (req,res,next)=>{
    try{
        if(req.session.user){
            res.redirect("/");

    }else{
        next();
    }
    

}catch(error){
    console.log(error);
}
}

const isLogout= (req,res,next)=>{
    try{
        if(req.session.user){
            next();

    }else{
        res.redirect("/");
        
    }
    

}catch(error){
    console.log(error);
}
}

const isCheck= (req,res,next)=>{
    try{
        if(req.session.user){
            next();

    }else{
        res.redirect("/login");
        
    }
    

}catch(error){
    console.log(error);
}
}

const isRegistered = (req,res,next)=>{
    try{
        if(req.session.userdata){
           
            res.redirect("/otp-verification");

    }else{
        next();
        
    }
    

}catch(error){
    console.log(error);
}

}


module.exports={
    otpExpiry,
    isLogin,
    isLogout,isRegistered,
    isCheck,
    forgotOtpExpiry
}