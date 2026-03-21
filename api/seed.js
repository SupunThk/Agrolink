const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Crop = require("./models/Crop");
const Disease = require("./models/Disease");
const Article = require("./models/Article");

dotenv.config();

const STARTER_DATA = [
    {
        cropName: "Tomato",
        diseaseName: "Tomato Late Blight",
        aiModelLabel: "early-blight",
        title: "Tomato Late Blight",
        imageUrl: "/images/1771924899240biotechnology-woman-engineer-examining-plant-leaf-disease.jpg",
        symptoms: [
            "Dark lesions develop quickly on leaves and stems",
            "Whitish fungal growth appears under humid conditions",
            "Fruit develops firm brown patches that spread rapidly",
        ],
        preventionMethods: [
            "Use certified disease-free seedlings",
            "Improve airflow with proper spacing and pruning",
            "Avoid wetting leaves during irrigation",
        ],
        treatmentPlan: "A devastating disease caused by Phytophthora infestans that affects leaves, stems, and fruits of tomato plants, especially during cool and wet periods."
    },
    {
        cropName: "Papaya",
        diseaseName: "Papaya Ring Spot Virus",
        aiModelLabel: "papaya-ringspot",
        title: "Papaya Ring Spot Virus",
        imageUrl: "/images/1771926326516close-up-picture-hand-holding-planting-sapling-plant.jpg",
        symptoms: [
            "Distinct ring-shaped marks on fruit skin",
            "Mosaic and distortion on leaves",
            "Reduced fruit quality and plant vigor",
        ],
        preventionMethods: [
            "Remove infected plants quickly",
            "Control aphid vectors early",
            "Use resistant or tolerant varieties where available",
        ],
        treatmentPlan: "A viral disease transmitted by aphids that causes distinctive ring-shaped markings on papaya fruits and severe leaf mosaic symptoms."
    },
    {
        cropName: "Rice",
        diseaseName: "Rice Blast Disease",
        aiModelLabel: "rice-blast",
        title: "Rice Blast Disease",
        imageUrl: "/images/1771606256159large-green-rice-field-with-green-rice-plants-rows.jpg",
        symptoms: [
            "Diamond-shaped lesions appear on leaves",
            "Neck infections reduce grain filling",
            "Severe outbreaks stunt overall crop growth",
        ],
        preventionMethods: [
            "Avoid excess nitrogen fertilizer",
            "Use resistant rice varieties",
            "Monitor fields closely during humid weather",
        ],
        treatmentPlan: "A fungal disease caused by Magnaporthe oryzae that affects rice plants at all growth stages and can severely reduce yield."
    }
];

async function upsertStarterArticle(entry) {
    const crop = await Crop.findOneAndUpdate(
        { name: entry.cropName },
        { name: entry.cropName },
        { new: true, upsert: true }
    );

    const disease = await Disease.findOneAndUpdate(
        { diseaseName: entry.diseaseName },
        {
            diseaseName: entry.diseaseName,
            aiModelLabel: entry.aiModelLabel,
            cropId: crop._id,
        },
        { new: true, upsert: true }
    );

    await Article.findOneAndUpdate(
        { title: entry.title },
        {
            title: entry.title,
            imageUrl: entry.imageUrl,
            symptoms: entry.symptoms,
            preventionMethods: entry.preventionMethods,
            treatmentPlan: entry.treatmentPlan,
            diseaseId: disease._id,
        },
        { new: true, upsert: true }
    );
}

async function seedData() {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to MongoDB for knowledge seeding.");

        for (const entry of STARTER_DATA) {
            await upsertStarterArticle(entry);
        }

        console.log("Starter knowledge data is ready.");
        process.exit(0);
    } catch (err) {
        console.error("Knowledge seed failed:", err);
        process.exit(1);
    }
}

seedData();
