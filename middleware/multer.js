const multer = require('multer');

const productStorage = multer.diskStorage({
    destination:  'public/uploads',
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    }
  });
  
  const productUpload = multer({
    storage: productStorage
  }).array('img', 4);
  
  module.exports = {
    productUpload
  };