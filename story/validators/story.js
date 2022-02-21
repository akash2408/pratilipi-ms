const { check, validationResult } = require('express-validator');

exports.validateStoryLikeDislikeRequest = [
    check("story_id").notEmpty().withMessage("Story id must not be empty"),
];

exports.isRequestValidated = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.array().length > 0) {
        return res.status(400).json({ msg : errors.array()[0].msg });
    }
    next();
};