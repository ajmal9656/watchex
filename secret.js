const dotenv = require('dotenv')

dotenv.config();


module.exports={
    EMAIL:process.env.EMAIL,
    PASSWORD:process.env.PASSWORD,

    KEY_ID:process.env.KEY_ID,
    KEY_SECRET:process.env.KEY_SECRET
}