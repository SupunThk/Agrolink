const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Question = require("./models/Question");

dotenv.config();

const srilankaQA = [
    {
        question: "What are the main seasons for paddy cultivation in Sri Lanka?",
        username: "System",
        category: "Crop Growth",
        status: "Answered",
        answers: [{
            username: "AgriExpert",
            answer: "In Sri Lanka, paddy is mainly cultivated in two seasons based on the monsoons: the Maha season (September to March, fed by the North-East monsoon) and the Yala season (May to August, fed by the South-West monsoon).",
            isAccepted: true
        }]
    },
    {
        question: "What are the best crops to grow in the dry zone of Sri Lanka?",
        username: "System",
        category: "Crop Growth",
        status: "Answered",
        answers: [{
            username: "AgriExpert",
            answer: "The dry zone is ideal for crops that require less water and lots of sunlight. Good choices include Maize, Groundnuts, Green Gram, Cowpea, Gingelly (Sesame), and chillies.",
            isAccepted: true
        }]
    },
    {
        question: "How to manage the Fall Armyworm in Sri Lankan corn fields?",
        username: "System",
        category: "Pest Management",
        status: "Answered",
        answers: [{
            username: "AgriExpert",
            answer: "Fall Armyworm (Sena dalambuwa) can be managed using integrated pest management. Use ash on the funnel of the plant, introduce natural enemies like parasitoids, and apply recommended bio-pesticides or physical collection during early stages. Chemical pesticides should be a last resort under the guidance of local agrarian officers.",
            isAccepted: true
        }]
    },
    {
        question: "What are traditional Sri Lankan methods for improving soil fertility?",
        username: "System",
        category: "Soil Management",
        status: "Answered",
        answers: [{
            username: "AgriExpert",
            answer: "Traditional methods include applying cow dung, using green manure (e.g., leaves of Gliricidia and Tithonia/Naththoori), incorporating paddy husk or charred rice husk (dahaiya), and practicing crop rotation with legume crops like mung beans.",
            isAccepted: true
        }]
    },
    {
        question: "Are there any specific pests affecting coconut cultivation in Sri Lanka?",
        username: "System",
        category: "Pest Management",
        status: "Answered",
        answers: [{
            username: "AgriExpert",
            answer: "Yes, prominent pests for coconut palms in Sri Lanka include the Red Weevil, Black Beetle (Rhinoceros beetle), and the Coconut Mite. Preventative measures involve estate cleanliness, pheromone traps, and proper application of approved insecticides into the trunk or crown.",
            isAccepted: true
        }]
    },
    {
        question: "What is 'Kandyan Forest Garden' system?",
        username: "System",
        category: "Organic Farming",
        status: "Answered",
        answers: [{
            username: "AgriExpert",
            answer: "The Kandyan Forest Garden is a traditional agroforestry system found in the wet and intermediate zones of Sri Lanka. It involves growing a highly diverse mix of trees, spices (like cloves, pepper, nutmeg), fruits, and medicinal plants on the same plot, mimicking a natural forest ecosystem.",
            isAccepted: true
        }]
    }
];

const seedChatbotData = async () => {
    try {
        if (!process.env.MONGO_URL) {
            console.error("MONGO_URL is missing in .env");
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGO_URL, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log("Connected to MongoDB for chatbot data seeding...");

        let addedCount = 0;
        for (const data of srilankaQA) {
            // Check if it already exists to avoid duplicates
            const exists = await Question.findOne({ question: data.question });
            if (!exists) {
                const newQ = new Question(data);
                await newQ.save();
                addedCount++;
            }
        }

        console.log(`Successfully added ${addedCount} new Sri Lankan agriculture Q&A pairs for the chatbot!`);
        process.exit(0);
    } catch (err) {
        console.error("Seeding Error:", err);
        process.exit(1);
    }
};

seedChatbotData();
