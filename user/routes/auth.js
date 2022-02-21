const express = require("express");
const {
    login,
    signup,
    userLikedStories,
    refresh,
    subscribeEvents
} = require("../controllers/auth");

const { authenticateUser } = require("../middlewares/auth");

const {
    validateLoginRequest,
    validateRefreshRequest,
    isRequestValidated,
    validateRegisterRequest,
} = require("../validators/auth");

const router = express.Router();

router.post("/login", validateLoginRequest,isRequestValidated, login);
router.post("/signup", validateRegisterRequest, isRequestValidated, signup);
router.get("/likelist", authenticateUser, userLikedStories );
router.post("/refresh", validateRefreshRequest, isRequestValidated, refresh);
router.post("/app-events", subscribeEvents)
module.exports = router;