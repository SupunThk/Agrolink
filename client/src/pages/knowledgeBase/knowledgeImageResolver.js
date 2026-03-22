function normalizeKey(value) {
    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

const DISEASE_IMAGE_MAP = {
    "banana-sigatoka": "/images/banana-black-sigatoka.jpg",
    "sigatoka": "/images/banana-black-sigatoka.jpg",
    "banana-panama-wilt": "/images/banana-panama-wilt.jpg",
    "panama-wilt": "/images/banana-panama-wilt.jpg",
    "brinjal-bacterial-wilt": "/images/bacterial-wilt-brinjal.png",
    "bacterial-wilt": "/images/bacterial-wilt-brinjal.png",
    "brinjal-phomopsis-blight": "/images/phomopsis-fruit-rot-brinjal.jpg",
    "phomopsis-blight": "/images/phomopsis-fruit-rot-brinjal.jpg",
    "chilli-leaf-curl-virus": "/images/Chilli-Leaf-Curl-Virus.jpeg",
    "leaf-curl-virus": "/images/Chilli-Leaf-Curl-Virus.jpeg",
    "chilli-anthracnose": "/images/Chilli-Anthracnose.jpg",
    "anthracnose": "/images/Chilli-Anthracnose.jpg",
    "rice-blast-disease": "/images/Rice-Blast-Disease.jpg",
    "blast-disease": "/images/Rice-Blast-Disease.jpg",
    "rice-bacterial-leaf-blight": "/images/Rice-Bacterial-Leaf-Blight.webp",
    "bacterial-leaf-blight": "/images/Rice-Bacterial-Leaf-Blight.webp",
    "tomato-early-blight": "/images/Tomato-Early-Blight.jpg",
    "early-blight": "/images/Tomato-Early-Blight.jpg",
    "tomato-bacterial-spot": "/images/Tomato-Bacterial-Spot.jpg",
    "bacterial-spot": "/images/Tomato-Bacterial-Spot.jpg",
    "coconut-bud-rot": "/images/Coconut-Bud-Rot.jpg",
    "bud-rot": "/images/Coconut-Bud-Rot.jpg",
    "coconut-leaf-blight": "/images/Coconut-Leaf-Blight.jpg",
    "leaf-blight": "/images/Coconut-Leaf-Blight.jpg",
};

const CROP_IMAGE_MAP = {
    banana: "/images/banana-black-sigatoka.jpg",
    brinjal: "/images/bacterial-wilt-brinjal.png",
    chilli: "/images/Chilli-Leaf-Curl-Virus.jpeg",
    rice: "/images/Rice.png",
    tomato: "/images/tomato.jpg",
    coconut: "/images/Coconut-Bud-Rot.jpg",
    papaya: "/images/papaya.jpg",
};

function getDiseaseImage(article) {
    const titleKey = normalizeKey(article?.title);
    const diseaseKey = normalizeKey(article?.diseaseId?.diseaseName);

    return DISEASE_IMAGE_MAP[titleKey] || DISEASE_IMAGE_MAP[diseaseKey] || null;
}

function getCropImage(article) {
    const cropKey = normalizeKey(article?.diseaseId?.cropId?.name);
    return CROP_IMAGE_MAP[cropKey] || null;
}

export function getKnowledgeImage(article) {
    return getDiseaseImage(article) || getCropImage(article) || null;
}
