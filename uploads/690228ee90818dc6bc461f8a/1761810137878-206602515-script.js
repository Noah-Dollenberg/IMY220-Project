/** do not modify this code */

(function () {
    const logContainer = document.createElement('pre');
    logContainer.id = 'console-log';
    logContainer.style.background = '#222';
    logContainer.style.color = '#0f0';
    logContainer.style.padding = '1em';
    document.body.appendChild(logContainer);

    function printToScreen(...args) {
        logContainer.textContent += args.map(arg =>
            typeof arg === 'object' && arg !== null ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ') + '\n';
    }

    const origLog = console.log;
    console.log = function (...args) {
        origLog.apply(console, args);
        printToScreen(...args);
    };
})();

const students = [
    { name: "Alice", degree: { program: "Computer Science", year: 2, department: "Engineering" }, scores: [78, 85, 54, 90] },
    { name: "Bob", degree: { program: "Mathematics", year: 1, department: "Science" }, scores: [50, 60, 70] },
    null,
    { name: "Charlie", degree: { program: "Physics", year: 3, department: "Science" }, scores: [95, 88, 92] },
    { name: "Diffie", degree: { program: "Dentistry", year: 4, department: "Health Sciences" }, scores: [82, 43, 79, 85] },
    { name: "Diana", degree: { program: "Biology", year: 2, department: "Science" }, scores: [65, 65, 72, 68] },
    null,
    { name: "Ethan", degree: { program: "Chemistry", year: 1, department: "Science" }, scores: [80, 85, 78] },
    null,
    { name: "Fiona", degree: { program: "Engineering", year: 3, department: "Engineering" }, scores: [88, 90, 85] },
    { name: "George", degree: { program: "Medicine", year: 2, department: "Health Sciences" }, scores: [75, 78, 80, 70] }
];

/** add your code from here */

// Task 1
const cleanNull = students.filter(function (students) {
    return students != null;
});

console.log(cleanNull);

// Task 2
var high = 0;
var low = 1000;

const studentScore = cleanNull.map(function (cleanNull) {

    var name = cleanNull.name;
    var totalScore = cleanNull.scores.reduce(function (accumulator, currScore) {
        return accumulator + currScore;
    });
    var avg = Math.round(totalScore / cleanNull.scores.length);

    if (avg > high) {
        high = avg;
        return "highest: name: " + name + ", averageScore: " + avg;
    } else if (avg < low) {
        low = avg;
        return "lowest: name: " + name + ", averageScore: " + avg;
    } else {
        return "name: " + name + ", averageScore: " + avg;
    }
});

console.log(studentScore);

//Task 3
const filterScores = studentScore.filter(checkAvg);

function checkAvg(studentScore) {
    return studentScore;
} 

console.log(filterScores);

//Task 4

// 41, u24596142