const jwt = require("jsonwebtoken");
const { user } = require("../models/user");
const { hashPassword } = require("./hashPassword");

exports.signup = (req, res) => {
    const { userInfo } = req.body;
    let newUser;
    user.findOne({ email: userInfo.email })
        .exec((error, existingUser) => {
            if (error) {
                return res.status(400).json({
                    success : false,
                	error: error,
                    msg: "Something Went Wrong", 
                });
            }
            if (existingUser) {
                return res.status(400).json({
                    success : false,
                    msg: "User with that email already exist",
                    existingUser: existingUser,
                });

            } else {
                newUser = user({
                    email: userInfo.email,
                    password: userInfo.password,
                });
	            newUser.save((err, resUser) => {
	                if (err) {
	                    res.status(400).json({
	                        success: false,
	                        msg: "Failed to Save The User",
	                    });
	                } else {
                        const accessToken = jwt.sign(
                            { currentUser : resUser },
                            process.env.ACCESS_TOKEN_SECRET,
                            {
                                expiresIn: "600s",
                            }
                        );

                        const refreshToken = jwt.sign(
                            { currentUser : resUser },
                            process.env.REFRESH_TOKEN_SECRET,
                            {
                                expiresIn: "1y",
                            }
                        );
	                    res.status(200).json({
	                        success: true,
                            user : resUser,
	                        msg: "User is Successfully Created",
	                        accessToken: accessToken,
                            refreshToken: refreshToken,
	                    });
	                }
	            });
            }
        });
};

exports.login = (req, res) => {
    const { userInfo } = req.body;
    user.findOne(
        {
            email: userInfo.email,
        },
        (err, userFound) => {
            if (err) {               
            	return res.status(400).json({
                	error: error,
               	 	msg: "Something Went Wrong", })
            }
            if (!userFound) {
                res.status(400).send({
                    success: false,
                    msg: "Authentication Failed, User not found",
                });
            } else {
                userFound.comparePassword(userInfo.password, (err, isMatch) => {
                    if (isMatch && !err) {
                        const accessToken = jwt.sign(
                            { currentUser : userFound },
                            process.env.ACCESS_TOKEN_SECRET,
                            {
                                expiresIn: "600s",
                            }
                        );

                        const refreshToken = jwt.sign(
                            { currentUser : userFound },
                            process.env.REFRESH_TOKEN_SECRET,
                            {
                                expiresIn: "1y",
                            }
                        );
                        res.status(200).json({
                            success: true,
                            msg: "Logged In Successfully",
                            accessToken: accessToken,
                            refreshToken: refreshToken,
                        });
                    } else {
                        return res.status(400).send({
                            success: false,
                            msg: "Authentication failed, wrong password",
                        });
                    }
                });
            }
        }
    );
};

exports.refresh = (req, res, next) => {
    const refreshToken = req.body.token;
    if (!refreshToken) {
        return res.json({ success: false, msg: "Refresh token not found." });
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, data) => {
        if (!err) {
            const accessToken = jwt.sign(
                { currentUser : data.currentUser },
                process.env.ACCESS_TOKEN_SECRET,
                {
                    expiresIn: "600s",
                }
            );
            return res
                .status(200)
                .json({ success: true, accessToken: accessToken });
        } else if (err.message == "jwt expired") {
            return res.status(400).json({
                success: false,
                msg: "Refresh token expired, Please Login again!",
            });
        } else {
            return res.status(400).json({
                success: false,
                msg: "Invalid refresh token , Please Login again!",
            });
        }
    });
};

exports.userLikedStories = (req,res) => {
    user.findById(req.currentUser._id).exec((error,userFound) => {
        if(error){
            return res.status(400).json({
                error: error,
                msg: "Something Went Wrong", });            
        }
        if(!userFound){
            return res.status(400).json({
                success : false,
                msg: "User Not UserFound", });              
        }
        else{
            return res.status(200).json({
                success : true,
                userLikedStoryList : userFound.userLikeList,
                msg: "List Fetch Successfully", 
            });         
        }
    })  
}

const dislike = (userId, storyId ,res) => {
    user.findById(userId).exec((error,userFound) => {
        if(error){
            return res.status(400).json({
                error: error,
                msg: "Something Went Wrong", });            
        }
        else if(userFound){
            const story = {
                _id : storyId
            };
            if(userFound.userLikeList.some(e => e._id === storyId) == false){
              return res.status(400).json({
                success: false,
                msg: "You Haven't Liked The Post!",
              });
            }
            else{
                var newValues = {
                  $pull: {
                    userLikeList: story,
                  },
                };
                user.findByIdAndUpdate(userId, newValues, function (err, updateUser) {
                    if (err) {
                      return res.status(400).json({
                        error: error,
                        success: false,
                        msg: "Something Went Wrong!",
                      });
                    } else {
                      return res.status(200).json({
                        success: true,
                        msg: "Story Liked Successfully!",
                      });
                    }
                  })
            }
        }
        else{
            return res.status(400).json({
                success:false,
                msg: "User Not Found!"});
        }
    })
}

const like = (userId, storyId, res) => {

    user.findById(userId).exec((error,userFound) => {
        if(error){
           return res.status(400).json({
                error: error,
                success: false,
                msg: "Something Went Wrong", });            
        }
        else if(userFound){
            const story = {
                _id : storyId
            };
            if(userFound.userLikeList.some(e => e._id === storyId)){
              return res.status(400).json({
                success: false,
                msg: "You Already Liked The Post!",
              });
            }
            else{
                var newValues = {
                   $addToSet: {
                    userLikeList: story,
                  },
                };
                user.findByIdAndUpdate(userId, newValues, {new: true }, function (err, updateUser) {
                    if (err) {
                      return res.status(400).json({
                        error: err,
                        success: false,
                        msg: "Something Went Wrong!",
                      });
                    } else {
                     return  res.status(200).json({
                        success: true,
                        msg: "Story liked Successfully!",
                      });
                    }
                  })
            }
        }
        else{
            return res.status(400).json({
                success:false,
                msg: "User Not Found!"});
        }
    })
}

exports.subscribeEvents = (req, res) =>{
    console.log("Customer Event Called");
    const { event, data } =  req.body.payload;

    const { userId, storyId } = data;

    switch(event){
        case 'LIKE_STORY':
            like(userId,storyId,res)
            break;
        case 'DISLIKE_STORY':
            dislike(userId,storyId,res)
            break;
        default:
            break;
    }

}
