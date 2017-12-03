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
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// GET/questions
// Sends all the questions, no authentication required
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
app.post('/questions', authenticate, (req, res) => {
    var question = new Question({
        independent: req.body.independent,
        if_thens: req.body.if_thens,
        img: req.body.img,
        _answeredBy: req.user._id // We are able to extract user prop from req 
        // because we set it using authenticate.js middleware
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
    body['_answeredBy'] = req.user.email;

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    Question.findByIdAndUpdate(id,
        {
            $set: {
                "img": body.img,
                "if_thens": body.if_thens,
                "independent": body.independent,
                "_answeredBy": body._answeredBy
            }
        }, { new: true }).then((question) => {
            if (!question) {
                return res.status(404).send();
            }

            res.send(question);
            console.log('Printing question: ' + JSON.stringify(question, undefined, 2));

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

    Question.findOneAndRemove({
        _id: id,
        _answeredBy: req.user._id
    }).then((question) => {
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
    var body = _.pick(req.body, ['email', 'password']);
    var user = new User(body);

    user.save().then((user) => {
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