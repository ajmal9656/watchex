const otpExpiry = (req,res,next)=>{
    const expirationTime=req.session.expirationTime;
    if(Date.now()>=expirationTime){
        req.session.otp=null;
        console.log("time expired");
        res.send("time expired");
    }
    else{
        next();
    }
}


module.exports={
    otpExpiry
}