require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');

var { mongoose } = require('./db/mongoose');
var { Question } = require('./models/question');

var app = express();
const port = process.env.PORT;

app.use(bodyParser.json());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// GET/questions
app.get('/questions', (req, res) => {
    Question.find().then((questions) => {
        res.send(questions);
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

    Question.findById(id).then((question) => {
        if (!question) {
            return res.status(404).send();
        }
        res.send(question);
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

// PATCH/questions/:id
app.patch('/questions/:id', (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['_id', 'question', '__v']);

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    Question.findByIdAndUpdate(id, { $set: body }, { new: true }).then((question) => {
        if (!question) {
            return res.status(404).send();
        }
        res.send(question);
    }).catch((e) => {
        res.status(400).send();
    });
});

// DELETE/questions/:id
app.delete('/questions/:id', (req, res) => {
    var id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    Question.findByIdAndRemove(id).then((question) => {
        if (!question) {
            return res.status(404).send();
        }
        res.send(question);
    }).catch((e) => {
        res.status(400).send(e);
    });
});

app.listen(port, () => {
    console.log(`Started up at port ${port}`);
});

module.exports = { app };