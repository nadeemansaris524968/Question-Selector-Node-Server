var {User} = require('./../models/user');

// Middleware authentication that other routes will be using
var authenticate = (req, res, next) => {
    var token = req.header('x-auth');

    User.findByToken(token).then((user) => {
        // Valid token but no user found
        if (!user) {
            return Promise.reject();
        }
        
        // Now the next method will get a req with user and token
        req.user = user;
        req.token = token;
        next();
    }).catch((e) => {
        // Not a valid token
        res.status(401).send();
    });
};

module.exports = {authenticate}
