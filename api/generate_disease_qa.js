const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Question = require("./models/Question");

dotenv.config();

// Define Crop Diseases in Sri Lanka
const diseasesData = [
    {
        crop: "Paddy",
        diseases: [
            {
                name: "Rice Blast",
                cause: "Fungus (Magnaporthe oryzae)",
                symptoms: "Diamond-shaped white to gray lesions with dark borders on leaves. Can also affect panicles causing \"neck blast\" where the panicle falls over.",
                prevention: "Plant resistant varieties, avoid excessive nitrogen fertilizer, and ensure proper field drainage.",
                treatment: "Apply targeted fungicides like Tricyclazole or Isoprothiolane at the early stages of disease development."
            },
            {
                name: "Brown Spot",
                cause: "Fungus (Bipolaris oryzae)",
                symptoms: "Oval to circular brown spots with a yellow halo on leaves. Severe infections cause leaves to dry out.",
                prevention: "Maintain balanced soil fertility, especially ensuring adequate potassium and silicon.",
                treatment: "Use certified disease-free seeds and apply fungicides containing Propiconazole if the infection is severe."
            },
            {
                name: "Bacterial Leaf Blight",
                cause: "Bacteria (Xanthomonas oryzae)",
                symptoms: "Water-soaked lesions on leaf margins that turn yellow to white as the disease progresses.",
                prevention: "Avoid clipping seedling tips during transplanting, maintain proper plant spacing, and limit nitrogen application.",
                treatment: "Chemical control is mostly ineffective; focus on prevention and planting resistant varieties like Bg 300."
            }
        ]
    },
    {
        crop: "Tea",
        diseases: [
            {
                name: "Blister Blight",
                cause: "Fungus (Exobasidium vexans)",
                symptoms: "Translucent spots on young leaves that develop into blister-like white or pinkish growths on the underside.",
                prevention: "Adjust pruning schedules to avoid monsoon peaks and maintain manageable shade canopy.",
                treatment: "Spray protective copper-based fungicides or systemic fungicides like Hexaconazole immediately after plucking."
            },
            {
                name: "Poria Root Disease",
                cause: "Fungus (Poria hypolateritia)",
                symptoms: "Gradual yellowing and wilting of bushes in patches. Roots show a thick white fungal mat.",
                prevention: "Thoroughly uproot and burn infected bushes, isolate the infected area by digging deep trenches.",
                treatment: "Fumigate the soil before replanting. There is no cure for an actively infected bush, eradication is key."
            }
        ]
    },
    {
        crop: "Rubber",
        diseases: [
            {
                name: "White Root Disease",
                cause: "Fungus (Rigidoporus microporus)",
                symptoms: "Yellowing and premature leaf fall. White thread-like fungal mycelium network grows across the roots.",
                prevention: "Clear all root debris from old clearings before planting. Plant creeping legume cover crops to speed decay of old roots.",
                treatment: "Drench the soil around infected trees with collar protectant fungicides containing Tebuconazole or Hexaconazole."
            },
            {
                name: "Corynespora Leaf Fall",
                cause: "Fungus (Corynespora cassiicola)",
                symptoms: "Railway track-like lesions on leaves leading to premature complete defoliation of the rubber tree.",
                prevention: "Plant resistant clones (avoid highly susceptible clones like RRISL 2000).",
                treatment: "Foliar application of Mancozeb or systemic fungicides during the refoliation period."
            }
        ]
    },
    {
        crop: "Coconut",
        diseases: [
            {
                name: "Bud Rot",
                cause: "Fungus (Phytophthora palmivora)",
                symptoms: "The youngest emerging leaf turns brown and collapses. The heart of the palm rots, emitting a foul smell.",
                prevention: "Provide adequate spacing and drainage. Apply Bordeaux mixture to the crown before the monsoon.",
                treatment: "If detected early, clean the crown and apply copper fungicides. Severely infected palms must be cut and burnt."
            },
            {
                name: "Coconut Leaf Blight",
                cause: "Fungus (Pestalotiopsis palmarum)",
                symptoms: "Small yellow-brown spots that merge to form large gray necrotic areas with dark margins on older leaflets.",
                prevention: "Maintain palm vitality through balanced NPK fertilizing and adequate soil moisture preservation.",
                treatment: "Usually self-limiting, but severe infections can be controlled by spraying Mancozeb."
            }
        ]
    },
    {
        crop: "Tomato",
        diseases: [
            {
                name: "Late Blight",
                cause: "Fungus-like pathogen (Phytophthora infestans)",
                symptoms: "Irregular, water-soaked, dark green lesions on leaves and stems, rapidly turning dark brown. White mold may appear under leaves in humid conditions.",
                prevention: "Use crop rotation, ensure wide plant spacing for airflow, and avoid overhead watering.",
                treatment: "Apply contact fungicides like Chlorothalonil early, or systemic ones like Metalaxyl if disease has established."
            },
            {
                name: "Tomato Leaf Curl Virus (ToLCV)",
                cause: "Virus (transmitted by Whiteflies)",
                symptoms: "Severe stunting of the plant, upward curling of leaf margins, puckering, and yellowing of the veins.",
                prevention: "Control vector whiteflies using yellow sticky traps and insect-proof netting. Plant resistant varieties like Thilina or Thilini.",
                treatment: "No cure for the virus. Infected plants must be immediately uprooted and destroyed."
            }
        ]
    },
    {
        crop: "Chili",
        diseases: [
            {
                name: "Chili Leaf Curl",
                cause: "Virus complex (transmitted by thrips, mites, and whiteflies)",
                symptoms: "Upward or downward curling of leaves, crinkling, stunted plant growth, and severe reduction in flower/fruit set.",
                prevention: "Use barrier crops like maize, manage vectors early using Neem seed kernel extract or systematic insecticides.",
                treatment: "Uproot and burn symptomatic plants to prevent the spread; chemical treatment only targets the vector insects."
            },
            {
                name: "Anthracnose (Fruit Rot)",
                cause: "Fungus (Colletotrichum capsici)",
                symptoms: "Circular, sunken lesions with black distinct rings on maturing and ripe chili pods. Leaves may also show necrotic spots.",
                prevention: "Use disease-free seeds treated with Captan. Ensure proper field drainage and practice crop rotation.",
                treatment: "Apply fungicides such as Mancozeb or Propiconazole at the appearance of initial symptoms on the crop."
            }
        ]
    },
    {
        crop: "Potato",
        diseases: [
            {
                name: "Bacterial Wilt",
                cause: "Bacteria (Ralstonia solanacearum)",
                symptoms: "Sudden wilting of healthy-looking plants while leaves remain green. Brown discoloration in the vascular ring of the potato tuber.",
                prevention: "Plant certified disease-free seed potatoes. Practice long crop rotations and avoid fields with a history of wilt.",
                treatment: "No chemical control is effective. Remove and destroy wilted plants and surrounding soil immediately."
            },
            {
                name: "Early Blight",
                cause: "Fungus (Alternaria solani)",
                symptoms: "Brown-black lesions with concentric target-like rings on older leaves, causing them to turn yellow and drop.",
                prevention: "Maintain optimal plant nutrition, avoid moisture stress, and clear crop debris after harvest.",
                treatment: "Foliar application of protectant fungicides like Chlorothalonil or Mancozeb as soon as spots appear."
            }
        ]
    },
    {
        crop: "Banana",
        diseases: [
            {
                name: "Panama Disease (Fusarium Wilt)",
                cause: "Soil-borne Fungus (Fusarium oxysporum)",
                symptoms: "Yellowing and wilting of older leaves that eventually collapse, forming a 'skirt' around the pseudostem. Vascular tissue inside turns dark brown.",
                prevention: "Plant resistant varieties. Use disease-free tissue culture plantlets. Strict farm hygiene prevents soil transfer.",
                treatment: "No known cure. Infected mats must be destroyed entirely and the site quarantined from future planting of susceptible varieties."
            },
            {
                name: "Banana Bunchy Top Virus (BBTV)",
                cause: "Virus (transmitted by banana aphids)",
                symptoms: "New leaves emerge narrow with wavy margins, becoming progressively shorter and 'bunched' at the top. Dark green streaks on leaf petioles.",
                prevention: "Control aphid populations. Only use verified clean planting material.",
                treatment: "Inject affected and strictly adjacent plants with herbicides to kill them completely and stop vector transmission."
            }
        ]
    },
    {
        crop: "Papaya",
        diseases: [
            {
                name: "Papaya Ringspot Virus (PRSV)",
                cause: "Virus (transmitted by aphids)",
                symptoms: "Mottling and yellowing of leaves, prominent dark green water-soaked rings on the fruit, and severe stunting.",
                prevention: "Cross-protection using mild strains if available. Control aphids and avoid planting near cucurbit crops.",
                treatment: "Rogue out infected trees immediately as there is no cure and fruits will be unmarketable."
            },
            {
                name: "Anthracnose",
                cause: "Fungus (Colletotrichum gloeosporioides)",
                symptoms: "Small water-soaked spots on ripening fruit that enlarge into sunken, dark lesions containing pinkish fungal masses.",
                prevention: "Harvest fruits carefully at color break and avoid bruising. Use hot water treatment post-harvest.",
                treatment: "Pre-harvest protective sprays of Mancozeb or copper-based fungicides starting from fruit setting."
            }
        ]
    },
    {
        crop: "Cabbage",
        diseases: [
            {
                name: "Clubroot",
                cause: "Soil-borne pathogen (Plasmodiophora brassicae)",
                symptoms: "Stunted growth and daytime wilting. Roots become massively swollen and distorted into club-like galls.",
                prevention: "Raise soil pH above 7.0 using agricultural lime. Enforce strict hygiene to prevent movement of contaminated soil.",
                treatment: "Cannot be eliminated once present; practice 5-7 year crop rotation away from any cruciferous crops."
            },
            {
                name: "Black Rot",
                cause: "Bacteria (Xanthomonas campestris)",
                symptoms: "V-shaped yellow to necrotic lesions starting from the leaf margins. Veins inside the lesions turn distinctly black.",
                prevention: "Use hot water treated seeds. Avoid working in the field when foliage is wet.",
                treatment: "Apply copper-based bactericides preventatively. Destroy infected crop debris post-harvest."
            }
        ]
    },
    {
        crop: "Carrot",
        diseases: [
            {
                name: "Alternaria Leaf Blight",
                cause: "Fungus (Alternaria dauci)",
                symptoms: "Dark brown to black lesions with yellow halos on leaf margins, eventually causing entire leaflets to shrivel and die.",
                prevention: "Use treated seed, ensure wide row spacing for good airflow, and irrigate in the morning.",
                treatment: "Apply fungicides like Chlorothalonil or Azoxystrobin at the first sign of disease."
            },
            {
                name: "Root Knot Nematode",
                cause: "Microscopic roundworm",
                symptoms: "Carrot taproots become severely stunted, forked, and covered with small irregular galls (knots).",
                prevention: "Practice crop rotation with non-host crops like maize. Deep plow in the dry season to expose nematodes to the sun.",
                treatment: "Apply specific nematicides prior to planting if the field is heavily infested."
            }
        ]
    },
    {
        crop: "Brinjal (Eggplant)",
        diseases: [
            {
                name: "Phomopsis Blight",
                cause: "Fungus (Phomopsis vexans)",
                symptoms: "Brownish circular spots with gray centers on leaves. Fruits rot forming pale, sunken areas covered with black dots.",
                prevention: "Use disease-free seeds and implement a 3-year crop rotation. Ensure good soil drainage.",
                treatment: "Apply Carbendazim or Mancozeb as a foliar spray during early growth stages."
            },
            {
                name: "Little Leaf Disease",
                cause: "Phytoplasma (transmitted by Leafhoppers)",
                symptoms: "Severe reduction in leaf size. Leaves become extremely small, yellowed, and the plant turns bushy and barren.",
                prevention: "Control leafhopper vectors using systemic insecticides like Imidacloprid. Eradicate weed hosts around the field.",
                treatment: "No chemical cure. Remove and burn all symptomatic plants immediately."
            }
        ]
    },
    {
        crop: "Onion (Big Onion and Red Onion)",
        diseases: [
            {
                name: "Purple Blotch",
                cause: "Fungus (Alternaria porri)",
                symptoms: "Small, water-soaked lesions that turn into elliptical purple spots with yellow halos, causing leaves to snap.",
                prevention: "Avoid dense planting, ensure adequate drainage, and do not over-apply nitrogen.",
                treatment: "Apply systemic fungicides like Tebuconazole mixed with a sticker-spreader immediately upon seeing spots."
            },
            {
                name: "Basal Rot",
                cause: "Fungus (Fusarium oxysporum f. sp. cepae)",
                symptoms: "Progressive yellowing and dieback from leaf tips. The base of the bulb rots and a white fungal growth is visible.",
                prevention: "Avoid root injury during weeding or transplanting. Store bulbs in dry, well-ventilated areas.",
                treatment: "Dip seedlings in Carbendazim solution before planting. Post-infection treatment in the field is difficult."
            }
        ]
    },
    {
        crop: "Mango",
        diseases: [
            {
                name: "Powdery Mildew",
                cause: "Fungus (Oidium mangiferae)",
                symptoms: "White powdery fungal growth heavily coating flowers, young leaves, and very young fruit, causing flower drop.",
                prevention: "Prune trees immediately after harvest to maintain open canopies for sunlight and air circulation.",
                treatment: "Spray wettable sulfur or systemic fungicides like Hexaconazole during the pre-blooming and full-bloom phases."
            },
            {
                name: "Mango Malformation",
                cause: "Fungus (Fusarium mangiferae)",
                symptoms: "Inflorescence becomes thick, stubby, and overcrowded leading to zero fruit set. Vegetative shoots appear bunched ('witches broom').",
                prevention: "Always use scions from strictly certified disease-free mother trees for grafting.",
                treatment: "Prune out and burn the malformed shoots and branches well below the affected area, followed by copper fungicide spray."
            }
        ]
    },
    {
        crop: "Cinnamon",
        diseases: [
            {
                name: "Rough Bark Disease",
                cause: "Fungus (Phoma sp. / Diplodia sp.)",
                symptoms: "Brown colored patches appear on the bark, turning it rough, corky, and significantly lowering peeling quality and essential oil yield.",
                prevention: "Maintain correct planting density and selectively prune excess canopy to allow sunlight.",
                treatment: "Scrape off the rough bark patches lightly and apply Bordeaux paste or a copper-based fungicide to the wound."
            },
            {
                name: "Leaf Blight",
                cause: "Fungus (Colletotrichum gloeosporioides)",
                symptoms: "Brown necrotic spots on tender leaves leading to drying and dropping of new shoots.",
                prevention: "Provide adequate potassium fertilizers to strengthen plant cell walls.",
                treatment: "Spray 1% Bordeaux mixture on tender flushes during periods of high humidity and rainfall."
            }
        ]
    },
    {
        crop: "Black Pepper",
        diseases: [
            {
                name: "Quick Wilt (Foot Rot)",
                cause: "Fungus (Phytophthora capsici)",
                symptoms: "Rapid spreading of dark, water-soaked lesions at the base of the vine, leading to sudden yellowing, shedding of leaves and spikes, and death of the vine within days.",
                prevention: "Improve drainage at the base. Avoid injury to the collar region and provide shade during the establishment phase.",
                treatment: "Drench the soil around the base with 1% Bordeaux mixture or systemic fungicides like Metalaxyl at the onset of monsoons."
            },
            {
                name: "Slow Decline (Slow Wilt)",
                cause: "Nematodes (Radopholus similis / Meloidogyne incognita)",
                symptoms: "Gradual yellowing and dieback of the vine over several months or years. Root system shows severe galling and rotting.",
                prevention: "Only use pest-free rooted cuttings. Apply organic matter like neem cake to the root zone to suppress nematodes.",
                treatment: "Apply nematicides like Carbofuran and drench with fungicides to prevent secondary infections."
            }
        ]
    }
];

async function generateAndSeedDiseases() {
    let generatedPairs = [];

    // Create variations of questions
    diseasesData.forEach(cropData => {
        const crop = cropData.crop;

        cropData.diseases.forEach(disease => {
            const dName = disease.name;

            // 1. Definition/Information Questions
            generatedPairs.push({
                question: `Tell me about ${dName} in ${crop}.`,
                answer: `${dName} in ${crop} is caused by ${disease.cause}. Symptoms include: ${disease.symptoms}. To treat it: ${disease.treatment}.`
            });
            generatedPairs.push({
                question: `What is the ${crop} disease called ${dName}?`,
                answer: `${dName} is a severe ${crop} disease caused by ${disease.cause}. It presents as: ${disease.symptoms}.`
            });

            // 2. Symptom Questions
            generatedPairs.push({
                question: `What are the symptoms of ${dName} in ${crop}?`,
                answer: `The symptoms of ${dName} in ${crop} include: ${disease.symptoms}.`
            });
            generatedPairs.push({
                question: `How do I identify ${dName} affecting my ${crop}?`,
                answer: `You can identify ${dName} in ${crop} by looking for these signs: ${disease.symptoms}.`
            });
            generatedPairs.push({
                question: `My ${crop} has ${disease.symptoms.toLowerCase().substring(0, 30)}... what disease is it?`,
                answer: `Based on those symptoms, your ${crop} is likely suffering from ${dName}, which is caused by ${disease.cause}. Treatment requires: ${disease.treatment}.`
            });

            // 3. Treatment and Control Questions
            generatedPairs.push({
                question: `How to treat ${dName} in ${crop}?`,
                answer: `To treat ${dName} in ${crop}, you should: ${disease.treatment}. Additionally, remember prevention: ${disease.prevention}.`
            });
            generatedPairs.push({
                question: `What is the cure for ${crop} infected with ${dName}?`,
                answer: `For ${dName} in ${crop}, the recommended treatment strategy is: ${disease.treatment}.`
            });
            generatedPairs.push({
                question: `Chemical controls for ${dName} on ${crop}?`,
                answer: `To control ${dName} on ${crop}: ${disease.treatment}. However, managing it long term requires: ${disease.prevention}.`
            });

            // 4. Prevention Questions
            generatedPairs.push({
                question: `How do I prevent ${dName} in my ${crop} plantation?`,
                answer: `To prevent ${dName} in ${crop}, the recommended approach is: ${disease.prevention}.`
            });
            generatedPairs.push({
                question: `What are the prevention methods for ${crop} ${dName}?`,
                answer: `Prevention for ${crop} ${dName} includes: ${disease.prevention}.`
            });

            // 5. Cause and Pathogen Questions
            generatedPairs.push({
                question: `What causes ${dName} in ${crop}?`,
                answer: `${dName} in ${crop} is primarily caused by: ${disease.cause}.`
            });
            generatedPairs.push({
                question: `What pathogen is responsible for ${crop} ${dName}?`,
                answer: `The pathogen responsible for ${dName} in ${crop} is ${disease.cause}.`
            });

            // Generate a few random filler templates for robust training
            generatedPairs.push({
                question: `${crop} ${dName} disease.`,
                answer: `Regarding ${crop} ${dName}: It is caused by ${disease.cause}. Symptoms: ${disease.symptoms}. Treatment: ${disease.treatment}. Prevention: ${disease.prevention}.`
            });
            generatedPairs.push({
                question: `Give me a full guide on ${dName} affecting ${crop}.`,
                answer: `Full Guide to ${crop} ${dName}:\n- Cause: ${disease.cause}\n- Symptoms: ${disease.symptoms}\n- Prevention: ${disease.prevention}\n- Treatment: ${disease.treatment}`
            });
            generatedPairs.push({
                question: `Is there a way to manage ${dName} for ${crop} farmers?`,
                answer: `Yes, to manage ${dName} in ${crop}, farmers should focus on treatment: ${disease.treatment}, and prevention: ${disease.prevention}.`
            });
            generatedPairs.push({
                question: `I spotted ${dName} in my ${crop} field, what should I do?`,
                answer: `If you spotted ${dName} in your ${crop} field, immediately take the following treatment steps: ${disease.treatment}. Going forward, use these prevention methods: ${disease.prevention}.`
            });

        });
    });

    // Calculate length
    console.log(`Generated ${generatedPairs.length} unique Sri Lankan Crop Disease Q&A permutations.`);

    // Connect to DB and insert
    try {
        if (!process.env.MONGO_URL) throw new Error("Missing MONGO_URL in .env");
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to MongoDB for Database Injection...");

        const operations = generatedPairs.map(pair => {
            return {
                updateOne: {
                    filter: { question: pair.question },
                    update: {
                        $set: {
                            question: pair.question,
                            username: "System",
                            category: "Crop Diseases",
                            chatbotConfidence: 0,
                            status: "Answered",
                            usedForTraining: true,
                            helpfulCount: 0,
                            answers: [{
                                username: "System",
                                answer: pair.answer,
                                isAccepted: true
                            }]
                        }
                    },
                    upsert: true
                }
            };
        });

        // Execute bulk write 
        const result = await Question.bulkWrite(operations);
        console.log(`Successfully completed Disease bulk operations.`);
        console.log(`Inserted: ${result.upsertedCount}, Modified: ${result.modifiedCount}`);

        const count = await Question.countDocuments();
        console.log(`Total questions in database: ${count}`);

        mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error("Error inserting data into MongoDB:", error);
        process.exit(1);
    }
}

generateAndSeedDiseases();
