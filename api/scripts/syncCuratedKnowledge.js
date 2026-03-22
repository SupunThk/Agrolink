const Crop = require("../models/Crop");
const Disease = require("../models/Disease");
const Article = require("../models/Article");
const { CURATED_KNOWLEDGE_BASE } = require("../data/curatedKnowledgeBase");

async function syncCuratedKnowledge() {
    for (const entry of CURATED_KNOWLEDGE_BASE) {
        const crop = await Crop.findOneAndUpdate(
            { name: entry.cropName },
            { name: entry.cropName },
            { new: true, upsert: true }
        );

        const disease = await Disease.findOneAndUpdate(
            { diseaseName: entry.diseaseName, cropId: crop._id },
            {
                diseaseName: entry.diseaseName,
                aiModelLabel: entry.id,
                cropId: crop._id,
            },
            { new: true, upsert: true }
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
            { new: true, upsert: true }
        );
    }
}

module.exports = { syncCuratedKnowledge };
