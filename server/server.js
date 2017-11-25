require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');

var { mongoose } = require('./db/mongoose');
var { Question } = require('./models/question');

var app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

app.post('/questions', (req, res) => {
    var question = new Question({
        question: req.body
    });

    question.save().then((doc) => {
        res.send(doc);
    }, (e) => {
        res.status(400).send(e);
    });
});

app.listen(port, () => {
  console.log(`Started up at port ${port}`);
});

module.exports = { app };