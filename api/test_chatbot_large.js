const { spawn } = require("child_process");
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Question = require("./models/Question");

dotenv.config();

async function test() {
    await mongoose.connect(process.env.MONGO_URL);
    const answeredDocs = await Question.find({ status: "Answered" }).populate('answers');

    const dynamicTrainingData = answeredDocs.map(doc => {
        let bestAnswer = doc.answers.find(a => a.isAccepted);
        if (!bestAnswer && doc.answers.length > 0) bestAnswer = doc.answers[0];
        if (bestAnswer) {
            return { question: doc.question, answer: bestAnswer.answer, priority: 5 };
        }
        return null;
    }).filter(qa => qa !== null);

    console.log("Training data length:", dynamicTrainingData.length);

    const inputPayload = JSON.stringify({
        message: "What is the expected average yield of Tea per hectare?",
        trainingData: dynamicTrainingData
    });

    console.log("Payload length:", inputPayload.length);

    const pythonProcess = spawn("python", [path.join(__dirname, "services/chatbot.py")]);

    let output = "";
    let errorOutput = "";

    pythonProcess.stdout.on("data", (data) => output += data.toString());
    pythonProcess.stderr.on("data", (data) => errorOutput += data.toString());

    pythonProcess.on("close", (code) => {
        console.log("Python code:", code);
        console.log("Python output:", output);
        console.log("Python stderr:", errorOutput);
        process.exit(0);
    });

    pythonProcess.stdin.write(inputPayload);
    pythonProcess.stdin.end();
}

test();
