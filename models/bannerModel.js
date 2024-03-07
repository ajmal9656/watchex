const mongoose = require('mongoose')
const bannerSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
       
    },
    description: {
        type: String,
        required: true,
       
    },
    image:[{
        type:String,
        // required:true
    }],
    startingDate: {
        type: Date,
        required: true
    },
    endingDate: {
        type: Date,
        required: true
    },
   
    status:{
        type: Boolean,
        default:true
    }
})

bannerSchema.pre("save", function (next) {
    const currentDate = new Date();
    if (currentDate > this.endingDate) {
        this.status = false; 
    }
    next();
});


const bannerModel = mongoose.model('bannerModel', bannerSchema);
module.exports = bannerModel