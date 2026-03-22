const router = require("express").Router();
const mongoose = require("mongoose");
const Article = require("../models/Article");
const Disease = require("../models/Disease");
const Crop = require("../models/Crop");
const User = require("../models/User");
const requireDb = require("../middleware/requireDb");
const uploadKnowledgeImage = require("../middleware/uploadKnowledgeImage");
const {
    getCuratedKnowledgeArticles,
    getCuratedKnowledgeArticleById,
    getCuratedCropNames,
} = require("../data/curatedKnowledgeBase");
const MIN_DESCRIPTION_LENGTH = 20;
const ALLOWED_IMAGE_PATTERN = /\.(jpg|jpeg|png|webp)(\?.*)?$/i;

function normalizeList(value) {
    if (Array.isArray(value)) {
        return value.map((item) => String(item).trim()).filter(Boolean);
    }

    if (typeof value === "string") {
        return value
            .split(/\r?\n|,/)
            .map((item) => item.trim())
            .filter(Boolean);
    }

    return [];
}

function cleanText(value) {
    return typeof value === "string" ? value.trim() : "";
}

function getDescriptionLength(value) {
    if (Array.isArray(value)) {
        return value.join(" ").trim().length;
    }

    return cleanText(value).length;
}

function validateKnowledgePayload(body) {
    const cropName = cleanText(body?.cropName || body?.crop);
    const diseaseName = cleanText(body?.diseaseName || body?.title);
    const title = cleanText(body?.title);
    const description = cleanText(body?.description);
    const treatmentPlan = cleanText(body?.treatmentPlan || body?.treatment);
    const symptoms = normalizeList(body?.symptoms);
    const preventionMethods = normalizeList(body?.preventionMethods ?? body?.prevention);
    const imageUrl = cleanText(body?.imageUrl);
    const errors = {};

    if (!cropName) {
        errors.cropName = "Crop type is required.";
    }

    if (!diseaseName) {
        errors.diseaseName = "Disease name is required.";
    }

    if (!title) {
        errors.title = "Article title is required.";
    } else if (title.length < MIN_DESCRIPTION_LENGTH) {
        errors.title = `Article title must be at least ${MIN_DESCRIPTION_LENGTH} characters.`;
    }

    if (!description) {
        errors.description = "Description is required.";
    } else if (description.length < MIN_DESCRIPTION_LENGTH) {
        errors.description = `Description must be at least ${MIN_DESCRIPTION_LENGTH} characters.`;
    }

    if (symptoms.length === 0) {
        errors.symptoms = "Symptoms are required.";
    } else if (getDescriptionLength(symptoms) < MIN_DESCRIPTION_LENGTH) {
        errors.symptoms = `Symptoms must be at least ${MIN_DESCRIPTION_LENGTH} characters in total.`;
    }

    if (preventionMethods.length === 0) {
        errors.preventionMethods = "Prevention methods are required.";
    } else if (getDescriptionLength(preventionMethods) < MIN_DESCRIPTION_LENGTH) {
        errors.preventionMethods = `Prevention methods must be at least ${MIN_DESCRIPTION_LENGTH} characters in total.`;
    }

    if (!treatmentPlan) {
        errors.treatmentPlan = "Treatment plan is required.";
    } else if (treatmentPlan.length < MIN_DESCRIPTION_LENGTH) {
        errors.treatmentPlan = `Treatment plan must be at least ${MIN_DESCRIPTION_LENGTH} characters.`;
    }

    if (imageUrl && !ALLOWED_IMAGE_PATTERN.test(imageUrl)) {
        errors.imageUrl = "Image must be a JPG, JPEG, PNG, or WEBP file path/URL.";
    }

    return {
        cropName,
        diseaseName,
        title,
        description,
        treatmentPlan,
        symptoms,
        preventionMethods,
        imageUrl,
        errors,
    };
}

async function requireAdminAccess(req, res) {
    const userId = req.body?.userId || req.query?.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        res.status(401).json({ message: "Admin access requires a valid userId." });
        return null;
    }

    const user = await User.findById(userId).lean();
    if (!user || !user.isAdmin) {
        res.status(403).json({ message: "Admin access required." });
        return null;
    }

    return user;
}

async function requireAuthenticatedUser(req, res) {
    const userId = req.body?.userId || req.query?.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        res.status(401).json({ message: "Login required.", errors: { userId: "A valid logged-in user is required." } });
        return null;
    }

    const user = await User.findById(userId).lean();
    if (!user) {
        res.status(401).json({ message: "Login required.", errors: { userId: "A valid logged-in user is required." } });
        return null;
    }

    return user;
}

function articlePopulateQuery(query) {
    return query
        .populate({
            path: "diseaseId",
            populate: { path: "cropId", model: "Crop" }
        })
        .populate({ path: "submittedBy", select: "username profilePic isAdmin" });
}

const publicArticleFilter = {
    $or: [
        { status: "approved" },
        { status: { $exists: false } },
        { status: null },
    ],
};

function getSearchEmptyMessage(search, crop) {
    if (search || crop !== "All") {
        return "No published articles matched your current search or crop filter.";
    }

    return "No approved knowledge articles are available yet.";
}

async function upsertCropAndDisease({ cropName, diseaseName, aiModelLabel, image }) {
    const crop = await Crop.findOneAndUpdate(
        { name: cropName },
        { name: cropName },
        { new: true, upsert: true }
    );

    const disease = await Disease.findOneAndUpdate(
        { diseaseName, cropId: crop._id },
        {
            diseaseName,
            aiModelLabel,
            ...(image ? { image } : {}),
            cropId: crop._id,
        },
        { new: true, upsert: true }
    );

    return { crop, disease };
}

router.get("/", (req, res) => {
    const qSearch = (req.query.search || "").trim().toLowerCase();
    const qCrop = (req.query.crop || "All").trim().toLowerCase();

    const filteredArticles = getCuratedKnowledgeArticles().filter((article) => {
        const cropName = article.diseaseId?.cropId?.name?.toLowerCase() || "";
        const diseaseName = article.diseaseId?.diseaseName?.toLowerCase() || "";
        const title = article.title?.toLowerCase() || "";
        const description = article.description?.toLowerCase() || "";

        const matchesCrop = qCrop === "all" || cropName === qCrop;
        const matchesSearch =
            qSearch === "" ||
            title.includes(qSearch) ||
            diseaseName.includes(qSearch) ||
            cropName.includes(qSearch) ||
            description.includes(qSearch);

        return matchesCrop && matchesSearch;
    });

    return res.status(200).json({
        articles: filteredArticles,
        emptyMessage: getSearchEmptyMessage(qSearch, qCrop === "all" ? "All" : qCrop),
        totalCount: filteredArticles.length,
        currentPage: 1,
        totalPages: filteredArticles.length > 0 ? 1 : 0,
        limit: filteredArticles.length,
    });
});

router.get("/crops", (req, res) => {
    return res.status(200).json({ crops: getCuratedCropNames() });
});

router.post("/", requireDb, uploadKnowledgeImage, async (req, res) => {
    const userId = req.body?.userId;
    const {
        cropName,
        diseaseName,
        title,
        description,
        treatmentPlan,
        symptoms,
        preventionMethods,
        imageUrl,
        errors,
    } = validateKnowledgePayload(req.body);
    const uploadedImagePath = req.file ? `/images/${req.file.filename}` : imageUrl;
    const aiModelLabel =
        cleanText(req.body?.aiModelLabel) ||
        diseaseName?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({
            message: "Please correct the highlighted submission fields.",
            errors,
        });
    }

    try {
        const submittingUser = await requireAuthenticatedUser(req, res);
        if (!submittingUser) {
            return;
        }

        const { disease } = await upsertCropAndDisease({
            cropName,
            diseaseName,
            aiModelLabel,
            image: uploadedImagePath,
        });

        const article = await new Article({
            title,
            description,
            symptoms,
            preventionMethods,
            treatmentPlan,
            imageUrl: uploadedImagePath,
            diseaseId: disease._id,
            status: "pending",
            submittedBy: userId,
        }).save();

        const savedDisease = await Disease.findById(disease._id)
            .populate({ path: "cropId", model: "Crop" })
            .lean();

        return res.status(201).json({
            message: "Submission received and saved as pending review.",
            articleId: article._id,
            status: article.status,
            disease: savedDisease,
        });
    } catch (err) {
        console.error("POST /api/knowledge failed:", err);
        return res.status(500).json({ message: "Failed to submit knowledge article." });
    }
});

router.get("/mine", requireDb, async (req, res) => {
    try {
        const submittingUser = await requireAuthenticatedUser(req, res);
        if (!submittingUser) {
            return;
        }

        const myArticles = await articlePopulateQuery(
            Article.find({ submittedBy: submittingUser._id }).sort({ createdAt: -1 })
        ).lean();

        return res.status(200).json(myArticles);
    } catch (err) {
        console.error("GET /api/knowledge/mine failed:", err);
        return res.status(500).json({ message: "Failed to fetch your knowledge submissions." });
    }
});

router.get("/mine/:id", requireDb, async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid knowledge article id." });
    }

    try {
        const submittingUser = await requireAuthenticatedUser(req, res);
        if (!submittingUser) {
            return;
        }

        const article = await articlePopulateQuery(
            Article.findOne({ _id: id, submittedBy: submittingUser._id })
        ).lean();

        if (!article) {
            return res.status(404).json({ message: "Knowledge article not found." });
        }

        return res.status(200).json(article);
    } catch (err) {
        console.error(`GET /api/knowledge/mine/${id} failed:`, err);
        return res.status(500).json({ message: "Failed to fetch your knowledge submission." });
    }
});

router.put("/mine/:id", requireDb, async (req, res) => {
    const { id } = req.params;
    const {
        cropName,
        diseaseName,
        title,
        description,
        treatmentPlan,
        symptoms,
        preventionMethods,
        imageUrl,
        errors,
    } = validateKnowledgePayload(req.body);

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid knowledge article id." });
    }

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({
            message: "Please correct the highlighted submission fields.",
            errors,
        });
    }

    try {
        const submittingUser = await requireAuthenticatedUser(req, res);
        if (!submittingUser) {
            return;
        }

        const existingArticle = await Article.findOne({ _id: id, submittedBy: submittingUser._id });
        if (!existingArticle) {
            return res.status(404).json({ message: "Knowledge article not found." });
        }

        if (existingArticle.status !== "pending") {
            return res.status(409).json({ message: "Only pending submissions can be edited." });
        }

        const aiModelLabel =
            cleanText(req.body?.aiModelLabel) ||
            diseaseName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        const { disease } = await upsertCropAndDisease({ cropName, diseaseName, aiModelLabel });

        existingArticle.title = title;
        existingArticle.description = description;
        existingArticle.symptoms = symptoms;
        existingArticle.preventionMethods = preventionMethods;
        existingArticle.treatmentPlan = treatmentPlan;
        existingArticle.imageUrl = imageUrl;
        existingArticle.diseaseId = disease._id;

        await existingArticle.save();

        const updatedArticle = await articlePopulateQuery(
            Article.findById(existingArticle._id)
        ).lean();

        return res.status(200).json({
            message: "Pending submission updated successfully.",
            article: updatedArticle,
        });
    } catch (err) {
        console.error(`PUT /api/knowledge/mine/${id} failed:`, err);
        return res.status(500).json({ message: "Failed to update your knowledge submission." });
    }
});

router.delete("/mine/:id", requireDb, async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid knowledge article id." });
    }

    try {
        const submittingUser = await requireAuthenticatedUser(req, res);
        if (!submittingUser) {
            return;
        }

        const article = await Article.findOne({ _id: id, submittedBy: submittingUser._id });
        if (!article) {
            return res.status(404).json({ message: "Knowledge article not found." });
        }

        if (article.status !== "pending") {
            return res.status(409).json({ message: "Only pending submissions can be deleted." });
        }

        await Article.deleteOne({ _id: id });

        return res.status(200).json({ message: "Pending submission deleted successfully." });
    } catch (err) {
        console.error(`DELETE /api/knowledge/mine/${id} failed:`, err);
        return res.status(500).json({ message: "Failed to delete your knowledge submission." });
    }
});

router.get("/pending", requireDb, async (req, res) => {
    try {
        const adminUser = await requireAdminAccess(req, res);
        if (!adminUser) {
            return;
        }

        const pendingArticles = await articlePopulateQuery(
            Article.find({ status: "pending" }).sort({ createdAt: -1 })
        ).lean();

        return res.status(200).json(pendingArticles);
    } catch (err) {
        console.error("GET /api/knowledge/pending failed:", err);
        return res.status(500).json({ message: "Failed to fetch pending knowledge articles." });
    }
});

async function updateArticleStatus(req, res, nextStatus) {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid knowledge article id." });
    }

    try {
        const adminUser = await requireAdminAccess(req, res);
        if (!adminUser) {
            return;
        }

        const article = await articlePopulateQuery(
            Article.findByIdAndUpdate(
                id,
                { $set: { status: nextStatus } },
                { new: true }
            )
        ).lean();

        if (!article) {
            return res.status(404).json({ message: "Knowledge article not found." });
        }

        return res.status(200).json({
            message: `Knowledge article ${nextStatus}.`,
            article,
        });
    } catch (err) {
        console.error(`PUT /api/knowledge/${id}/${nextStatus} failed:`, err);
        return res.status(500).json({ message: `Failed to update knowledge article status to ${nextStatus}.` });
    }
}

router.put("/:id/approve", requireDb, async (req, res) => {
    return updateArticleStatus(req, res, "approved");
});

router.put("/:id/reject", requireDb, async (req, res) => {
    return updateArticleStatus(req, res, "rejected");
});

router.get("/:id/related", (req, res) => {
    const { id } = req.params;

    const currentArticle = getCuratedKnowledgeArticleById(id);

    if (!currentArticle) {
        return res.status(404).json({ message: "Knowledge article not found." });
    }

    const relatedArticles = getCuratedKnowledgeArticles()
        .filter((article) => article._id !== id)
        .filter(
            (article) =>
                article.diseaseId?.cropId?.name === currentArticle.diseaseId?.cropId?.name
        )
        .slice(0, 3);

    return res.status(200).json(relatedArticles);
});

router.get("/:id", (req, res) => {
    const { id } = req.params;

    const article = getCuratedKnowledgeArticleById(id);

    if (!article) {
        return res.status(404).json({ message: "Knowledge article not found." });
    }

    return res.status(200).json(article);
});

module.exports = router;
