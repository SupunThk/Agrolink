const CURATED_KNOWLEDGE_BASE = [
    {
        id: "banana-sigatoka",
        title: "Banana Sigatoka",
        cropName: "Banana",
        diseaseName: "Sigatoka",
        imageUrl: "/images/1771606259123large-green-rice-field-with-green-rice-plants-rows.jpg",
        description: "A common banana leaf disease that reduces green leaf area and weakens bunch filling when it spreads early.",
        symptoms: [
            "Small yellow streaks appear on older leaves before turning brown",
            "Leaf spots enlarge into long necrotic patches",
            "Severely affected plants lose healthy leaf area needed for fruit filling",
        ],
        preventionMethods: [
            "Remove badly infected leaves to lower disease pressure",
            "Maintain spacing and airflow through the plantation",
            "Monitor new leaves regularly during wet weather",
        ],
        treatmentPlan: "Use early field sanitation and recommended fungicide protection when spotting begins to move into the upper canopy.",
    },
    {
        id: "banana-panama-wilt",
        title: "Banana Panama Wilt",
        cropName: "Banana",
        diseaseName: "Panama Wilt",
        imageUrl: "/images/1771606256159large-green-rice-field-with-green-rice-plants-rows.jpg",
        description: "A soil-borne wilt disease that blocks water movement inside the plant and can kill entire banana mats.",
        symptoms: [
            "Older leaves yellow and collapse around the pseudostem",
            "Internal vascular tissue becomes brown when cut open",
            "Plants wilt progressively and fail to recover",
        ],
        preventionMethods: [
            "Use clean and disease-free planting material",
            "Avoid moving contaminated soil or tools between fields",
            "Remove severely infected plants quickly",
        ],
        treatmentPlan: "Focus on sanitation, clean planting stock, and strict movement control because infected plants usually do not recover.",
    },
    {
        id: "brinjal-bacterial-wilt",
        title: "Brinjal Bacterial Wilt",
        cropName: "Brinjal",
        diseaseName: "Bacterial Wilt",
        imageUrl: "/images/1771922115971woman-with-vegetables-basket.jpg",
        description: "A fast-spreading bacterial disease that causes sudden wilting and serious plant loss in warm, wet soils.",
        symptoms: [
            "Plants wilt suddenly while leaves may stay green at first",
            "Cut stems may ooze cloudy bacterial slime",
            "Whole plants collapse quickly in infected patches",
        ],
        preventionMethods: [
            "Use healthy seedlings from clean nurseries",
            "Improve drainage in beds and low-lying fields",
            "Remove infected plants with surrounding soil",
        ],
        treatmentPlan: "Reduce spread through sanitation, drainage improvement, and crop rotation because direct curative control is limited.",
    },
    {
        id: "brinjal-phomopsis-blight",
        title: "Brinjal Phomopsis Blight",
        cropName: "Brinjal",
        diseaseName: "Phomopsis Blight",
        imageUrl: "/images/1771924899240biotechnology-woman-engineer-examining-plant-leaf-disease.jpg",
        description: "A fungal disease that affects leaves, stems, and fruits, leading to rot and poor market quality in brinjal.",
        symptoms: [
            "Leaves develop gray-brown spots with ring patterns",
            "Stem lesions weaken shoots and flower branches",
            "Fruits show sunken pale brown rot patches",
        ],
        preventionMethods: [
            "Start with healthy seed and clean seedlings",
            "Prune and destroy infected plant parts early",
            "Avoid prolonged leaf wetness during humid periods",
        ],
        treatmentPlan: "Combine clean planting material, regular field sanitation, and timely fungicide support before fruit infection becomes severe.",
    },
    {
        id: "chilli-leaf-curl-virus",
        title: "Chilli Leaf Curl Virus",
        cropName: "Chilli",
        diseaseName: "Leaf Curl Virus",
        imageUrl: "/images/1771923045805female-gardener-spraying-insecticide-plant.jpg",
        description: "A viral disease spread by whiteflies that stunts chilli plants and sharply reduces flowering and fruit set.",
        symptoms: [
            "Young leaves curl upward and become smaller",
            "Plants become stunted with poor branching",
            "Flowering and fruit setting decline rapidly",
        ],
        preventionMethods: [
            "Control whiteflies early in the crop cycle",
            "Remove infected plants as soon as they appear",
            "Keep weeds and alternate hosts under control",
        ],
        treatmentPlan: "There is no cure after infection, so focus on vector management, roguing infected plants, and keeping the field clean.",
    },
    {
        id: "chilli-anthracnose",
        title: "Chilli Anthracnose",
        cropName: "Chilli",
        diseaseName: "Anthracnose",
        imageUrl: "/images/1772114336874agriculture-healthy-food.jpg",
        description: "A fruit rot disease that creates sunken lesions on chilli pods and lowers both yield quality and market value.",
        symptoms: [
            "Sunken dark lesions develop on ripening fruits",
            "Orange or pink spore masses may appear in lesion centers",
            "Infected fruits rot quickly during wet weather",
        ],
        preventionMethods: [
            "Harvest regularly and remove infected fruits",
            "Keep the field clean during the fruiting stage",
            "Protect the crop before long wet periods",
        ],
        treatmentPlan: "Use fruit sanitation and preventive fungicide schedules during humid fruiting periods to limit rapid lesion expansion.",
    },
    {
        id: "rice-blast-disease",
        title: "Rice Blast Disease",
        cropName: "Rice",
        diseaseName: "Blast Disease",
        imageUrl: "/images/1771914236609large-green-rice-field-with-green-rice-plants-rows.jpg",
        description: "A major fungal disease of rice that attacks leaves and panicles and can cause heavy yield loss in humid weather.",
        symptoms: [
            "Diamond-shaped lesions form on leaves with gray centers",
            "Neck infection causes empty or poorly filled grains",
            "Young plants lose vigor during severe outbreaks",
        ],
        preventionMethods: [
            "Use resistant varieties whenever possible",
            "Avoid excessive nitrogen fertilizer",
            "Scout fields often during cloudy and humid periods",
        ],
        treatmentPlan: "Protect high-risk fields early with balanced nutrition and recommended fungicide use before the disease reaches the panicle stage.",
    },
    {
        id: "rice-bacterial-leaf-blight",
        title: "Rice Bacterial Leaf Blight",
        cropName: "Rice",
        diseaseName: "Bacterial Leaf Blight",
        imageUrl: "/images/1771606256159large-green-rice-field-with-green-rice-plants-rows.jpg",
        description: "A bacterial disease that starts at leaf tips and margins, then dries the leaf blade and weakens crop performance.",
        symptoms: [
            "Leaf tips yellow and dry downward from the edges",
            "Lesions look water-soaked before turning pale brown",
            "Severe cases reduce tiller vigor and grain filling",
        ],
        preventionMethods: [
            "Use clean seed and resistant varieties if available",
            "Avoid unnecessary injury to plants in the field",
            "Maintain balanced fertilizer management",
        ],
        treatmentPlan: "Management is mainly preventive through clean planting material, resistant cultivars, and reduced field spread because curative control is limited.",
    },
    {
        id: "tomato-early-blight",
        title: "Tomato Early Blight",
        cropName: "Tomato",
        diseaseName: "Early Blight",
        imageUrl: "/images/1771924899240biotechnology-woman-engineer-examining-plant-leaf-disease.jpg",
        description: "A common tomato disease that starts on older leaves and can move upward quickly during warm, wet conditions.",
        symptoms: [
            "Brown target-like lesions appear on lower leaves",
            "Yellowing develops around affected spots",
            "Severe infection leads to defoliation and weaker fruits",
        ],
        preventionMethods: [
            "Remove infected lower leaves early",
            "Use mulch to reduce soil splash onto foliage",
            "Rotate away from tomato and related crops",
        ],
        treatmentPlan: "Limit spread with lower-canopy sanitation, splash reduction, and timely fungicide protection when wet weather persists.",
    },
    {
        id: "tomato-bacterial-spot",
        title: "Tomato Bacterial Spot",
        cropName: "Tomato",
        diseaseName: "Bacterial Spot",
        imageUrl: "/images/1771923045805female-gardener-spraying-insecticide-plant.jpg",
        description: "A bacterial disease that marks leaves and fruits, reducing both foliage health and fruit quality in tomato fields.",
        symptoms: [
            "Small dark leaf spots appear and may tear open later",
            "Fruits develop rough scabby lesions",
            "Severe infection causes leaf drop after rain",
        ],
        preventionMethods: [
            "Use disease-free seed and transplants",
            "Avoid handling wet plants",
            "Disinfect trays, tools, and nursery materials",
        ],
        treatmentPlan: "Prevent introduction and splash spread with clean planting material, sanitation, and protective programs during wet periods.",
    },
    {
        id: "coconut-bud-rot",
        title: "Coconut Bud Rot",
        cropName: "Coconut",
        diseaseName: "Bud Rot",
        imageUrl: "/images/1771926326516close-up-picture-hand-holding-planting-sapling-plant.jpg",
        description: "A serious crown disease that attacks the central growing point of coconut palms and can kill young palms quickly.",
        symptoms: [
            "Young spear leaves rot and pull out easily",
            "The crown develops soft tissues with a foul smell",
            "Palm growth stops as the bud is damaged",
        ],
        preventionMethods: [
            "Inspect palms regularly after heavy rains",
            "Improve drainage around young palms",
            "Remove badly infected tissue quickly",
        ],
        treatmentPlan: "Early detection is critical; protect the crown and apply recommended treatment before the rot reaches the central growing point.",
    },
    {
        id: "coconut-leaf-blight",
        title: "Coconut Leaf Blight",
        cropName: "Coconut",
        diseaseName: "Leaf Blight",
        imageUrl: "/images/1771924002161agriculture-healthy-food.jpg",
        description: "A leaf disease that creates blighted patches on coconut fronds and gradually reduces the green canopy.",
        symptoms: [
            "Leaflets develop elongated brown necrotic lesions",
            "Blighted areas expand and dry out over time",
            "Severe attack reduces palm vigor and canopy health",
        ],
        preventionMethods: [
            "Remove heavily affected fronds when practical",
            "Maintain palm nutrition to support recovery",
            "Monitor humid periods for early spread",
        ],
        treatmentPlan: "Use canopy sanitation, healthy palm maintenance, and timely protection when blighting starts to spread across fronds.",
    },
];

function toKnowledgeArticle(entry) {
    return {
        _id: entry.id,
        title: entry.title,
        description: entry.description,
        imageUrl: entry.imageUrl,
        symptoms: entry.symptoms,
        preventionMethods: entry.preventionMethods,
        treatmentPlan: entry.treatmentPlan,
        diseaseId: {
            diseaseName: entry.diseaseName,
            cropId: {
                name: entry.cropName,
            },
        },
    };
}

function getCuratedKnowledgeArticles() {
    return CURATED_KNOWLEDGE_BASE.map(toKnowledgeArticle);
}

function getCuratedKnowledgeArticleById(id) {
    const entry = CURATED_KNOWLEDGE_BASE.find((item) => item.id === id);
    return entry ? toKnowledgeArticle(entry) : null;
}

function getCuratedCropNames() {
    return [...new Set(CURATED_KNOWLEDGE_BASE.map((item) => item.cropName))];
}

module.exports = {
    CURATED_KNOWLEDGE_BASE,
    getCuratedKnowledgeArticles,
    getCuratedKnowledgeArticleById,
    getCuratedCropNames,
};
