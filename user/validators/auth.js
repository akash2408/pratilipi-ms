const { check, validationResult } = require('express-validator');
const validator = require('validator')

exports.validateRegisterRequest = [
    check("userInfo.email").notEmpty().withMessage("Email must not be empty"),
    check("userInfo.email").isEmail().withMessage("Email is not valid"),
    check("userInfo.password").notEmpty().withMessage("Password must not be empty"),
    check("userInfo.password").custom((value) => {
        return validator.isStrongPassword(value,{ minLength: 10 });
    }).withMessage("Password is not valid"),
];

exports.validateLoginRequest = [
    check("userInfo.email").notEmpty().withMessage("Email must not be empty"),
    check("userInfo.email").isEmail().withMessage("Email is not valid"),
    check("userInfo.password").notEmpty().withMessage("Password must not be empty"),
    check("userInfo.password").custom((value) => {
        return validator.isStrongPassword(value,{ minLength: 10 });
    }).withMessage("Password is not valid"),
];

exports.validateRefreshRequest = [
    check("token").notEmpty().withMessage("Token must not be empty"),
];

exports.isRequestValidated = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.array().length > 0) {
        return res.status(400).json({ msg : errors.array()[0].msg });
    }
    next();
};