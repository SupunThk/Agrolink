const MIN_DESCRIPTION_LENGTH = 20;
const IMAGE_PATTERN = /\.(jpg|jpeg|png)(\?.*)?$/i;

export function validateKnowledgeSubmission(values) {
    const errors = {};
    const cropName = values.cropName?.trim() || "";
    const diseaseName = values.diseaseName?.trim() || "";
    const title = values.title?.trim() || "";
    const symptoms = values.symptoms?.trim() || "";
    const preventionMethods = values.preventionMethods?.trim() || "";
    const treatmentPlan = values.treatmentPlan?.trim() || "";
    const imageUrl = values.imageUrl?.trim() || "";

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

    if (imageUrl && !IMAGE_PATTERN.test(imageUrl)) {
        errors.imageUrl = "Only .jpg, .jpeg, and .png image paths are allowed.";
    }

    return errors;
}
