const router = require("express").Router();
const mongoose = require("mongoose");
const Article = require("../models/Article");
require("../models/Disease");
require("../models/Crop");
const requireDb = require("../middleware/requireDb");

router.get("/", requireDb, async (req, res) => {
    const qSearch = (req.query.search || "").trim();
    const qCrop = (req.query.crop || "All").trim();

    try {
        let articles = await Article.find()
            .populate({
                path: "diseaseId",
                populate: { path: "cropId", model: "Crop" }
            })
            .lean();

        if (qCrop !== "All") {
            articles = articles.filter((article) =>
                article.diseaseId &&
                article.diseaseId.cropId &&
                article.diseaseId.cropId.name.toLowerCase() === qCrop.toLowerCase()
            );
        }

        if (qSearch !== "") {
            const searchLower = qSearch.toLowerCase();
            articles = articles.filter((article) => {
                const titleMatch = article.title?.toLowerCase().includes(searchLower);
                const diseaseMatch = article.diseaseId?.diseaseName?.toLowerCase().includes(searchLower);
                const symptomMatch = article.symptoms?.some((symptom) =>
                    symptom.toLowerCase().includes(searchLower)
                );

                return titleMatch || diseaseMatch || symptomMatch;
            });
        }

        return res.status(200).json(articles);
    } catch (err) {
        console.error("GET /api/knowledge failed:", err);
        return res.status(500).json({ message: "Failed to fetch knowledge articles." });
    }
});

router.get("/:id", requireDb, async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ message: "Knowledge article not found." });
    }

    try {
        const article = await Article.findById(id)
            .populate({
                path: "diseaseId",
                populate: { path: "cropId", model: "Crop" }
            })
            .lean();

        if (!article) {
            return res.status(404).json({ message: "Knowledge article not found." });
        }

        return res.status(200).json(article);
    } catch (err) {
        console.error(`GET /api/knowledge/${id} failed:`, err);
        return res.status(500).json({ message: "Failed to fetch knowledge article." });
    }
});

module.exports = router;
