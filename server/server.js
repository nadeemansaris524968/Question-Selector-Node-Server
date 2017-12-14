require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');

var { mongoose } = require('./db/mongoose');
var { Question } = require('./models/question');
var { User } = require('./models/user');
var { authenticate } = require('./middleware/authenticate');

var app = express();
const port = process.env.PORT;

app.use(bodyParser.json());
app.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-auth");
    res.setHeader("Access-Control-Expose-Headers", "x-auth");
    next();
});

// GET/questions
// Sends all the questions, no authentication required
app.get('/questions', authenticate, (req, res) => {
    Question.find({
        _creator: req.user._id
    }).then((questions) => {
        res.send(questions);
    }, (e) => {
        res.status(400).send(e);
    });
});

// GET/questions/:id
app.get('/questions/:id', authenticate, (req, res) => {
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
app.post('/questions', authenticate, (req, res) => {
    var question = new Question({
        independent: req.body.independent,
        if_thens: req.body.if_thens,
        img: req.body.img,
        _creator: req.user._id
    });

    question.save().then((doc) => {
        res.send(doc);
    }, (e) => {
        res.status(400).send(e);
    });
});

// PATCH/questions/:id
app.patch('/questions/:id', authenticate, (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['independent', 'if_thens', 'img']);
    body['isAnswered'] = true;

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    Question.findByIdAndUpdate(id,
        {
            $set: {
                "img": body.img,
                "if_thens": body.if_thens,
                "independent": body.independent,
                "isAnswered": body.isAnswered,
                "_creator": new ObjectID(req.user._id)
            }
        }, { new: true }).then((question) => {
            if (!question) {
                return res.status(404).send();
            }

            res.send(question);
        }).catch((e) => {
            res.status(400).send();
        });
});

// DELETE/questions/:id
app.delete('/questions/:id', authenticate, (req, res) => {
    var id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    Question.findOneAndRemove({ id }).then((question) => {
        if (!question) {
            return res.status(404).send();
        }
        res.send(question);
    }).catch((e) => {
        res.status(400).send(e);
    });
});

// POST/users
app.post('/users', (req, res) => {
    var body = _.pick(req.body, ['firstName', 'lastName', 'email', 'password']);
    var user = new User(body);
    user.save()
        .then((user) => {
            return user.generateAuthToken();
        })
        .then((token) => {
            // this user is different to what we see above
            res.header('x-auth', token).send(user);
        })
        .catch((e) => {
            res.status(400).send(e);
        });
});

// Using middleware defined in authenticate.js
// Just a sample authentication route
app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

// Login users
app.post('/users/login', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);

    User.findByCredentials(body.email, body.password).then((user) => {
        return user.generateAuthToken().then((token) => {
            res.header('x-auth', token).send(user);
        });
    }).catch((err) => {
        res.status(400).send();
    });
})

// Logout users
app.delete('/users/me/token', authenticate, (req, res) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send();
    }, () => {
        res.status(400).send();
    });
});

app.listen(port, () => {
    console.log(`Started up at port ${port}`);
});

module.exports = { app };