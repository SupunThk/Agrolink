const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const ALLOWED_MIME_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
]);

function sanitizeBaseName(filename) {
    return path
        .basename(filename, path.extname(filename))
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 40) || "image";
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "..", "images"));
    },
    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname || "").toLowerCase();
        const safeBaseName = sanitizeBaseName(file.originalname || "image");
        const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}`;
        cb(null, `${safeBaseName}-${uniqueSuffix}${extension}`);
    },
});

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        const extension = path.extname(file.originalname || "").toLowerCase();
        const mimeType = (file.mimetype || "").toLowerCase();

        if (!ALLOWED_EXTENSIONS.has(extension) || !ALLOWED_MIME_TYPES.has(mimeType)) {
            const error = new Error("Only JPG, JPEG, PNG, and WEBP image files are allowed.");
            error.statusCode = 400;
            return cb(error);
        }

        return cb(null, true);
    },
});

function uploadKnowledgeImage(req, res, next) {
    upload.single("image")(req, res, (err) => {
        if (!err) {
            return next();
        }

        if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ message: "Image file size must be 5MB or less." });
        }

        return res.status(err.statusCode || 400).json({
            message: err.message || "Image upload failed.",
        });
    });
}

module.exports = uploadKnowledgeImage;
