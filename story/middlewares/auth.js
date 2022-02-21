const jwt = require("jsonwebtoken");

exports.authenticateUser = (req, res, next) => {
    if (req.headers.authorization) {
        const accessToken = req.headers.authorization.split(" ")[1];
        jwt.verify(
            accessToken,
            process.env.ACCESS_TOKEN_SECRET,
            async (err, data) => {
                if (data) {
                    req.currentUser = data.currentUser;
                    next();
                } else if (err.message === "jwt expired") {
                    return res.status(400).send({
                        success: false,
                        msg: "Access token expired",
                    });
                }
                else{
                    return res.status(400).send({
                        success: false,
                        msg: "Token is not valid",
                    });                    
                }
            }
        );
    } else {
        return res
            .status(400)
            .json({ success: false, msg: "Authorization required" });
    }
};
