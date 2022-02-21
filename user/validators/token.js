const { check, validationResult } = require('express-validator');

exports.validateToken = (req, res, next) => {
    const accessToken = req.headers.authorization.split(" ")[1];
    console.log("yylll");
    if (!accessToken) {
        return res.status(400).json({ msg : 'Token must not be empty' });
    }
    next();
};