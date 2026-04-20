const Crop = require("../models/Crop");
const Disease = require("../models/Disease");
const Article = require("../models/Article");
const { CURATED_KNOWLEDGE_BASE } = require("../data/curatedKnowledgeBase");

async function syncCuratedKnowledge() {
    for (const entry of CURATED_KNOWLEDGE_BASE) {
        const crop = await Crop.findOneAndUpdate(
            { name: entry.cropName },
            { name: entry.cropName },
            { upsert: true, returnDocument: "after" }
        );

        const disease = await Disease.findOneAndUpdate(
            { diseaseName: entry.diseaseName, cropId: crop._id },
            {
                diseaseName: entry.diseaseName,
                aiModelLabel: entry.id,
                image: entry.imageUrl,
                cropId: crop._id,
            },
            { upsert: true, returnDocument: "after" }
        );

        await Article.findOneAndUpdate(
            { diseaseId: disease._id, title: entry.title },
            {
                title: entry.title,
                description: entry.description,
                imageUrl: entry.imageUrl,
                symptoms: entry.symptoms,
                preventionMethods: entry.preventionMethods,
                treatmentPlan: entry.treatmentPlan,
                diseaseId: disease._id,
                status: "approved",
            },
            { upsert: true, returnDocument: "after" }
        );
    }
}

module.exports = { syncCuratedKnowledge };
