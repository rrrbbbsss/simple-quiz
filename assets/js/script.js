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
