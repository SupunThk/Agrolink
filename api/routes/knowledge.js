const router = require("express").Router();
const mongoose = require("mongoose");
const Article = require("../models/Article");
const Disease = require("../models/Disease");
const Crop = require("../models/Crop");
const User = require("../models/User");
const requireDb = require("../middleware/requireDb");
const uploadKnowledgeImage = require("../middleware/uploadKnowledgeImage");

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

function validateKnowledgePayload(body, options = {}) {
    const cropName = cleanText(body?.cropName || body?.crop);
    const diseaseName = cleanText(body?.diseaseName || body?.title);
    const title = cleanText(body?.title);
    const symptoms = normalizeList(body?.symptoms);
    const fallbackDescription = symptoms.join(" ");
    const description = cleanText(body?.description || fallbackDescription);
    const treatmentPlan = cleanText(body?.treatmentPlan || body?.treatment);
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

    if (options.requireUserId && !cleanText(body?.userId)) {
        errors.userId = "A valid logged-in user is required.";
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
            populate: { path: "cropId", model: "Crop" },
        })
        .populate({ path: "submittedBy", select: "name username email profilePic isAdmin" });
}

function getSearchEmptyMessage(search, crop) {
    if (search || crop !== "All") {
        return "No published articles matched your current search or crop filter.";
    }

    return "No approved crop disease articles are available yet.";
}

async function upsertCropAndDisease({ cropName, diseaseName, aiModelLabel, image }) {
    const crop = await Crop.findOneAndUpdate(
        { name: cropName },
        { name: cropName },
        { upsert: true, returnDocument: "after" }
    );

    const disease = await Disease.findOneAndUpdate(
        { diseaseName, cropId: crop._id },
        {
            diseaseName,
            aiModelLabel,
            ...(image ? { image } : {}),
            cropId: crop._id,
        },
        { upsert: true, returnDocument: "after" }
    );

    return { crop, disease };
}

function filterArticles(articles, search, crop) {
    const normalizedSearch = cleanText(search).toLowerCase();
    const normalizedCrop = cleanText(crop || "All").toLowerCase();

    return articles.filter((article) => {
        const cropName = article.diseaseId?.cropId?.name?.toLowerCase() || "";
        const diseaseName = article.diseaseId?.diseaseName?.toLowerCase() || "";
        const title = article.title?.toLowerCase() || "";
        const description = article.description?.toLowerCase() || "";

        const matchesCrop = normalizedCrop === "all" || cropName === normalizedCrop;
        const matchesSearch =
            normalizedSearch === "" ||
            title.includes(normalizedSearch) ||
            diseaseName.includes(normalizedSearch) ||
            cropName.includes(normalizedSearch) ||
            description.includes(normalizedSearch);

        return matchesCrop && matchesSearch;
    });
}

function buildUploadedImagePath(req, fallbackImageUrl = "") {
    if (req.file) {
        return `/images/${req.file.filename}`;
    }

    return fallbackImageUrl;
}

router.get("/", requireDb, async (req, res) => {
    try {
        const qSearch = req.query.search || "";
        const qCrop = req.query.crop || "All";
        const approvedArticles = await articlePopulateQuery(
            Article.find({ status: "approved" }).sort({ createdAt: -1 })
        ).lean();

        const filteredArticles = filterArticles(approvedArticles, qSearch, qCrop);

        return res.status(200).json({
            articles: filteredArticles,
            emptyMessage: getSearchEmptyMessage(qSearch, qCrop),
            totalCount: filteredArticles.length,
            currentPage: 1,
            totalPages: filteredArticles.length > 0 ? 1 : 0,
            limit: filteredArticles.length,
        });
    } catch (err) {
        console.error("GET /api/knowledge failed:", err);
        return res.status(500).json({ message: "Failed to fetch crop disease articles." });
    }
});

router.get("/crops", requireDb, async (req, res) => {
    try {
        const crops = await Crop.find().sort({ name: 1 }).lean();
        return res.status(200).json({ crops: crops.map((crop) => crop.name) });
    } catch (err) {
        console.error("GET /api/knowledge/crops failed:", err);
        return res.status(500).json({ message: "Failed to fetch crop options." });
    }
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
    } = validateKnowledgePayload(req.body, { requireUserId: true });
    const uploadedImagePath = buildUploadedImagePath(req, imageUrl);
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

router.post("/admin", requireDb, uploadKnowledgeImage, async (req, res) => {
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
    } = validateKnowledgePayload(req.body, { requireUserId: true });
    const uploadedImagePath = buildUploadedImagePath(req, imageUrl);
    const aiModelLabel =
        cleanText(req.body?.aiModelLabel) ||
        diseaseName?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({
            message: "Please correct the highlighted disease fields.",
            errors,
        });
    }

    try {
        const adminUser = await requireAdminAccess(req, res);
        if (!adminUser) {
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
            status: "approved",
            submittedBy: adminUser._id,
        }).save();

        const savedArticle = await articlePopulateQuery(Article.findById(article._id)).lean();

        return res.status(201).json({
            message: "Crop disease profile created successfully.",
            article: savedArticle,
        });
    } catch (err) {
        console.error("POST /api/knowledge/admin failed:", err);
        return res.status(500).json({ message: "Failed to create crop disease profile." });
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
    } = validateKnowledgePayload(req.body, { requireUserId: true });

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

router.get("/admin/list", requireDb, async (req, res) => {
    try {
        const adminUser = await requireAdminAccess(req, res);
        if (!adminUser) {
            return;
        }

        const articles = await articlePopulateQuery(
            Article.find().sort({ createdAt: -1 })
        ).lean();

        return res.status(200).json(articles);
    } catch (err) {
        console.error("GET /api/knowledge/admin/list failed:", err);
        return res.status(500).json({ message: "Failed to fetch knowledge articles for admin." });
    }
});

router.put("/admin/:id", requireDb, uploadKnowledgeImage, async (req, res) => {
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
    } = validateKnowledgePayload(req.body, { requireUserId: true });

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid knowledge article id." });
    }

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({
            message: "Please correct the highlighted disease fields.",
            errors,
        });
    }

    try {
        const adminUser = await requireAdminAccess(req, res);
        if (!adminUser) {
            return;
        }

        const existingArticle = await Article.findById(id);
        if (!existingArticle) {
            return res.status(404).json({ message: "Knowledge article not found." });
        }

        const uploadedImagePath = buildUploadedImagePath(req, imageUrl || existingArticle.imageUrl);
        const aiModelLabel =
            cleanText(req.body?.aiModelLabel) ||
            diseaseName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        const { disease } = await upsertCropAndDisease({
            cropName,
            diseaseName,
            aiModelLabel,
            image: uploadedImagePath,
        });

        existingArticle.title = title;
        existingArticle.description = description;
        existingArticle.symptoms = symptoms;
        existingArticle.preventionMethods = preventionMethods;
        existingArticle.treatmentPlan = treatmentPlan;
        existingArticle.imageUrl = uploadedImagePath;
        existingArticle.diseaseId = disease._id;
        existingArticle.status = "approved";
        existingArticle.submittedBy = existingArticle.submittedBy || adminUser._id;

        await existingArticle.save();

        const updatedArticle = await articlePopulateQuery(Article.findById(existingArticle._id)).lean();

        return res.status(200).json({
            message: "Crop disease profile updated successfully.",
            article: updatedArticle,
        });
    } catch (err) {
        console.error(`PUT /api/knowledge/admin/${id} failed:`, err);
        return res.status(500).json({ message: "Failed to update crop disease profile." });
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

router.delete("/admin/:id", requireDb, async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid knowledge article id." });
    }

    try {
        const adminUser = await requireAdminAccess(req, res);
        if (!adminUser) {
            return;
        }

        const article = await Article.findById(id);
        if (!article) {
            return res.status(404).json({ message: "Knowledge article not found." });
        }

        if (article.status !== "approved") {
            return res.status(409).json({ message: "Only approved disease information can be deleted." });
        }

        await Article.deleteOne({ _id: id });

        return res.status(200).json({ message: "Approved disease information deleted successfully." });
    } catch (err) {
        console.error(`DELETE /api/knowledge/admin/${id} failed:`, err);
        return res.status(500).json({ message: "Failed to delete disease information." });
    }
});

router.get("/:id/related", requireDb, async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid knowledge article id." });
    }

    try {
        const currentArticle = await articlePopulateQuery(
            Article.findOne({ _id: id, status: "approved" })
        ).lean();

        if (!currentArticle) {
            return res.status(404).json({ message: "Knowledge article not found." });
        }

        const cropId = currentArticle.diseaseId?.cropId?._id;
        const relatedArticles = await articlePopulateQuery(
            Article.find({
                _id: { $ne: id },
                status: "approved",
            }).sort({ createdAt: -1 })
        ).lean();

        const filteredArticles = relatedArticles
            .filter((article) => String(article.diseaseId?.cropId?._id) === String(cropId))
            .slice(0, 3);

        return res.status(200).json(filteredArticles);
    } catch (err) {
        console.error(`GET /api/knowledge/${id}/related failed:`, err);
        return res.status(500).json({ message: "Failed to fetch related crop disease articles." });
    }
});

router.get("/:id", requireDb, async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid knowledge article id." });
    }

    try {
        const article = await articlePopulateQuery(
            Article.findOne({ _id: id, status: "approved" })
        ).lean();

        if (!article) {
            return res.status(404).json({ message: "Knowledge article not found." });
        }

        return res.status(200).json(article);
    } catch (err) {
        console.error(`GET /api/knowledge/${id} failed:`, err);
        return res.status(500).json({ message: "Failed to fetch crop disease article." });
    }
});

module.exports = router;
