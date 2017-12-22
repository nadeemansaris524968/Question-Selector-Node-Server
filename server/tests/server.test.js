const expect = require('expect');
const request = require('supertest');

const { app } = require('./../server');
const { Question } = require('./../models/question');

var question = {
    img: "Dummy question",
    isAnswered: false,
    if_thens: [
        {
            then_questions: [
                {
                    answers: [
                        "Yes",
                        "No",
                        "Not applicable"
                    ],
                    text: "Dummy question"
                }
            ],
            if_question: {
                answers: [
                    "Yes",
                    "No",
                    "Not applicable"
                ],
                text: "Dummy question"
            }
        }
    ],
    independent: [
        {
            answers: [
                "Yes",
                "No",
                "Not applicable"
            ],
            text: "Dummy question"
        }
    ]
};

var questionsSeed = [
    {
        img: "Dummy question1",
        isAnswered: false,
        if_thens: [
            {
                then_questions: [
                    {
                        answers: [
                            "Yes",
                            "No",
                            "Not applicable"
                        ],
                        text: "Dummy question"
                    }
                ],
                if_question: {
                    answers: [
                        "Yes",
                        "No",
                        "Not applicable"
                    ],
                    text: "Dummy question"
                }
            }
        ],
        independent: [
            {
                answers: [
                    "Yes",
                    "No",
                    "Not applicable"
                ],
                text: "Dummy question"
            }
        ]
    },
    {
        img: "Dummy question 2",
        isAnswered: false,
        if_thens: [
            {
                then_questions: [
                    {
                        answers: [
                            "Yes",
                            "No",
                            "Not applicable"
                        ],
                        text: "Dummy question"
                    }
                ],
                if_question: {
                    answers: [
                        "Yes",
                        "No",
                        "Not applicable"
                    ],
                    text: "Dummy question"
                }
            }
        ],
        independent: [
            {
                answers: [
                    "Yes",
                    "No",
                    "Not applicable"
                ],
                text: "Dummy question"
            }
        ]
    }
]

beforeEach((done) => {
    Question.remove({}).then(() => {
        return Question.insertMany(questionsSeed);
    })
        .then(() => done());
});

describe('POST /questions', () => {
    it('should create a new question', (done) => {

        request(app)
            .post('/questions')
            .send({
                img: "Dummy question",
                isAnswered: false,
                if_thens: [
                    {
                        then_questions: [
                            {
                                answers: [
                                    "Yes",
                                    "No",
                                    "Not applicable"
                                ],
                                text: "Dummy question"
                            }
                        ],
                        if_question: {
                            answers: [
                                "Yes",
                                "No",
                                "Not applicable"
                            ],
                            text: "Dummy question"
                        }
                    }
                ],
                independent: [
                    {
                        answers: [
                            "Yes",
                            "No",
                            "Not applicable"
                        ],
                        text: "Dummy question"
                    }
                ]
            })
            .expect(200)
            .expect((res) => {
                expect(res.body.img).toBe(question.img);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Question.find({ img: 'Dummy question' }).then((questions) => {
                    expect(questions.length).toBe(1);
                    expect(questions[0].img).toBe(question.img);
                    done();
                }).catch((e) => done(e));
            });
    });
});

describe('GET /questions', () => {
    it('should get all todos', (done) => {
        request(app)
            .get('/questions')
            .expect(200)
            .expect((res) => {
                expect(res.body.length).toBe(2);
            })
            .end(done);
    });
});