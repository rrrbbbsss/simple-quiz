// the questions for the quiz
var questions = [
    {
        question: "Commonly used data types DO NOT inlcude:",
        wrong: ["strings", "booleans", "numbers"],
        correct: "alerts"
    },
    {
        question: "The condition in an if / else statement is enclosed with _____.",
        wrong: ["quotes", "curly brackets", "square brackets"],
        correct: "parenthesis"
    },
    {
        question: "Arrays in JavaScript can be used to store _____",
        wrong: ["numbers and strings", "other arrays", "booleans"],
        correct: "all of the above"
    },
    {
        question: "String Values must be enclosed within _____ when being assigned to variables.",
        wrong: ["commas", "curly brackets", "parenthesis"],
        correct: "quotes"
    },
    {
        question: "A very useful tool used during development and debugging for print content to the debugger is:",
        wrong: ["JavaScript", "terminal/bash", "for loops"],
        correct: "console.log"
    }
];

// for holding quiz state and methods for doing this with it.
var quizData = {
    quizTotalTime: 30,
    index: 0,
    questions: questions,
    result: 0,
    penalty: 5,
    feedback: "",
    getCurrentQuestion: function () {
        var index = this.index;
        return this.questions[index].question;
    },
    getCorrect: function () {
        var index = this.index;
        return this.questions[index].correct;
    },
    getAnswers: function () {
        var index = this.index;
        var wrong = this.questions[index].wrong;
        var correct = this.getCorrect();
        var answers = wrong.concat([correct]);
        return answers;
    },
    reset: function () {
        this.index = 0;
        this.result = 0;
        this.feedback = "";
        shuffleArray(this.questions);
    }
};

//compute total score based of quiz result and time left
var computeScore = function (result, timeLeft) {
    var result = Math.floor(100 * result / quizData.questions.length);
    return Math.max(0, timeLeft + result);
};

// save highscores
var saveHighScores = function (initials, score) {
    highScores = loadHighScores();
    highScores.push({
        // if null/empty string, use "Anon", else trim and if input was only whitespace, use "Anon"
        initials: (initials || "Anon").trim() || "Anon",
        score: score
    });
    localStorage.setItem("highScores", JSON.stringify(highScores));
};

// save highscores
var loadHighScores = function () {
    var scores = JSON.parse(localStorage.getItem("highScores")) || [];
    return scores.sort((a, b) => b.score - a.score);
};

// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
var shuffleArray = function (array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
};

// delay the evaluation of the query, to control when to force a value
var delayedElementQuery = function (selector) {
    return function () {
        return document.querySelector(selector);
    };
};

// used to create/insert Elements from a specification
var insertDynEl = function (elementSpec) {
    var el = document.createElement(elementSpec.type);
    el.id = elementSpec.id;
    el.className = elementSpec.class;
    el.innerHTML = elementSpec.innerHTML;
    elementSpec.attributes.forEach(x => el.setAttribute(x.attr, x.value));
    if (elementSpec.replaceChildren) {
        elementSpec.parentEld().replaceChildren(el);
    }
    else {
        elementSpec.parentEld().appendChild(el);
    }
}

// Element Specification Class
class ElSpec {
    constructor(obj) {
        this.type = obj.type || "div";
        this.id = obj.id || "";
        this.class = obj.class || "";
        this.innerHTML = obj.innerHTML || "";
        this.attributes = obj.attributes || [];
        this.parentEld = obj.parentEld || this.getEld();
        this.replaceChildren = obj.replaceChildren || false;
        this.display = obj.display || function () {
            insertDynEl(this);
        }
    }
    getEld() {
        return delayedElementQuery("#" + this.id);
    }
};

// Container Class
class Container {
    constructor(obj) {
        this.parentEld = obj.parentEld;
        this.data = obj.data || {};
        this.elSpecs = obj.elSpecs || [];
        this.eventHandlers = obj.eventHandlers || [];
        this.timeouts = obj.timeouts || [];
        this.timer = obj.timer || {};
        this.timerID = {};
        this.timeoutID = {};
    }
    display() {
        this.elSpecs.forEach(x => x.display());
    }
    addHandlers() {
        this.eventHandlers.forEach(x => {
            var el = this.parentEld();
            el.addEventListener(x.event, x.handler);
        });
    }
    removeHandlers() {
        this.eventHandlers.forEach(x => {
            var el = this.parentEld();
            el.removeEventListener(x.event, x.handler);
        });
    }
    startTimers() {
        this.timerID = setInterval(this.timer.func, this.timer.delay);
    }
    startTimeouts() {
        this.timeouts.forEach(x => {
            this.timeoutID = setTimeout(x.func, x.delay);
        });
    }
    clearTimers() {
        clearInterval(this.timerID);
    }
    clearTimeouts() {
        clearTimeout(this.timeoutID);
    }
}

// Page Class
class Page {
    constructor(obj) {
        this.headerLeft = obj.headerLeft || {};
        this.headerRight = obj.headerRight || {};
        this.canvas = obj.canvas || {};
    }
    display() {
        this.headerLeft.display();
        this.headerLeft.addHandlers();
        this.headerRight.display();
        this.headerRight.addHandlers();
        this.canvas.display();
        this.canvas.addHandlers();
    }
}

// header containers
var createHsButtonContainer = function (parentEld) {
    var hsButtonSpec = new ElSpec({
        type: "button",
        id: "hsbutton",
        class: "button",
        innerHTML: "view high scores",
        parentEld: parentEld,
        replaceChildren: true
    });
    var buttonHandler = {
        event: "click",
        handler: function (event) {
            highScoreButtonContainer.removeHandlers();
            quizStartContainer.removeHandlers();
            quizQuestionContainer.removeHandlers();
            quizEndContainer.removeHandlers();
            gotoHighScores();
            quizTimerContainer.clearTimers();
        }
    };
    return new Container({
        parentEld: parentEld,
        data: {},
        elSpecs: [hsButtonSpec],
        eventHandlers: [buttonHandler]
    });
}

var createQuizTimerContainer = function (parentEld) {
    var timerData = {
        startTime: quizData.quizTotalTime,
        timeLeft: quizData.quizTotalTime,
        reset: function () {
            this.timeLeft = this.startTime;
        }
    };
    var timerSpec = new ElSpec({
        type: "div",
        id: "timer",
        class: "timer",
        innerHTML: "",
        parentEld: parentEld,
        replaceChildren: true,
        display: function () {
            var timeAdj = Math.max(0, timerData.timeLeft)
            timerSpec.innerHTML = "time: <span id='time'>" + timeAdj  + "</span>";
            insertDynEl(timerSpec);
        }
    });
    var timerInterval = function () {
        var eld = delayedElementQuery("#time");
        timerData.timeLeft -= 1;
        if (timerData.timeLeft <= 0) {
            gotoQuizEnd();
            eld().textContent = 0;
            //clearInterval(quizTimerContainer.cleartimer);
            quizTimerContainer.clearTimers();
        }
        else {
            eld().textContent = timerData.timeLeft;
        }
    };
    return new Container({
        parentEld: parentEld,
        data: timerData,
        elSpecs: [timerSpec],
        eventHandlers: [],
        timer: { delay: 1000, func: timerInterval },
    });
}

var createQuizButtonContainer = function (parentEld) {
    var quizButtonSpec = new ElSpec({
        type: "button",
        id: "quizButton",
        class: "button",
        innerHTML: "Return to Quiz",
        parentEld: parentEld,
        replaceChildren: true
    });
    var buttonHandler = {
        event: "click",
        handler: function (event) {
            var target = event.target;
            var matchQuery = "#" + quizButtonSpec.id;
            if (target.matches(matchQuery)) {
                quizData.reset();
                quizButtonContainer.removeHandlers();
                // reset timer
                quizTimerContainer.data.reset();
                gotoQuizStart();
            }
        }
    }
    return new Container({
        parentEld: parentEld,
        elSpecs: [quizButtonSpec],
        eventHandlers: [buttonHandler]
    });
};


var createDeleteHsButtonContainer = function (parentEld) {
    var deleteHsButtonSpec = new ElSpec({
        type: "button",
        id: "deleteHsButton",
        class: "button",
        innerHTML: "Delete High Scores",
        parentEld: headerRightEld,
        replaceChildren: true

    });
    var buttonHandler = {
        event: "click",
        handler: function (event) {
            var target = event.target;
            var matchQuery = "#" + deleteHsButtonSpec.id;
            if (target.matches(matchQuery)) {
                localStorage.setItem("highScores", JSON.stringify([]));
                gotoHighScores();
            }
        }
    }
    return new Container({
        parentEld: parentEld,
        elSpecs: [deleteHsButtonSpec],
        eventHandlers: [buttonHandler]
    });
};

// canvas containers
var createQuizStartContainer = function (parentEld) {
    var quizStartSpec = new ElSpec({
        type: "div",
        id: "quizStartPage",
        class: "page",
        innerHTML: "",
        parentEld: canvasEld,
        replaceChildren: true
    });
    var quizStartEld = quizStartSpec.getEld();
    var titleSpec = new ElSpec({
        type: "h1",
        id: "",
        class: "quizTitle",
        innerHTML: "Simple Coding Quiz",
        parentEld: quizStartEld,
        replaceChildren: false
    });
    var instructionsSpec = new ElSpec({
        type: "p",
        id: "",
        class: "quizText",
        innerHTML: "Try to answer the follwing code-related questions withint he time limit." +
        "Incorrect answers will penalize your score/time by " + quizData.penalty + " seconds.",
        parentEld: quizStartEld,
        replaceChildren: false
    });
    var startButtonSpec = new ElSpec({
        type: "button",
        id: "quizStartButton",
        class: "button",
        innerHTML: "Start Quiz",
        parentEld: quizStartEld,
        replaceChildren: false,
    });
    var startButtonHandler = {
        event: "click",
        handler: function (event) {
            var target = event.target;
            var matchQuery = "#" + startButtonSpec.id;
            if (target.matches(matchQuery)) {
                quizStartContainer.removeHandlers();
                gotoQuizQuestion();
                // start timer
                quizTimerContainer.startTimers();
            }
        }
    };
    return new Container({
        parentEld: parentEld,
        data: {},
        elSpecs: [
            quizStartSpec,
            titleSpec,
            instructionsSpec,
            startButtonSpec
        ],
        eventHandlers: [startButtonHandler]
    });
};

var createQuizQuestionContainer = function (parentEld) {
    var quizQuestionSpec = new ElSpec({
        type: "div",
        id: "quizQuestionPage",
        class: "page",
        innerHTML: "",
        parentEld: parentEld,
        replaceChildren: true
    });
    var quizQuestionEld = quizQuestionSpec.getEld();
    var questionSpec = new ElSpec({
        type: "h2",
        id: "",
        class: "quizQuestion",
        innerHTML: quizData.getCurrentQuestion(),
        parentEld: quizQuestionEld,
        replaceChildren: false,
        display: function () {
            questionSpec.innerHTML = quizData.getCurrentQuestion();
            insertDynEl(questionSpec);
        }
    });
    var answerListSpec = new ElSpec({
        type: "ol",
        id: "answerList",
        class: "quizAnswers",
        innerHTML: "",
        parentEld: quizQuestionEld,
        replaceChildren: false
    });
    var answerListEld = answerListSpec.getEld();
    var answerSpec = new ElSpec({
        type: "li",
        id: "",
        class: "answers",
        innerHTML: "",
        parentEld: answerListEld,
        replaceChildren: false,
        display: function () {
            shuffleArray(quizData.getAnswers()).forEach(x => {
                answerSpec.innerHTML = x;
                insertDynEl(answerSpec);
            })
        }
    });
    var feedbackSpec = new ElSpec({
        type: "div",
        id: "quizFeedback",
        class: "feedback",
        innerHTML: quizData.feedback,
        parentEld: quizQuestionEld,
        replaceChildren: false,
        display: function () {
            feedbackSpec.innerHTML = quizData.feedback;
            insertDynEl(feedbackSpec);
        }
    });
    var answerHandler = {
        event: "click",
        handler: function (event) {
            var target = event.target;
            var matchQuery = "." + answerSpec.class;
            if (target.matches(matchQuery)) {
                // validate the answer
                var correct = quizData.getCorrect();
                var answer = target.textContent === correct;
                var nextQuestion = quizData.index += 1;
                // add to score when needed and update feedback
                if (answer) {
                    quizData.result += 1;
                    quizData.feedback = "Correct";
                }
                else {
                    quizTimerContainer.data.timeLeft -= quizData.penalty;
                    quizData.feedback = "Incorrect";
                }
                // go to quiz end if questions are done
                if (nextQuestion >= questions.length) {
                    quizQuestionContainer.removeHandlers();
                    quizQuestionContainer.clearTimeouts();
                    gotoQuizEnd();
                    quizEndContainer.startTimeouts();
                    quizTimerContainer.clearTimers();
                }
                // else go to next question
                else {
                    quizQuestionContainer.removeHandlers();
                    quizQuestionContainer.clearTimeouts();
                    gotoQuizQuestion();
                    quizQuestionContainer.startTimeouts();
                }
            }
        }
    };
    var feedbackTimeout = {
        delay: (1000),
        func: function () {
            var eld = feedbackSpec.getEld();
            eld().textContent = "";
        }
    };
    return new Container({
        parentEld: parentEld,
        elSpecs: [
            quizQuestionSpec,
            questionSpec,
            answerListSpec,
            answerSpec,
            feedbackSpec
        ],
        eventHandlers: [answerHandler],
        timeouts: [feedbackTimeout]
    });
};

var createQuizEndContainer = function (parentEld) {
    var quizEndPageSpec = new ElSpec({
        type: "div",
        id: "quizEndPage",
        class: "page",
        innerHTML: "",
        parentEld: parentEld,
        replaceChildren: true
    });
    var quizEndPageEld = quizEndPageSpec.getEld();
    var titleSpec = new ElSpec({
        type: "h2",
        id: "",
        class: "quizTitle",
        innerHTML: "Quiz Completed",
        parentEld: quizEndPageEld,
        replaceChildren: false
    });
    var resultsSpec = new ElSpec({
        type: "div",
        id: "",
        class: "quizText",
        innerHTML: "",
        parentEld: quizEndPageEld,
        replaceChildren: false,
        display: function () {
            resultsSpec.innerHTML = "Your final score is: " +
                computeScore(quizData.result, quizTimerContainer.data.timeLeft);
            insertDynEl(resultsSpec);
        }
    });
    var submitFormSpec = new ElSpec({
        type: "form",
        id: "submitForm",
        class: "submitForm",
        innerHTML: "<label for='initials'>Enter Initials:</label>" +
            "<input type='text' id='initials' name='initials'>" +
            "<input type='submit' value='Submit'>",
        parentEld: quizEndPageEld,
        replaceChildren: false
    });
    var feedbackSpec = new ElSpec({
        type: "div",
        id: "quizFeedback",
        class: "feedback",
        innerHTML: "",
        parentEld: quizEndPageEld,
        replaceChildren: false,
        display: function () {
            feedbackSpec.innerHTML = quizData.feedback;
            insertDynEl(feedbackSpec);
        }
    });
    var formHandler = {
        event: "submit",
        handler: function (event) {
            event.preventDefault();
            var target = event.target;
            var matchQuery = "#" + submitFormSpec.id;
            if (target.matches(matchQuery)) {
                var initials = document.querySelector("input[name='initials']").value;
                saveHighScores(initials, computeScore(quizData.result, quizTimerContainer.data.timeLeft));
                quizEndContainer.removeHandlers();
                gotoHighScores();

            }

        }
    };
    var feedbackTimeout = {
        delay: (1000),
        func: function () {
            var eld = feedbackSpec.getEld();
            eld().textContent = "";
        }
    };
    return new Container({
        parentEld: parentEld,
        elSpecs: [
            quizEndPageSpec,
            titleSpec,
            resultsSpec,
            submitFormSpec,
            feedbackSpec
        ],
        eventHandlers: [formHandler],
        timeouts: [feedbackTimeout]
    });
};

var createHighScoresContainer = function (parentEld) {
    var highScorePageSpec = new ElSpec({
        type: "div",
        id: "highScorePage",
        class: "page",
        innerHTML: "",
        parentEld: parentEld,
        replaceChildren: true
    });
    var highScorePageEld = highScorePageSpec.getEld();
    var highScoreListSpec = new ElSpec({
        type: "ol",
        id: "highScoreList",
        class: "hightScoreList",
        innerHTML: "",
        parentEld: highScorePageEld,
        replaceChildren: false
    });
    var highScoreListEld = highScoreListSpec.getEld();
    var highScoreSpec = new ElSpec({
        type: "li",
        id: "",
        class: "highScoreItem",
        innerHTML: "",
        parentEld: highScoreListEld,
        replaceChildren: false,
        display: function () {
            loadHighScores().forEach(x => {
                highScoreSpec.innerHTML = x.initials + " - " + x.score;
                insertDynEl(highScoreSpec);
            })
        }
    });
    return new Container({
        parentEld: parentEld,
        elSpecs: [
            highScorePageSpec,
            highScoreListSpec,
            highScoreSpec
        ],
        eventHandlers: [],
        timeouts: []
    });
};

// quiz flow functions
var gotoHighScores = function () {
    // todo: it would be better to move the housekeeping tasks
    // of removing handlers/timers here.
    // also defining the timers/handlers in one spot and not scattered
    // throughout the container constructors would make it easier to read/manage.
    var highScorePage = new Page({
        headerLeft: quizButtonContainer,
        headerRight: deleteHsButtonContainer,
        canvas: highScoresContainer
    });
    highScorePage.display();

};
var gotoQuizStart = function () {
    var quizStartPage = new Page({
        headerLeft: highScoreButtonContainer,
        headerRight: quizTimerContainer,
        canvas: quizStartContainer
    });
    quizStartPage.display();
};
var gotoQuizQuestion = function () {
    var quizQuestionPage = new Page({
        headerLeft: highScoreButtonContainer,
        headerRight: quizTimerContainer,
        canvas: quizQuestionContainer
    });
    quizQuestionPage.display();
};
var gotoQuizEnd = function () {
    var quizEndPage = new Page({
        headerLeft: highScoreButtonContainer,
        headerRight: quizTimerContainer,
        canvas: quizEndContainer
    });
    quizEndPage.display();
};

// delayed starting elements
var headerLeftEld = delayedElementQuery("#header-left");
var headerRightEld = delayedElementQuery("#header-right");
var canvasEld = delayedElementQuery("#canvas");

// header containers
var highScoreButtonContainer = createHsButtonContainer(headerLeftEld);
var quizTimerContainer = createQuizTimerContainer(headerRightEld);
var quizButtonContainer = createQuizButtonContainer(headerLeftEld);
var deleteHsButtonContainer = createDeleteHsButtonContainer(headerRightEld);

// canvas containers
var quizStartContainer = createQuizStartContainer(canvasEld);
var quizQuestionContainer = createQuizQuestionContainer(canvasEld);
var quizEndContainer = createQuizEndContainer(canvasEld);
var highScoresContainer = createHighScoresContainer(canvasEld);

// shuffle questions then start it up
shuffleArray(quizData.questions);
gotoQuizStart();