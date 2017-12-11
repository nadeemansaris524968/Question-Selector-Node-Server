const mongoose = require('mongoose');

var Question = mongoose.model('Question', {
    independent: [],
    if_thens: [],
    img: '',
    isAnswered: {
        type: Boolean,
        default: false
    },
    _creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    _answeredBy: ''
});

module.exports = { Question };