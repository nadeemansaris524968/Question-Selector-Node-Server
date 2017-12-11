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
    var token = jwt.sign({ _id: user._id.toHexString(), access }, process.env.JWT_SECRET).toString();

    user.tokens.push({ access, token });

    return user.save().then(() => {
        return token;
    });
};

UserSchema.methods.removeToken = function (token) {
    var user = this;

    // Using Mongoose $pull update() operator to pull 
    // object from tokens[] that matches with the token
    // that got passed in - essentially deleting the token
    // for 'session'.
    return user.update({
        $pull: {
            tokens: { token }
        }
    });
}

// Static method
// Find user associated with the token
UserSchema.statics.findByToken = function (token) {
    // User is model itself since 'this' is being called in a static method 
    var User = this;
    var decoded;

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
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

UserSchema.statics.findByCredentials = function (email, password) {
    var User = this;

    return User.findOne({ email }).then((user) => {
        // User doesn't exist
        if (!user) {
            return Promise.reject();
        }

        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, res) => {
                if (res) {
                    resolve(user);
                } else {
                    reject();
                }
            });
        });
    });
};

// Runs before 'save' event on doc
UserSchema.pre('save', function (next) {
    var user = this;

    // Checking if password was modified because we don't want to hash the
    // password even when it has not changed
    if (user.isModified('password')) {
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