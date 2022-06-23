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
    score: 0,
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
        this.score = 0;
        this.feedback = "";
    }
};

//compute total score based of quiz result and time left
var computeScore = function (result, timeLeft) {
    var result = Math.floor(100 * quizData.score / questions.length);
    return timeLeft + result;
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
    // todo: return a sorted array based off score
    return JSON.parse(localStorage.getItem("highScores")) || [];
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
        this.cleartimer = {};
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
        this.cleartimer = setInterval(this.timer.func, this.timer.delay);
    }
    startTimeouts() {
        this.timeouts.forEach(x => {
            setTimeout(x.func, x.delay);
        });
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
