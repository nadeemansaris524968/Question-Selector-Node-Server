const mongoose = require('mongoose');

var Question = mongoose.model('Question', {
    independent: [],
    if_thens: [],
    img: ''
});

module.exports = { Question };