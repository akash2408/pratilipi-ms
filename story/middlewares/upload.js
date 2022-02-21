const path = require("path");
const multer = require("multer");

const upload = multer({
  storage: multer.diskStorage({
   destination: "./public/",
    fileFilter: function (req, file, cb) {
      console.log(file);
      file.mimetype === 'text/csv' ? cb(null, true) : cb(new Error('Only CSV are allowed'))
    },
   filename: function(req, file, cb){
      console.log(file);
      cb(null,"IMAGE-" + Date.now() + path.extname(file.originalname));
   },
  }),
  fileFilter: function (req, file, callback) {
      var ext = path.extname(file.originalname);
      if(ext !== '.csv') {
          return callback(new Error('Only CSV are allowed'))
      }
      callback(null, true)
  },
  limits: {
    fileSize: 100000000 // max file size 100MB = 100000000 bytes
  }
});

module.exports = {
  upload : upload
};