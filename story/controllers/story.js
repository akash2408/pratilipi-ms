const { story } = require("../models/story");
const csv = require('fast-csv');
const fs = require('fs');
const path = require('path')
const axios = require('axios');

exports.allStories = (req, res) => {

	var sortQuery = {};

	if(req.query.sortBy){
    	var val = 1;
    	if (req.query.orderBy == "desc") val = -1;
		sortQuery["likes"] = val;
	}

    if (Object.keys(sortQuery).length == 0) {
      sortQuery["createdAt"] = -1;
    }
	story.find({}).sort(sortQuery).exec((err,list) =>{
		if(err){
	        return res.status(400).json({
	        	error: err,
	            msg: "Something Went Wrong", });
		}
		else{
	        return res.status(200).json({
	        	success : true,
	        	storyList : list,
	            msg: "List Fetch Successfully", 
	        });			
		}
	})
}

exports.dislike = (req,res) => {
		const userId = req.currentUser._id;
		const storyId = req.body.story_id;
    const payload  = {
        event: "DISLIKE_STORY",
        data: { userId, storyId }
    }
   story.findById(storyId,function(error,storyFound){
   		if(error){
	      res.status(400).json({
	       	error: error,
	        msg: "Something Went Wrong", });
   		}
   		else if(storyFound){
		    axios.post('http://localhost:8000/api/user/app-events', {
		            payload
		    })
		    .then(function (response) {
				story.findByIdAndUpdate(storyId,{ $inc: { likes: -1 }}, {new: true }, function(error,result){
					if(error){
				      res.status(400).json({
				       	error: error,
				        msg: "Something Went Wrong", });
					}
					else{
				        res.status(200).json({
				        	success: true,
				        	story : result,
				        	msg: "You DisLiked The Story"});
						}
					})					
		  	})
		  	.catch(function (error) {
				    res.status(400).json({
				    error: error,
				    msg: error.response.data.msg
				});
		  	});
   		}
   		else{
	      res.status(400).json({
	       	error: error,
	        msg: "Story Not Found!", });    
   		}
   })
}

exports.like = async (req,res) =>{
	const userId = req.currentUser._id;
	const storyId = req.body.story_id;
    const payload  = {
        event: "LIKE_STORY",
        data: { userId, storyId }
    }
    story.findById(storyId,function(error,storyFound){
    	if(error){
	      res.status(400).json({
	       	error: error,
	        msg: "Something Went Wrong", });
    	}
    	else if(storyFound){
		    axios.post('http://gateway:8000/api/user/app-events', {
		            payload
		    })
		    .then(function (response) {
				story.findByIdAndUpdate(storyId,{ $inc: { likes: 1 }}, {new: true }, function(error,result){
					if(error){
				      res.status(400).json({
				       	error: error,
				        msg: "Something Went Wrong", });
					}
					else{
				        res.status(200).json({
				        	success: true,
				        	story : result,
				        	msg: "You Liked The Story"});
						}
					})				
		  	})
		  	.catch(function (error) {
				    res.status(400).json({
				    error: error,
				    msg: (error.response) ? error.response.data.msg : "Something Went Wrong"
				});
		  	});
    	}
    	else{
	      res.status(400).json({
	       	error: error,
	        msg: "Story Not Found!", });    		
    	}
    })
}

exports.uploadStory = (req,res) => {
  const filePath = './public/' + req.file.filename;
  const stream = fs.createReadStream(filePath);
  let csvData = [];
  let csvStream = csv
      .parse()
      .on("data", function (data) {
          csvData.push(data);
      })
      .on("end", function () {
          // Remove Header ROW
          csvData.shift();
          var jsonObject = [];
          csvData.forEach((x) =>{
          	const tempStory = story({
          		title : x[0],
          		content : x[1],
          		date : x[2],
          		likes : parseInt(x[3]),
          	});
          	jsonObject.push(tempStory);
          })
          fs.unlinkSync(filePath);
          story.insertMany(jsonObject,function (error, result){
								if(error){
							        res.status(400).json({
							        error: error,
							        msg: "Something Went Wrong", });
								}
								else{
							    res.status(200).json({
							        	success: true,
							        	result : result,
							          msg: "Upload Story Successfully!"});
									}
							})
      });
  stream.pipe(csvStream);
}