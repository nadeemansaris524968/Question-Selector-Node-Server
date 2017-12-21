const mongoose = require('mongoose');

var QuestionSchema = new mongoose.Schema({
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
    }
});

var Question = mongoose.model('Question', QuestionSchema);

module.exports = { Question };