const IMAGE_BASE_URL = "http://localhost:5000";

export function getKnowledgeImage(article) {
    const imageUrl = article?.imageUrl || article?.diseaseId?.image || "";

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
