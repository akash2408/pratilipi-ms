const express = require("express");
const router = express.Router();


router.get("/", function(req,res){
  res.status(200).json({
    success: true,
    msg: "User Service",
  });
});

module.exports = router;