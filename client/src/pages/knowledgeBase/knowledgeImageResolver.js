const IMAGE_BASE_URL = "http://localhost:5000";

const GENERIC_IMAGE_KEYWORDS = [
    "agriculture",
    "healthy-food",
    "landscape",
    "meadow",
    "sapling",
    "seedling",
    "basket",
    "vegetables",
    "gardener",
    "spraying",
    "engineer",
    "whatsapp",
    "hand-holding",
    "close-up-picture",
    "thunderstorm",
    "clouds",
    "countryside",
    "cooperation-team",
    "storm",
];

const DISEASE_IMAGE_MAP = {
    "tomato early blight": "/images/1771924899240biotechnology-woman-engineer-examining-plant-leaf-disease.jpg",
    "tomato late blight": "/images/1771923045805female-gardener-spraying-insecticide-plant.jpg",
    "tomato leaf mold": "/images/1771923628756WhatsApp Image 2026-02-24 at 2.29.24 PM.jpeg",
    "tomato bacterial spot": "/images/1771922115971woman-with-vegetables-basket.jpg",
    "tomato septoria leaf spot": "/images/1772114336874agriculture-healthy-food.jpg",
    "tomato fusarium wilt": "/images/1771926188569photorealistic-style-clouds-storm.jpg",
    "papaya anthracnose": "/images/1771926453583green-seedling-growing-soil-dark-background-seedling-ground.jpg",
    "papaya powdery mildew": "/images/1771924899240biotechnology-woman-engineer-examining-plant-leaf-disease.jpg",
    "papaya black spot": "/images/1771924002161agriculture-healthy-food.jpg",
    "papaya ring spot virus": "/images/1771924715405WhatsApp Image 2026-02-24 at 2.46.39 PM.jpeg",
    "papaya foot rot": "/images/1771922791181thunderstorm-countryside.jpg",
    "rice sheath blight": "/images/1771606259123large-green-rice-field-with-green-rice-plants-rows.jpg",
    "rice blast disease": "/images/1771914236609large-green-rice-field-with-green-rice-plants-rows.jpg",
    "bacterial leaf blight": "/images/1771614663990large-green-rice-field-with-green-rice-plants-rows.jpg",
    "brown spot of rice": "/images/1771653995980large-green-rice-field-with-green-rice-plants-rows.jpg",
    "rice tungro": "/images/1771654614110large-green-rice-field-with-green-rice-plants-rows.jpg",
};

const CROP_IMAGE_MAP = {
    tomato: "/images/1771924899240biotechnology-woman-engineer-examining-plant-leaf-disease.jpg",
    papaya: "/images/1771926326516close-up-picture-hand-holding-planting-sapling-plant.jpg",
    rice: "/images/1771606256159large-green-rice-field-with-green-rice-plants-rows.jpg",
};

function normalizeKey(value) {
    return String(value || "").trim().toLowerCase();
}

function resolveImagePath(imageUrl) {
    if (!imageUrl) {
        return null;
    }

    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
        return imageUrl;
    }

    if (imageUrl.startsWith("/")) {
        return `${IMAGE_BASE_URL}${imageUrl}`;
    }

    return `${IMAGE_BASE_URL}/images/${imageUrl}`;
}

function isGenericImage(imageUrl) {
    const normalized = normalizeKey(imageUrl);

    return GENERIC_IMAGE_KEYWORDS.some((keyword) => normalized.includes(keyword));
}

export function getKnowledgeImage(article) {
    const diseaseName = normalizeKey(article?.diseaseId?.diseaseName || article?.title);
    const cropName = normalizeKey(article?.diseaseId?.cropId?.name);
    const mappedDiseaseImage = DISEASE_IMAGE_MAP[diseaseName];
    const mappedCropImage = CROP_IMAGE_MAP[cropName];
    const articleImage = article?.imageUrl || "";

    if (mappedDiseaseImage) {
        return resolveImagePath(mappedDiseaseImage);
    }

    if (mappedCropImage) {
        return resolveImagePath(mappedCropImage);
    }

    if (articleImage && !isGenericImage(articleImage)) {
        return resolveImagePath(articleImage);
    }

    return null;
}
