const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email'
        }
    },
    password: {
        type: String,
        require: true,
        minlength: 6
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
});

// Pick and choose properties from 
// the mongoose model that gets sent back to the user for eg:
// not sending the token[] etc.
UserSchema.methods.toJSON = function () {
    var user = this; // mongoose variable
    var userObject = user.toObject(); // Converting mongoose varibale to regular JS object.

    // Sending back only the properties that should be present in the header.
    return _.pick(userObject, ['_id', 'email']);
}

// Instance methods (toJSON and generateAuthToken)
UserSchema.methods.generateAuthToken = function () {
    // user is model instance or doc that is about to be saved
    var user = this;
    var access = 'auth';
    var token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123').toString();

    user.tokens.push({access, token});

    return user.save().then(() => {
        return token;
    });
};

// Static method
// Find user associated with the token
UserSchema.statics.findByToken =  function (token) {
    // User is model itself since 'this' is being called in a static method 
    var User = this;
    var decoded;

    try {
        decoded = jwt.verify(token, 'abc123');
    } catch (e) {
        // Not a valid token
        return Promise.reject();
    }

    // Token verified, now fetch user by _id and matching tokens in tokens[] of user document
    return User.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    });
};

// Runs before 'save' event on doc
UserSchema.pre('save', function (next) {
    var user = this;

    if (user.isModified('password')){
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            });
        });
    } else {
        next();
    }
});

var User = mongoose.model('User', UserSchema);

module.exports = { User }