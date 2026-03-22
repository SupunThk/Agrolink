const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const Crop = require("./models/Crop");
const Disease = require("./models/Disease");
const Article = require("./models/Article");

dotenv.config({ path: path.join(__dirname, ".env") });

function article(title, imageUrl, symptoms, preventionMethods, treatmentPlan) {
    return { title, imageUrl, symptoms, preventionMethods, treatmentPlan };
}

const IMAGE = {
    papaya1: "/images/1771926453583green-seedling-growing-soil-dark-background-seedling-ground.jpg",
    papaya2: "/images/1771926326516close-up-picture-hand-holding-planting-sapling-plant.jpg",
    papaya3: "/images/1771924002161agriculture-healthy-food.jpg",
    tomato1: "/images/1771924899240biotechnology-woman-engineer-examining-plant-leaf-disease.jpg",
    tomato2: "/images/1771923045805female-gardener-spraying-insecticide-plant.jpg",
    tomato3: "/images/1771922115971woman-with-vegetables-basket.jpg",
    rice1: "/images/1771606256159large-green-rice-field-with-green-rice-plants-rows.jpg",
    rice2: "/images/1771606259123large-green-rice-field-with-green-rice-plants-rows.jpg",
    rice3: "/images/1771914236609large-green-rice-field-with-green-rice-plants-rows.jpg",
};

const EXTRA_KNOWLEDGE_DATA = [
    {
        cropName: "Papaya",
        diseases: [
            {
                diseaseName: "Papaya Anthracnose",
                aiModelLabel: "papaya-anthracnose",
                articles: [
                    article(
                        "Papaya Anthracnose Management",
                        IMAGE.papaya1,
                        ["Small dark fruit spots expand rapidly", "Sunken lesions appear on ripening fruits", "Post-harvest decay becomes severe in storage"],
                        ["Harvest carefully to avoid wounds", "Remove infected fruits and debris", "Improve orchard airflow with pruning"],
                        "Manage papaya anthracnose with sanitation, careful handling, and timely protective fungicide use during wet periods."
                    ),
                    article(
                        "Preventing Papaya Anthracnose in Humid Weather",
                        IMAGE.papaya2,
                        ["Dark lesions increase after rainy spells", "Fruit rots faster under humid storage", "Spore masses may appear on mature lesions"],
                        ["Reduce fruit wetness where possible", "Sanitize storage and packing areas", "Spray before extended wet weather"],
                        "Focus on moisture reduction, preventive protection, and orchard hygiene before fruit infections spread widely."
                    ),
                ],
            },
            {
                diseaseName: "Papaya Powdery Mildew",
                aiModelLabel: "papaya-powdery-mildew",
                articles: [
                    article(
                        "Papaya Powdery Mildew Field Identification",
                        IMAGE.papaya2,
                        ["White powdery growth forms on leaves", "Young foliage curls and yellows", "Plant vigor drops as infection expands"],
                        ["Improve sunlight and airflow", "Avoid overcrowded canopies", "Inspect new growth frequently"],
                        "Control papaya powdery mildew through better airflow, removal of infected leaves, and recommended fungicide support."
                    ),
                    article(
                        "Managing Papaya Powdery Mildew on Young Plants",
                        IMAGE.papaya3,
                        ["Dusty white patches cover tender leaves", "Shoots weaken under severe infection", "Growth slows because foliage is damaged"],
                        ["Space nursery plants well", "Remove infected shoots early", "Protect young plants during high-risk periods"],
                        "Early action on young plants prevents severe canopy damage and reduces spore build-up across the planting."
                    ),
                ],
            },
            {
                diseaseName: "Papaya Black Spot",
                aiModelLabel: "papaya-black-spot",
                articles: [
                    article(
                        "Papaya Black Spot Symptoms and Spread",
                        IMAGE.papaya3,
                        ["Small black spots develop on leaves", "Fruit skin quality drops quickly", "Leaves may yellow and fall early"],
                        ["Remove infected leaves regularly", "Avoid late overhead irrigation", "Keep plants healthy with balanced nutrition"],
                        "Papaya black spot is reduced by sanitation, moisture control, and preventive spraying during favorable disease weather."
                    ),
                    article(
                        "Reducing Fruit Damage from Papaya Black Spot",
                        IMAGE.papaya1,
                        ["Fruit lesions become more visible while ripening", "Defoliation follows repeated infection", "Market value declines due to blemishes"],
                        ["Scout early before fruit damage becomes severe", "Dispose of infected debris away from the field", "Protect crops during wet periods"],
                        "Reduce fruit damage by combining early scouting, residue removal, and timely preventive disease management."
                    ),
                ],
            },
            {
                diseaseName: "Papaya Ring Spot Virus",
                aiModelLabel: "papaya-ringspot",
                articles: [
                    article(
                        "Papaya Ringspot Virus Early Warning Signs",
                        IMAGE.papaya2,
                        ["Mosaic and distortion appear on young leaves", "Fruit develops ring-shaped markings", "Plants become stunted and weak"],
                        ["Control aphids early", "Remove infected plants quickly", "Use clean planting material"],
                        "Because the virus cannot be cured, management depends on vector control and early removal of infected plants."
                    ),
                    article(
                        "Papaya Ringspot Virus Management in Mixed Farms",
                        IMAGE.papaya3,
                        ["Leaf mosaic becomes patchy across the field", "Fruit quality drops after infection", "Yield declines when infection starts early"],
                        ["Manage weed hosts near the crop", "Inspect mixed farms often", "Use spacing or barrier strategies where possible"],
                        "Integrated management in mixed farms focuses on reducing vector movement and preventing spread to healthy papaya blocks."
                    ),
                ],
            },
            {
                diseaseName: "Papaya Foot Rot",
                aiModelLabel: "papaya-foot-rot",
                articles: [
                    article(
                        "Papaya Foot Rot Around the Collar Region",
                        IMAGE.papaya1,
                        ["Water-soaked lesions appear near the stem base", "Stem bark softens and rots", "Plants wilt and collapse under severe attack"],
                        ["Plant in well-drained sites", "Keep water away from the collar region", "Remove severely affected plants promptly"],
                        "Papaya foot rot control depends on drainage improvement, collar protection, and quick response when symptoms begin."
                    ),
                    article(
                        "Drainage-Based Management for Papaya Foot Rot",
                        IMAGE.papaya2,
                        ["Lower stem tissues darken after heavy rain", "Older leaves droop and yellow", "Roots and collar deteriorate in wet soils"],
                        ["Use raised beds in wet fields", "Avoid stem injuries during field work", "Maintain drainage channels carefully"],
                        "Reducing waterlogging is the most important step, supported by sanitation and careful collar-zone protection."
                    ),
                ],
            },
        ],
    },
    {
        cropName: "Rice",
        diseases: [
            {
                diseaseName: "Rice Sheath Blight",
                aiModelLabel: "rice-sheath-blight",
                articles: [
                    article(
                        "Rice Sheath Blight Control Guide",
                        IMAGE.rice2,
                        ["Oval lesions form on lower sheaths", "Lesions enlarge in warm humidity", "Severe infection weakens grain filling"],
                        ["Avoid excess nitrogen", "Manage plant spacing and water", "Scout fields during humid weather"],
                        "Rice sheath blight is reduced by balanced nutrition, canopy management, and timely fungicide use when pressure is high."
                    ),
                    article(
                        "Managing Rice Sheath Blight in Dense Canopies",
                        IMAGE.rice3,
                        ["Lesions spread upward through thick canopies", "Humidity remains trapped in dense stands", "Tillers weaken as disease advances"],
                        ["Split nitrogen applications carefully", "Reduce canopy humidity", "Monitor lower sheaths early"],
                        "Dense crops need better canopy control and early protection before lesions move into the upper productive canopy."
                    ),
                ],
            },
            {
                diseaseName: "Rice Blast Disease",
                aiModelLabel: "rice-blast",
                articles: [
                    article(
                        "Rice Blast Disease at Leaf Stage",
                        IMAGE.rice1,
                        ["Diamond-shaped leaf lesions appear first", "Centers turn gray with dark borders", "Young plants lose vigor quickly"],
                        ["Use resistant varieties", "Avoid heavy nitrogen use", "Scout often in humid cloudy weather"],
                        "Leaf blast is managed through resistance, balanced fertility, and early fungicide support when disease risk rises."
                    ),
                    article(
                        "Neck Blast Prevention in Rice",
                        IMAGE.rice3,
                        ["Panicle necks darken near heading", "Grains remain empty or poorly filled", "Entire panicles may dry early"],
                        ["Protect crops near booting and heading", "Avoid excess late nitrogen", "Track high-humidity weather conditions"],
                        "Neck blast prevention is critical at reproductive stages when poorly timed infection can cause heavy yield loss."
                    ),
                ],
            },
            {
                diseaseName: "Bacterial Leaf Blight",
                aiModelLabel: "rice-bacterial-leaf-blight",
                articles: [
                    article(
                        "Bacterial Leaf Blight in Young Rice Fields",
                        IMAGE.rice1,
                        ["Leaf tips yellow and lesions spread downward", "Margins appear water-soaked before drying", "Young plants may wilt during severe outbreaks"],
                        ["Use clean seed", "Avoid unnecessary plant injury", "Maintain balanced nutrition"],
                        "Management focuses on clean planting material, resistant varieties, and limiting spread because curative options are limited."
                    ),
                    article(
                        "Reducing Yield Loss from Rice Bacterial Leaf Blight",
                        IMAGE.rice2,
                        ["Long streaks expand from the leaf edge", "Leaves dry from the tip downward", "Tillers perform poorly under severe pressure"],
                        ["Limit injury from machinery", "Avoid excessive nitrogen", "Manage irrigation and volunteer rice carefully"],
                        "Yield loss is reduced through preventive hygiene, balanced crop management, and resistant material where available."
                    ),
                ],
            },
            {
                diseaseName: "Brown Spot of Rice",
                aiModelLabel: "rice-brown-spot",
                articles: [
                    article(
                        "Rice Brown Spot Recognition Guide",
                        IMAGE.rice2,
                        ["Small brown lesions form on older leaves", "Spots may show gray centers", "Weak plants suffer poor grain filling"],
                        ["Correct nutrient deficiencies", "Use healthy seed", "Maintain proper water and field hygiene"],
                        "Brown spot control depends on better nutrition, good seed health, and supportive disease protection when needed."
                    ),
                    article(
                        "Managing Rice Brown Spot Under Nutrient Stress",
                        IMAGE.rice3,
                        ["Leaf spotting worsens in poor soils", "Stressed plants lose vigor quickly", "Grain quality drops when disease continues late"],
                        ["Improve soil fertility", "Avoid prolonged crop stress", "Combine seed treatment with scouting"],
                        "Fields under nutrient stress need fertility correction alongside disease monitoring to reduce continued brown spot development."
                    ),
                ],
            },
            {
                diseaseName: "Rice Tungro",
                aiModelLabel: "rice-tungro",
                articles: [
                    article(
                        "Rice Tungro Virus Symptoms in the Field",
                        IMAGE.rice1,
                        ["Plants show yellow-orange discoloration", "Tillering is reduced noticeably", "Panicle emergence and filling are affected"],
                        ["Control green leafhoppers early", "Synchronize planting dates", "Remove volunteer rice plants"],
                        "Rice tungro management relies on vector control, synchronized planting, and sanitation because the virus cannot be cured directly."
                    ),
                    article(
                        "Integrated Management of Rice Tungro",
                        IMAGE.rice2,
                        ["Patchy yellowing spreads with vector movement", "Plants remain shorter than healthy neighbors", "Early infection causes severe yield loss"],
                        ["Use tolerant varieties", "Monitor vector populations", "Coordinate management across nearby fields"],
                        "Integrated tungro management combines tolerant varieties, vector monitoring, and field-wide sanitation to reduce spread."
                    ),
                ],
            },
        ],
    },
    {
        cropName: "Tomato",
        diseases: [
            {
                diseaseName: "Tomato Early Blight",
                aiModelLabel: "tomato-early-blight",
                articles: [
                    article(
                        "Tomato Early Blight on Lower Leaves",
                        IMAGE.tomato1,
                        ["Brown target-like lesions form on older leaves", "Yellowing surrounds the lesions", "Disease moves upward in wet weather"],
                        ["Mulch soil to reduce splash", "Rotate with non-host crops", "Remove infected lower leaves early"],
                        "Early blight is managed through rotation, lower-canopy sanitation, and preventive fungicide protection."
                    ),
                    article(
                        "Tomato Early Blight Fruit Protection",
                        IMAGE.tomato2,
                        ["Dark lesions appear near the fruit stem end", "Leaf infection increases fruit risk", "Defoliation exposes fruits to stress"],
                        ["Stake plants to reduce soil contact", "Protect the lower canopy early", "Use preventive sprays in rainy periods"],
                        "Fruit protection depends on keeping foliage healthy and limiting splash dispersal before infection reaches harvestable clusters."
                    ),
                ],
            },
            {
                diseaseName: "Tomato Leaf Mold",
                aiModelLabel: "tomato-leaf-mold",
                articles: [
                    article(
                        "Tomato Leaf Mold in Protected Cultivation",
                        IMAGE.tomato2,
                        ["Yellow patches appear on the upper leaf surface", "Olive fungal growth forms underneath", "Leaves dry and drop in prolonged humidity"],
                        ["Ventilate tunnels and houses well", "Avoid wet foliage", "Remove infected leaves early"],
                        "Leaf mold control in protected cultivation depends on humidity reduction, sanitation, and early fungicide support."
                    ),
                    article(
                        "Managing Tomato Leaf Mold in Dense Plantings",
                        IMAGE.tomato3,
                        ["Yellowing starts in crowded humid sections", "Undersides show olive growth", "Dense canopies accelerate spread"],
                        ["Prune excess foliage", "Widen spacing where needed", "Monitor humid sections first"],
                        "Dense plantings require stronger airflow management and early protection to stop leaf mold from dominating the canopy."
                    ),
                ],
            },
            {
                diseaseName: "Tomato Bacterial Spot",
                aiModelLabel: "tomato-bacterial-spot",
                articles: [
                    article(
                        "Tomato Bacterial Spot on Leaves and Fruits",
                        IMAGE.tomato3,
                        ["Small water-soaked spots appear on leaves", "Fruit develops raised scabby lesions", "Severe infection causes leaf drop"],
                        ["Use disease-free seed and transplants", "Avoid handling wet plants", "Disinfect nursery tools and trays"],
                        "Bacterial spot is managed by preventing introduction, limiting wet spread, and using recommended protective programs."
                    ),
                    article(
                        "Reducing Tomato Bacterial Spot After Rainfall",
                        IMAGE.tomato1,
                        ["Leaf spots increase rapidly after storms", "Lesions merge and tear foliage", "Fruit quality declines as scabs spread"],
                        ["Avoid overhead irrigation", "Scout immediately after storms", "Keep field and nursery sanitation strong"],
                        "After rainfall, management focuses on reducing splash spread and protecting fresh foliage before new infections build quickly."
                    ),
                ],
            },
            {
                diseaseName: "Tomato Septoria Leaf Spot",
                aiModelLabel: "tomato-septoria-leaf-spot",
                articles: [
                    article(
                        "Tomato Septoria Leaf Spot Detection",
                        IMAGE.tomato1,
                        ["Small circular spots form on lower leaves", "Black fungal dots may appear in lesion centers", "Defoliation progresses upward in wet weather"],
                        ["Remove infected lower leaves", "Use mulch to reduce splash", "Rotate after harvest"],
                        "Septoria is handled through sanitation, splash reduction, and protective fungicide use when spotting begins to move upward."
                    ),
                    article(
                        "Keeping Tomato Septoria Out of the Upper Canopy",
                        IMAGE.tomato2,
                        ["Spotting begins near the soil surface", "Upper canopy stays healthy only with early control", "Defoliation weakens fruiting plants"],
                        ["Prune lower canopy", "Stake plants off the soil", "Continue protection during rainy periods"],
                        "Prevent upward spread by controlling lower-canopy infection early and limiting splash movement into productive foliage."
                    ),
                ],
            },
            {
                diseaseName: "Tomato Fusarium Wilt",
                aiModelLabel: "tomato-fusarium-wilt",
                articles: [
                    article(
                        "Tomato Fusarium Wilt Plant Decline",
                        IMAGE.tomato3,
                        ["Lower leaves yellow first", "Stem vascular tissue browns internally", "Plants wilt and weaken in hot conditions"],
                        ["Use resistant varieties", "Avoid continuous tomato cropping", "Improve soil health and drainage"],
                        "Fusarium wilt management relies on resistant genetics, crop rotation, and soil health because recovery is difficult after infection progresses."
                    ),
                    article(
                        "Field Strategies for Tomato Fusarium Wilt",
                        IMAGE.tomato1,
                        ["Plants wilt progressively during midday heat", "Yellowing advances from older leaves", "Entire plants may collapse later in the season"],
                        ["Map problem field zones", "Reduce root stress with good drainage", "Avoid moving infested soil between blocks"],
                        "Field strategies combine resistant varieties, drainage improvement, and strong hygiene to reduce long-term Fusarium wilt losses."
                    ),
                ],
            },
        ],
    },
    {
        cropName: "Coconut",
        diseases: [
            {
                diseaseName: "Coconut Bud Rot",
                aiModelLabel: "coconut-bud-rot",
                articles: [
                    article(
                        "Coconut Bud Rot Early Management",
                        IMAGE.papaya1,
                        ["Young spear leaves rot and pull out easily", "Crown tissues become soft with a foul smell", "Palm growth stops as the growing point is damaged"],
                        ["Inspect palms after prolonged wet weather", "Improve drainage around young palms", "Remove and destroy badly infected tissues promptly"],
                        "Coconut bud rot management depends on early crown inspection, sanitation, and recommended protective treatments before the rot reaches the central growing point."
                    ),
                    article(
                        "Protecting Young Coconut Palms from Bud Rot",
                        IMAGE.papaya2,
                        ["Central spindle yellows before collapsing", "Rot spreads downward into unopened leaves", "Seedlings and young palms weaken rapidly in wet conditions"],
                        ["Avoid water stagnation around the palm base", "Keep the crown area clean and monitored", "Apply recommended fungicidal protection after heavy rains"],
                        "Young coconut palms need close monitoring during rainy periods so bud rot can be stopped before the crown is permanently damaged."
                    ),
                ],
            },
            {
                diseaseName: "Coconut Leaf Blight",
                aiModelLabel: "coconut-leaf-blight",
                articles: [
                    article(
                        "Coconut Leaf Blight Field Symptoms",
                        IMAGE.papaya3,
                        ["Leaflets develop elongated brown necrotic lesions", "Blighted leaf areas dry out and reduce green canopy cover", "Severe infection lowers palm vigor over time"],
                        ["Remove badly affected fronds when practical", "Maintain palm nutrition to support recovery", "Monitor disease spread during humid weather"],
                        "Leaf blight in coconut is reduced through canopy sanitation, improved palm health, and timely protection when blighting becomes severe."
                    ),
                ],
            },
        ],
    },
    {
        cropName: "Mango",
        diseases: [
            {
                diseaseName: "Mango Anthracnose",
                aiModelLabel: "mango-anthracnose",
                articles: [
                    article(
                        "Mango Anthracnose on Flowers and Fruits",
                        IMAGE.tomato3,
                        ["Flowers develop black lesions and dry prematurely", "Young fruits show dark sunken spots", "Fruit rot increases during ripening and storage"],
                        ["Prune trees to improve light and airflow", "Remove infected twigs and mummified fruits", "Spray preventively before and during flowering"],
                        "Mango anthracnose is best managed with good canopy ventilation, sanitation, and timely fungicide protection around flowering and fruit set."
                    ),
                    article(
                        "Reducing Post-Harvest Loss from Mango Anthracnose",
                        IMAGE.tomato2,
                        ["Lesions remain small in the field but expand after harvest", "Fruit surface darkens and decays during storage", "High humidity accelerates post-harvest rot"],
                        ["Harvest carefully to avoid fruit injury", "Keep packing areas clean and dry", "Use appropriate pre-harvest disease protection"],
                        "Post-harvest losses are reduced by combining orchard disease control with careful harvest handling and clean storage conditions."
                    ),
                ],
            },
            {
                diseaseName: "Mango Powdery Mildew",
                aiModelLabel: "mango-powdery-mildew",
                articles: [
                    article(
                        "Mango Powdery Mildew During Flowering",
                        IMAGE.tomato1,
                        ["White powdery growth appears on flowers and tender flushes", "Inflorescences dry and fail to set fruits", "Young fruit may drop after infection"],
                        ["Monitor flowering panicles closely in dry humid weather", "Prune dense canopies after harvest", "Apply recommended protection at flowering"],
                        "Mango powdery mildew requires close attention during flowering because untreated infections can sharply reduce fruit set."
                    ),
                ],
            },
        ],
    },
    {
        cropName: "Banana",
        diseases: [
            {
                diseaseName: "Banana Sigatoka",
                aiModelLabel: "banana-sigatoka",
                articles: [
                    article(
                        "Banana Sigatoka Leaf Spot Recognition",
                        IMAGE.rice1,
                        ["Small streaks on leaves expand into brown lesions", "Leaf area dries out and photosynthesis declines", "Fruit filling suffers when too many leaves are damaged"],
                        ["Remove heavily infected leaves carefully", "Maintain spacing for airflow", "Apply recommended fungicide schedules where needed"],
                        "Banana Sigatoka management depends on leaf sanitation, canopy ventilation, and regular protection when disease pressure remains high."
                    ),
                    article(
                        "Managing Banana Sigatoka in Wet Conditions",
                        IMAGE.rice2,
                        ["Lesions spread quickly after extended wet weather", "Upper leaves become heavily spotted and weak", "Plants lose productive leaf area before bunch filling completes"],
                        ["Improve drainage and reduce unnecessary humidity", "Monitor new leaves regularly", "Start control measures before upper leaves are affected"],
                        "Wet periods require stronger monitoring and early intervention to protect the functional leaf area needed for bunch development."
                    ),
                ],
            },
            {
                diseaseName: "Banana Panama Wilt",
                aiModelLabel: "banana-panama-wilt",
                articles: [
                    article(
                        "Banana Panama Wilt Field Decline",
                        IMAGE.rice3,
                        ["Older leaves yellow and collapse around the pseudostem", "Vascular tissues show brown discoloration internally", "Plants wilt and die progressively from soilborne infection"],
                        ["Use clean planting material", "Avoid moving infested soil between fields", "Destroy severely infected mats to limit spread"],
                        "Panama wilt management relies on sanitation, clean planting material, and strong movement control because soilborne spread is difficult to reverse."
                    ),
                ],
            },
        ],
    },
    {
        cropName: "Chilli",
        diseases: [
            {
                diseaseName: "Chilli Leaf Curl Virus",
                aiModelLabel: "chilli-leaf-curl-virus",
                articles: [
                    article(
                        "Chilli Leaf Curl Virus Early Symptoms",
                        IMAGE.tomato1,
                        ["Leaves curl upward and become smaller than normal", "Plants show strong stunting and poor branching", "Flowering and fruit setting decline sharply"],
                        ["Control whiteflies early in the crop", "Remove infected plants as soon as they appear", "Keep the field free of alternate weed hosts"],
                        "Leaf curl virus management focuses on controlling whitefly vectors, removing infected plants, and reducing sources of virus carryover."
                    ),
                    article(
                        "Reducing Whitefly Spread in Chilli Fields",
                        IMAGE.tomato2,
                        ["New plants become distorted after vector activity increases", "Patchy stunting appears across the field", "Fruit production falls as infection spreads"],
                        ["Use reflective or barrier strategies where practical", "Inspect crop borders often for early vector movement", "Coordinate vector control with nearby fields if needed"],
                        "Vector suppression at field edges and early-stage monitoring help slow the spread of chilli leaf curl virus."
                    ),
                ],
            },
            {
                diseaseName: "Chilli Anthracnose",
                aiModelLabel: "chilli-anthracnose",
                articles: [
                    article(
                        "Chilli Anthracnose on Ripening Fruits",
                        IMAGE.tomato3,
                        ["Sunken dark lesions form on mature chilli fruits", "Orange or pink spore masses may appear at lesion centers", "Fruit quality and market value drop rapidly"],
                        ["Harvest fruits regularly before over-ripening", "Remove infected fruits from the field", "Protect the crop during wet fruiting periods"],
                        "Anthracnose management in chilli depends on fruit sanitation, timely harvest, and preventive protection before lesions expand widely."
                    ),
                ],
            },
        ],
    },
    {
        cropName: "Brinjal",
        diseases: [
            {
                diseaseName: "Brinjal Bacterial Wilt",
                aiModelLabel: "brinjal-bacterial-wilt",
                articles: [
                    article(
                        "Brinjal Bacterial Wilt Sudden Wilting",
                        IMAGE.tomato3,
                        ["Plants wilt suddenly while leaves remain green at first", "Cut stems may ooze bacterial slime", "Root and stem vascular tissues become infected rapidly"],
                        ["Use disease-free seedlings", "Avoid infested low-lying fields", "Remove infected plants with surrounding soil carefully"],
                        "Brinjal bacterial wilt is managed through clean planting material, field sanitation, and avoiding contaminated soils and irrigation water."
                    ),
                    article(
                        "Managing Bacterial Wilt in Brinjal Beds",
                        IMAGE.tomato2,
                        ["Patchy plant collapse appears in warm wet soils", "Wilting worsens quickly during hot daytime conditions", "New plantings fail when the soil is heavily contaminated"],
                        ["Improve drainage in planting beds", "Rotate with non-host crops", "Disinfect tools used around infected plants"],
                        "Management centers on reducing soil contamination, improving drainage, and preventing movement of the wilt pathogen within the field."
                    ),
                ],
            },
            {
                diseaseName: "Brinjal Phomopsis Blight",
                aiModelLabel: "brinjal-phomopsis-blight",
                articles: [
                    article(
                        "Brinjal Phomopsis Blight on Fruits and Stems",
                        IMAGE.tomato1,
                        ["Leaves develop gray-brown spots with concentric zones", "Stem lesions weaken branches and flowers", "Fruits rot with sunken pale brown patches"],
                        ["Use healthy seed and seedlings", "Prune and destroy infected plant parts", "Protect fruits during humid disease periods"],
                        "Phomopsis blight control depends on clean planting material, field sanitation, and early protection before fruit infection becomes widespread."
                    ),
                ],
            },
        ],
    },
];

async function findCropByName(cropName) {
    return Crop.findOne({ name: cropName }).lean();
}

async function findOrCreateCrop(cropName) {
    const existingCrop = await Crop.findOne({ name: cropName });

    if (existingCrop) {
        return { crop: existingCrop, created: false };
    }

    const crop = await Crop.create({ name: cropName });
    return { crop, created: true };
}

async function findOrCreateDisease(diseaseEntry, cropId) {
    const existingDisease = await Disease.findOne({
        diseaseName: diseaseEntry.diseaseName,
        cropId,
    });

    if (existingDisease) {
        return { disease: existingDisease, created: false };
    }

    const disease = await Disease.create({
        diseaseName: diseaseEntry.diseaseName,
        aiModelLabel: diseaseEntry.aiModelLabel,
        cropId,
    });

    return { disease, created: true };
}

async function findOrCreateArticle(articleEntry, diseaseId) {
    const existingArticle = await Article.findOne({
        title: articleEntry.title,
        diseaseId,
    });

    if (existingArticle) {
        return { article: existingArticle, created: false };
    }

    const article = await Article.create({
        title: articleEntry.title,
        diseaseId,
        imageUrl: articleEntry.imageUrl,
        symptoms: articleEntry.symptoms,
        preventionMethods: articleEntry.preventionMethods,
        treatmentPlan: articleEntry.treatmentPlan,
        status: "approved",
    });

    return { article, created: true };
}

async function seedExtraKnowledge() {
    let cropsFound = 0;
    let cropsCreated = 0;
    let diseasesCreated = 0;
    let diseasesSkipped = 0;
    let articlesCreated = 0;
    let articlesSkipped = 0;

    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to MongoDB.");

        for (const cropEntry of EXTRA_KNOWLEDGE_DATA) {
            const existingCrop = await findCropByName(cropEntry.cropName);
            let crop = existingCrop;

            if (existingCrop) {
                cropsFound += 1;
            } else {
                const { crop: createdCrop } = await findOrCreateCrop(cropEntry.cropName);
                crop = createdCrop;
                cropsCreated += 1;
                console.log(`\nCreated crop: ${cropEntry.cropName}`);
            }

            console.log(`\nProcessing crop: ${cropEntry.cropName}`);

            for (const diseaseEntry of cropEntry.diseases) {
                const { disease, created: diseaseCreated } = await findOrCreateDisease(diseaseEntry, crop._id);

                if (diseaseCreated) {
                    diseasesCreated += 1;
                    console.log(`  Created disease: ${diseaseEntry.diseaseName}`);
                } else {
                    diseasesSkipped += 1;
                    console.log(`  Disease already exists: ${diseaseEntry.diseaseName}`);
                }

                for (const articleEntry of diseaseEntry.articles) {
                    const { created: articleCreated } = await findOrCreateArticle(articleEntry, disease._id);

                    if (articleCreated) {
                        articlesCreated += 1;
                        console.log(`    Created article: ${articleEntry.title}`);
                    } else {
                        articlesSkipped += 1;
                        console.log(`    Article already exists: ${articleEntry.title}`);
                    }
                }
            }
        }

        console.log("\nExtra knowledge seed complete.");
        console.log(`Crops found: ${cropsFound}`);
        console.log(`Crops created: ${cropsCreated}`);
        console.log(`Diseases created: ${diseasesCreated}`);
        console.log(`Diseases skipped: ${diseasesSkipped}`);
        console.log(`Articles created: ${articlesCreated}`);
        console.log(`Articles skipped: ${articlesSkipped}`);
        process.exit(0);
    } catch (error) {
        console.error("Extra knowledge seed failed:", error);
        process.exit(1);
    }
}

seedExtraKnowledge();
