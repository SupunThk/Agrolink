const router = require("express").Router();
const mongoose = require("mongoose");
const Article = require("../models/Article");
const Disease = require("../models/Disease");
const Crop = require("../models/Crop");
const User = require("../models/User");
const requireDb = require("../middleware/requireDb");
const MIN_DESCRIPTION_LENGTH = 20;
const ALLOWED_IMAGE_PATTERN = /\.(jpg|jpeg|png)(\?.*)?$/i;

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
    const cropName = cleanText(body?.cropName);
    const diseaseName = cleanText(body?.diseaseName);
    const title = cleanText(body?.title);
    const treatmentPlan = cleanText(body?.treatmentPlan);
    const symptoms = normalizeList(body?.symptoms);
    const preventionMethods = normalizeList(body?.preventionMethods);
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
        errors.imageUrl = "Image must be a JPG or PNG file path/URL.";
    }

    return {
        cropName,
        diseaseName,
        title,
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

async function getPublicCropNames() {
    const articles = await articlePopulateQuery(
        Article.find(publicArticleFilter).select("diseaseId")
    ).lean();

    return [...new Set(
        articles
            .map((article) => article.diseaseId?.cropId?.name)
            .filter(Boolean)
    )].sort((a, b) => a.localeCompare(b));
}

async function upsertCropAndDisease({ cropName, diseaseName, aiModelLabel }) {
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
            cropId: crop._id,
        },
        { new: true, upsert: true }
    );

    return { crop, disease };
}

router.get("/", requireDb, async (req, res) => {
    const qSearch = (req.query.search || "").trim();
    const qCrop = (req.query.crop || "All").trim();
    const requestedPage = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const requestedLimit = Math.max(parseInt(req.query.limit, 10) || 6, 1);

    try {
        const articleQuery = { $and: [publicArticleFilter] };
        let cropDiseaseIds = null;

        if (qCrop !== "All") {
            const crop = await Crop.findOne({ name: new RegExp(`^${qCrop}$`, "i") }).lean();

            if (!crop) {
                return res.status(200).json({
                    articles: [],
                    emptyMessage: getSearchEmptyMessage(qSearch, qCrop),
                    totalCount: 0,
                    currentPage: 1,
                    totalPages: 0,
                    limit: requestedLimit,
                });
            }

            const cropDiseases = await Disease.find({ cropId: crop._id }).select("_id").lean();
            cropDiseaseIds = cropDiseases.map((disease) => disease._id);

            if (cropDiseaseIds.length === 0) {
                return res.status(200).json({
                    articles: [],
                    emptyMessage: getSearchEmptyMessage(qSearch, qCrop),
                    totalCount: 0,
                    currentPage: 1,
                    totalPages: 0,
                    limit: requestedLimit,
                });
            }

            articleQuery.$and.push({ diseaseId: { $in: cropDiseaseIds } });
        }

        if (qSearch !== "") {
            const searchRegex = new RegExp(qSearch, "i");
            const diseaseSearchQuery = { diseaseName: searchRegex };
            const cropSearchQuery = { name: searchRegex };

            if (cropDiseaseIds) {
                diseaseSearchQuery._id = { $in: cropDiseaseIds };
            }

            const matchingDiseases = await Disease.find(diseaseSearchQuery).select("_id").lean();
            const matchingDiseaseIds = matchingDiseases.map((disease) => disease._id);
            const matchingCrops = await Crop.find(cropSearchQuery).select("_id").lean();
            const matchingCropIds = matchingCrops.map((crop) => crop._id);

            let cropMatchedDiseaseIds = [];
            if (matchingCropIds.length > 0) {
                const cropMatchedDiseases = await Disease.find({
                    cropId: { $in: matchingCropIds },
                    ...(cropDiseaseIds ? { _id: { $in: cropDiseaseIds } } : {})
                }).select("_id").lean();
                cropMatchedDiseaseIds = cropMatchedDiseases.map((disease) => disease._id);
            }

            const searchConditions = [
                { title: searchRegex },
                { symptoms: { $elemMatch: { $regex: searchRegex } } },
                { preventionMethods: { $elemMatch: { $regex: searchRegex } } },
                { treatmentPlan: searchRegex },
            ];

            if (matchingDiseaseIds.length > 0) {
                searchConditions.push({ diseaseId: { $in: matchingDiseaseIds } });
            }

            if (cropMatchedDiseaseIds.length > 0) {
                searchConditions.push({ diseaseId: { $in: cropMatchedDiseaseIds } });
            }

            articleQuery.$and.push({ $or: searchConditions });
        }

        const totalCount = await Article.countDocuments(articleQuery);
        const totalPages = totalCount > 0 ? Math.ceil(totalCount / requestedLimit) : 0;
        const currentPage = totalPages > 0 ? Math.min(requestedPage, totalPages) : 1;
        const skip = (currentPage - 1) * requestedLimit;

        const articles = await articlePopulateQuery(
            Article.find(articleQuery)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(requestedLimit)
        ).lean();

        return res.status(200).json({
            articles,
            emptyMessage: getSearchEmptyMessage(qSearch, qCrop),
            totalCount,
            currentPage,
            totalPages,
            limit: requestedLimit,
        });
    } catch (err) {
        console.error("GET /api/knowledge failed:", err);
        return res.status(500).json({ message: "Failed to fetch knowledge articles." });
    }
});

router.get("/crops", requireDb, async (req, res) => {
    try {
        const crops = await getPublicCropNames();
        return res.status(200).json({ crops });
    } catch (err) {
        console.error("GET /api/knowledge/crops failed:", err);
        return res.status(500).json({ message: "Failed to fetch knowledge crops." });
    }
});

router.post("/", requireDb, async (req, res) => {
    const userId = req.body?.userId;
    const {
        cropName,
        diseaseName,
        title,
        treatmentPlan,
        symptoms,
        preventionMethods,
        imageUrl,
        errors,
    } = validateKnowledgePayload(req.body);
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

        const { disease } = await upsertCropAndDisease({ cropName, diseaseName, aiModelLabel });

        const article = await new Article({
            title,
            symptoms,
            preventionMethods,
            treatmentPlan,
            imageUrl,
            diseaseId: disease._id,
            status: "pending",
            submittedBy: userId,
        }).save();

        return res.status(201).json({
            message: "Submission received and saved as pending review.",
            articleId: article._id,
            status: article.status,
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

router.get("/:id/related", requireDb, async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid knowledge article id." });
    }

    try {
        const currentArticle = await articlePopulateQuery(
            Article.findOne({ _id: id, ...publicArticleFilter })
        ).lean();

        if (!currentArticle?.diseaseId?.cropId?._id) {
            return res.status(404).json({ message: "Knowledge article not found." });
        }

        const relatedArticles = await articlePopulateQuery(
            Article.find({
                _id: { $ne: currentArticle._id },
                ...publicArticleFilter,
            })
        ).lean();

        const filteredRelated = relatedArticles
            .filter((article) =>
                String(article.diseaseId?.cropId?._id) === String(currentArticle.diseaseId.cropId._id)
            )
            .slice(0, 3);

        return res.status(200).json(filteredRelated);
    } catch (err) {
        console.error(`GET /api/knowledge/${id}/related failed:`, err);
        return res.status(500).json({ message: "Failed to fetch related knowledge articles." });
    }
});

router.get("/:id", requireDb, async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid knowledge article id." });
    }

    try {
        const article = await articlePopulateQuery(
            Article.findOne({ _id: id, ...publicArticleFilter })
        ).lean();

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
