const mongoose = require('mongoose');

var Question = mongoose.model('Question', {
    question: {

    }
});

module.exports = { Question };