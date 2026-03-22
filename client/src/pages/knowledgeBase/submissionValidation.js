const MIN_DESCRIPTION_LENGTH = 20;
const ALLOWED_IMAGE_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
]);

export function validateKnowledgeSubmission(values, imageFile = null) {
    const errors = {};
    const cropName = values.cropName?.trim() || "";
    const diseaseName = values.diseaseName?.trim() || "";
    const title = values.title?.trim() || "";
    const symptoms = values.symptoms?.trim() || "";
    const preventionMethods = values.preventionMethods?.trim() || "";
    const treatmentPlan = values.treatmentPlan?.trim() || "";

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

    if (!symptoms) {
        errors.symptoms = "Symptoms are required.";
    } else if (symptoms.length < MIN_DESCRIPTION_LENGTH) {
        errors.symptoms = `Symptoms must be at least ${MIN_DESCRIPTION_LENGTH} characters.`;
    }

    if (!preventionMethods) {
        errors.preventionMethods = "Prevention methods are required.";
    } else if (preventionMethods.length < MIN_DESCRIPTION_LENGTH) {
        errors.preventionMethods = `Prevention methods must be at least ${MIN_DESCRIPTION_LENGTH} characters.`;
    }

    if (!treatmentPlan) {
        errors.treatmentPlan = "Treatment plan is required.";
    } else if (treatmentPlan.length < MIN_DESCRIPTION_LENGTH) {
        errors.treatmentPlan = `Treatment plan must be at least ${MIN_DESCRIPTION_LENGTH} characters.`;
    }

    if (imageFile && !ALLOWED_IMAGE_TYPES.has(imageFile.type)) {
        errors.image = "Only JPG, JPEG, PNG, and WEBP files are allowed.";
    }

    return errors;
}
