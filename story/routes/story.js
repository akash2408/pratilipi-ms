const express = require("express");
const {
    allStories,
    dislike,
    like,
    uploadStory
} = require("../controllers/story");
const { authenticateUser } = require("../middlewares/auth");
const { upload } = require("../middlewares/upload");
const {
    validateStoryLikeDislikeRequest,
    isRequestValidated 
} = require("../validators/story");

const router = express.Router();

router.get("/list", allStories);
router.post("/create", upload.single('storyData'), uploadStory);

router.put("/like", authenticateUser,validateStoryLikeDislikeRequest, isRequestValidated, like);
router.put("/dislike", authenticateUser, validateStoryLikeDislikeRequest, isRequestValidated, dislike);

module.exports = router;