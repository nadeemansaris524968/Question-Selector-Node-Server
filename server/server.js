require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');

var { mongoose } = require('./db/mongoose');
var { Question } = require('./models/question');

var app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

// GET/questions
app.get('/questions', (req, res) => {
    Question.find().then((docs) => {
        res.send(docs);
    }, (e) => {
        res.status(400).send(e);
    });
});

// GET/questions/:id
app.get('/questions/:id', (req, res) => {
    var id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    Question.findById(id).then((doc) => {
        if (!doc) {
            return res.status(404).send();
        }
        res.send(doc);
    }).catch((e) => {
        res.status(400).send(e);
    });
});

// POST/questions
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