const dotenv = require('dotenv')

dotenv.config();

console.log(process.env.EMAIL);
console.log(process.env.PASSWORD);
console.log(process.env.KEY_ID);
console.log(process.env.KEY_SECRET);



module.exports={
    EMAIL:process.env.EMAIL,
    PASSWORD:process.env.PASSWORD,
    KEY_ID:process.env.KEY_ID,
    KEY_SECRET:process.env.KEY_SECRET,
    MONGO_URL:process.env.MONGO_URL
}