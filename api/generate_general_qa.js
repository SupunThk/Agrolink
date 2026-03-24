const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Question = require("./models/Question");

dotenv.config();

const agConcepts = [
    // ZONES & CLIMATE
    {
        topic: "Wet Zone",
        definition: "The Wet Zone of Sri Lanka receives an annual rainfall of over 2500 mm, primarily from the South-West Monsoon. It covers the southwestern part of the island.",
        importance: "It is ideal for cultivating water-demanding crops like tea, rubber, coconut, and various spices like cinnamon and cloves.",
        bestPractices: "Farmers must ensure excellent field drainage (trenches) to prevent waterlogging and soil erosion on slopes.",
        challenges: "High humidity leads to rapid weed growth and increased fungal diseases like Blister Blight and root rot."
    },
    {
        topic: "Dry Zone",
        definition: "The Dry Zone receives an annual rainfall of less than 1750 mm, predominantly during the North-East Monsoon (Maha season).",
        importance: "It is the primary agricultural region for staple crops, especially paddy, maize, legumes, and dry zone vegetables.",
        bestPractices: "Water conservation, rainwater harvesting in tanks (wewas), and drip irrigation are critical for survival during the Yala season.",
        challenges: "Extended droughts, high evaporation rates, and human-elephant conflicts are severe challenges."
    },
    {
        topic: "Intermediate Zone",
        definition: "The transitional area between the Wet and Dry zones, receiving between 1750 mm to 2500 mm of annual rainfall.",
        importance: "Highly versatile; suitable for coconut, minor export crops (pepper, cocoa), and a mix of both wet and dry zone vegetables.",
        bestPractices: "Integrating livestock with crops (mixed farming) and utilizing intercropping to maximize the versatile soil.",
        challenges: "Unpredictable micro-climates and increasing vulnerability to shifting monsoon patterns due to climate change."
    },
    {
        topic: "Upcountry (High Country)",
        definition: "Regions located above 1200 meters elevation, characterized by cooler temperatures and high rainfall.",
        importance: "The exclusive zone for premium Ceylon Tea (High Grown) and exotic temperate vegetables like leeks, carrots, and cabbage.",
        bestPractices: "Implementing strict contour terracing and planting deep-rooting grasses like Vetiver to hold the highly sloped soil.",
        challenges: "Severe topsoil erosion during heavy rains and occasional frost damage to tender crops in valleys."
    },
    {
        topic: "Maha Season",
        definition: "The primary agricultural season in Sri Lanka, running from September to March, sustained by the North-East monsoon.",
        importance: "Accounts for the majority of the nation's rice production and rain-fed subsidiary food crop cultivation.",
        bestPractices: "Early land preparation before the rains and selecting long-duration, high-yielding crop varieties.",
        challenges: "Delayed monsoons can disrupt the entire planting calendar, risking massive crop failures."
    },
    {
        topic: "Yala Season",
        definition: "The minor agricultural period from May to August, dependent on the South-West monsoon and stored irrigation water.",
        importance: "Crucial for secondary rice production and cultivating cash crops like sesame, green gram, and onions.",
        bestPractices: "Cultivating short-duration, drought-tolerant varieties and maximizing efficient irrigation like sprinklers.",
        challenges: "Severe water scarcity limits the cultivable land area compared to the Maha season."
    },
    // SOILS & LAND
    {
        topic: "Red Yellow Podzolic Soils",
        definition: "The most widespread soil type in the Wet Zone, characterized by a prominent red/yellow color and acidic nature.",
        importance: "It forms the foundation for Sri Lanka's massive plantation sector (Tea and Rubber).",
        bestPractices: "Regular application of agricultural lime (Dolomite) to correct acidity, and continuous addition of organic matter.",
        challenges: "Prone to severe leaching of nutrients (especially potassium and magnesium) due to heavy rainfall."
    },
    {
        topic: "Reddish Brown Earths",
        definition: "The dominant soil group in the Dry Zone, possessing good chemical fertility but difficult physical properties when wet or dry.",
        importance: "Supports the bulk of Sri Lanka's rainfed upland crops, maize, and irrigated paddy.",
        bestPractices: "Tilling must be done at the exact right moisture content; adding farmyard manure massively improves its workability.",
        challenges: "Becomes extremely hard when dry (making plowing impossible) and dangerously sticky when wet."
    },
    {
        topic: "Non-Calcic Brown Soils",
        definition: "Sandy, well-draining soils primarily found in the Eastern dry zone regions.",
        importance: "Excellent for cultivating groundnut, cassava, and other root or tuber crops.",
        bestPractices: "Frequent light irrigation and high organic fertilizer application (split dosing) since it cannot hold nutrients well.",
        challenges: "Very poor water holding capacity and extremely low natural organic matter."
    },
    {
        topic: "Alluvial Soils",
        definition: "Rich, deep soils deposited by rivers on floodplains, commonly found along major rivers like the Mahaweli.",
        importance: "Among the most fertile soils in Sri Lanka, ideal for intensive, high-yield paddy cultivation.",
        bestPractices: "Ensuring proper drainage canals are maintained to prevent waterlogging during flash floods.",
        challenges: "Highly susceptible to sudden, deep flooding during monsoon peaks, which can drown young crops."
    },
    // TECHNIQUES & SYSTEMS
    {
        topic: "Kandyan Forest Gardens",
        definition: "A traditional agroforestry system in the mid-country where multiple canopy layers of trees, spices, and roots are grown together.",
        importance: "One of the most sustainable and biodiverse farming systems in the world, providing continuous income and food security.",
        bestPractices: "Careful canopy management (pruning) to allow sufficient sunlight to reach the understory spices like ginger and turmeric.",
        challenges: "Requires high manual labor for harvesting and is not suited for modern mechanical farming."
    },
    {
        topic: "Chena Cultivation (Slash and Burn)",
        definition: "An ancient shifting cultivation practice in the Dry Zone where patches of forest are cleared, burned, and farmed for a few seasons.",
        importance: "Historically provided subsistence for Dry Zone communities using minimal external inputs.",
        bestPractices: "Transitioning to strictly controlled rotational farming or sedentary farming with integrated soil conservation, as true Chena is unsustainable.",
        challenges: "Causes severe deforestation, loss of biodiversity, and rapid soil degradation after the second yield."
    },
    {
        topic: "Cascade Tank System (Ellanga Gammana)",
        definition: "An ancient, interconnected network of small to large reservoirs (wewas) designed to farm the Dry Zone.",
        importance: "A globally recognized agricultural heritage system that ensures water availability across drought-prone areas year-round.",
        bestPractices: "Strict community maintenance of the tank bunds and desilting the tank bed during the dry season.",
        challenges: "Heavy siltation from upland deforestation, encroachment, and pollution from agrochemical runoff."
    },
    {
        topic: "Intercropping",
        definition: "The practice of growing two or more crops in close proximity, such as planting pepper on coconut trunks, or banana between young rubber.",
        importance: "Maximizes land utilization, reduces weed growth, and provides farmers with a buffer income if the primary crop fails.",
        bestPractices: "Ensuring the secondary crop does not compete for the exact same nutrient depth or block sunlight from the primary crop.",
        challenges: "Complicates mechanized harvesting and requires complex, simultaneous nutrient management."
    },
    {
        topic: "Crop Rotation",
        definition: "Growing different specific crops in the same area in sequential seasons rather than planting the same crop continuously.",
        importance: "Naturally breaks pest life cycles (like nematodes) and balances soil nutrients (e.g., legumes fix nitrogen for the next crop).",
        bestPractices: "Alternating deep-rooted crops (tomatoes) with shallow-rooted ones (onions), and integrating a legume phase (mung bean).",
        challenges: "Farmers must have knowledge of multiple crop lifecycles and market demands for all rotated crops."
    },
    // FERTILIZERS & ORGANICS
    {
        topic: "Compost Fertilizer",
        definition: "A dark, crumbly organic material created by the aerobic decomposition of plant and animal waste.",
        importance: "Dramatically improves soil structure, increases water retention, and provides a slow release of essential micronutrients.",
        bestPractices: "Maintain a proper carbon-to-nitrogen ratio (browns and greens), keep it moist, and turn it regularly for aeration.",
        challenges: "Takes weeks/months to mature and is highly labor-intensive to produce and transport in commercial bulk quantities."
    },
    {
        topic: "Eppawala Rock Phosphate (ERP)",
        definition: "A naturally occurring rock phosphate mined exclusively in Eppawala, Sri Lanka.",
        importance: "It is the primary long-term phosphorus fertilizer used for perennial plantation crops like Tea, Rubber, and Coconut.",
        bestPractices: "Incorporate it deeply into the soil root zone; it requires acidic soil to slowly dissolve and become plant-available.",
        challenges: "Its incredibly low water solubility makes it completely useless as a quick-fix fertilizer for short-term vegetable crops."
    },
    {
        topic: "Gliricidia sepium",
        definition: "A fast-growing leguminous tree ubiquitous in Sri Lanka, commonly used as live fencing and shade.",
        importance: "Its leaves act as an incredible green manure, fixing massive amounts of atmospheric nitrogen directly into the soil.",
        bestPractices: "Lopping the branches every 3-4 months and immediately burying or mulching the nitrogen-rich green leaves around crop bases.",
        challenges: "If not pruned aggressively, it can quickly overshadow and outcompete the actual crops for sunlight."
    },
    {
        topic: "Cow Dung Manure",
        definition: "The traditional animal waste fertilizer utilized by Sri Lankan farmers for centuries.",
        importance: "Rich in beneficial soil microbes and acts as a fantastic soil conditioner for physically poor soils like sand or dense clay.",
        bestPractices: "It must be fully dried and partially composted before application; fresh dung will burn roots and introduce weed seeds.",
        challenges: "Bulky, expensive to transport without cattle directly on the farm, and carries a risk of pathogenic bacteria if not composted."
    },
    {
        topic: "Urea Fertilizer",
        definition: "A highly concentrated, water-soluble synthetic chemical fertilizer containing exactly 46% Nitrogen.",
        importance: "Provides a massive, instantaneous boost to vegetative growth, essential for leafy vegetables and the tillering stage of paddy.",
        bestPractices: "Apply as a top-dressing in split doses, and mix it directly into the damp soil immediately to prevent it from evaporating as ammonia gas.",
        challenges: "Highly prone to leaching into groundwater causing pollution, and over-application causes severe pest vulnerability."
    },
    {
        topic: "Muriate of Potash (MOP)",
        definition: "A chemical fertilizer providing a highly concentrated source of Potassium.",
        importance: "Critical for disease resistance, cell wall strength, and the development/bulking of tubers (potatoes), fruits, and coconut kernels.",
        bestPractices: "Apply at the flowering/fruiting stage of crops, or as a basal mix for tuber crops.",
        challenges: "Sri Lanka imports 100% of its MOP requirements, making it incredibly expensive and subject to global market shocks."
    },
    // PEST MGMT & CHEMICALS
    {
        topic: "Integrated Pest Management (IPM)",
        definition: "A sustainable, multi-tiered approach to managing pests combining biological, cultural, physical, and chemical tools.",
        importance: "Reduces farmer dependency on toxic chemicals, preserves natural predators (like ladybugs), and prevents pests from developing resistance.",
        bestPractices: "Use crop rotation, field hygiene, and mechanical traps first; rely on chemical pesticides only as an absolute last resort.",
        challenges: "Requires farmers to be highly educated in pest life cycles and demands constant daily monitoring of the field."
    },
    {
        topic: "Neem Seed Kernel Extract (NSKE)",
        definition: "A potent organic botanical pesticide made by crushing and soaking the seeds of the Neem tree (Kohomba).",
        importance: "Acts as a broad-spectrum natural insect repellant and growth disruptor without leaving toxic chemical residues on food.",
        bestPractices: "Crush seeds, soak in water overnight, filter, add a small amount of soap as a sticker, and spray in the late evening.",
        challenges: "Degrades rapidly in sunlight (UV light), must be prepared fresh, and doesn't provide the 'instant knockdown' kill of chemicals."
    },
    {
        topic: "Yellow Sticky Traps",
        definition: "Bright yellow plastic boards coated with non-drying adhesive, hung just above the crop canopy.",
        importance: "An essential physical control and monitoring tool to trap flying pests like Whiteflies, Aphids, and Leaf miners.",
        bestPractices: "Deploy at least 15-20 traps per acre at the exact height of the crop canopy, and raise them as the plants grow.",
        challenges: "They also occasionally trap beneficial insects and must be regularly replaced when coated with dust or bugs."
    },
    {
        topic: "Systemic Insecticides",
        definition: "Chemical poisons that are absorbed by the plant roots or leaves and transported entirely through the plant's vascular tissue.",
        importance: "Provides complete, long-lasting protection against piercing/sucking insects (like Thrips and Aphids) hiding inside curled leaves.",
        bestPractices: "Strictly adhere to the pre-harvest interval (PHI) to ensure the toxic chemical has cleared before humans eat the crop.",
        challenges: "Highly toxic to bees/pollinators and can cause neurological damage to consumers if applied too close to harvest."
    },
    // EXPORTS & SPECIALTIES
    {
        topic: "Ceylon Cinnamon",
        definition: "The 'True Cinnamon' (Cinnamomum verum) native exclusively to Sri Lanka, famous for its delicate, non-toxic flavor.",
        importance: "Sri Lanka holds over 80% of the global true cinnamon market, making it a critical foreign exchange earner.",
        bestPractices: "Harvesting must be done during the wet season when the bark naturally peels off easily from the stem.",
        challenges: "Severe lack of skilled peelers, as peeling is highly specialized manual labor."
    },
    {
        topic: "Pepper (King of Spices)",
        definition: "A woody climbing vine (Piper nigrum) that thrives in Sri Lanka's wet and intermediate zones, predominantly grown in Matale and Kandy.",
        importance: "Sri Lankan pepper is world-renowned for having the highest Piperine content, making it exceptionally pungent.",
        bestPractices: "Must be trained on live support trees (like Gliricidia) and pruned regularly to encourage lateral fruiting branches.",
        challenges: "Highly susceptible to Soil Nematodes and Quick Wilt disease completely wiping out mature vines."
    },
    {
        topic: "Coconut Cultivation",
        definition: "A tropical palm spanning the famous 'Coconut Triangle' (Kurunegala, Puttalam, Gampaha) of Sri Lanka.",
        importance: "A staple in the local diet, providing massive industrial exports via desiccated coconut, coconut oil, and coir pith.",
        bestPractices: "Applying a circular trench manure ring 3 feet away from the trunk, and burying coconut husks to retain immense moisture.",
        challenges: "Land fragmentation for housing, wild boar/monkey damages, and severe droughts crashing yields."
    },
    {
        topic: "Protected Agriculture (Greenhouse Farming)",
        definition: "Cultivating crops like bell peppers, salad cucumbers, and tomatoes inside controlled poly-tunnels.",
        importance: "Allows year-round production of premium vegetables entirely protected from monsoon rains and macro-pests.",
        bestPractices: "Utilizing UV-stabilized polythene, drip fertigation (liquid fertilizer), and planting highly specialized hybrid seeds.",
        challenges: "Massive initial capital investment required, and heat buildup inside the tunnel requires advanced ventilation."
    },
    // LIVESTOCK & AQUA
    {
        topic: "Dairy Farming (Cattle)",
        definition: "Rearing cows for milk production, concentrated in the cool Upcountry (exotic breeds) and Dry zone (indigenous/cross breeds).",
        importance: "Crucial for national nutrition, moving Sri Lanka towards self-sufficiency away from imported milk powder.",
        bestPractices: "Feeding high-protein hybrid grasses like CO-3 or CO-4 (Napier), and providing continuous clean drinking water.",
        challenges: "Severe shortage of high-quality grazing land, heat stress in the dry zone, and high cost of formulated dairy concentrates."
    },
    {
        topic: "Inland Aquaculture (Freshwater Fish)",
        definition: "Farming freshwater fish species like Tilapia and Carp in massive dry zone reservoirs and backyard ponds.",
        importance: "Provides the cheapest source of high-quality animal protein to rural farming communities far from the ocean.",
        bestPractices: "Maintaining adequate pond depth, balancing water pH, and feeding formulated floating pellets to prevent bottom rot.",
        challenges: "Bird predation (cormorants/pelicans) and sudden water quality crashes (oxygen depletion) killing the entire stock."
    },
    {
        topic: "Poultry Farming",
        definition: "The commercial rearing of chickens for meat (Broilers) and eggs (Layers).",
        importance: "The fastest-growing and most heavily industrialized agricultural sector in Sri Lanka.",
        bestPractices: "Maintaining strict bio-security protocols (footbaths), temperature control for day-old chicks, and proper vaccination schedules.",
        challenges: "Massive fluctuations in the price of imported maize (chicken feed) and outbreaks of diseases like Avian Influenza."
    },
    // WATER & MACHINERY
    {
        topic: "Drip Irrigation",
        definition: "A micro-irrigation system that delivers water directly to the root zone of plants drop-by-drop through specialized plastic pipes.",
        importance: "Saves up to 70% of water compared to surface flooding, essential for farming in the parched Dry Zone during Yala season.",
        bestPractices: "Integrating a filtration system to prevent the microscopic emitters from clogging with algae or sand.",
        challenges: "Expensive to install and rats/wild animals frequently chew through the plastic pipes looking for water."
    },
    {
        topic: "Two-Wheel Tractors (Land Masters)",
        definition: "A versatile, walk-behind diesel tractor ubiquitously used by small-scale Sri Lankan farmers.",
        importance: "Revolutionized localized farming by mechanizing plowing, threshing, water pumping, and transport on small fragmented lands.",
        bestPractices: "Regular maintenance of the rotary blades and engine oil, and engaging the differential lock correctly in deep mud.",
        challenges: "Physically exhausting for the operator to walk behind in deep mud for 8 hours a day."
    },
    {
        topic: "Post-Harvest Losses",
        definition: "The physical and qualitative damage of agricultural produce from the moment it is harvested until it is consumed.",
        importance: "In Sri Lanka, up to 30-40% of fresh vegetables are destroyed during transport, drastically increasing food prices.",
        bestPractices: "Using rigifoam boxes or plastic crates instead of crushing vegetables into massive polythene sacks for transport to Dambulla.",
        challenges: "Lack of cold chain infrastructure (refrigerated trucks) and poor, bumpy rural road conditions."
    }
];

// Combine the 35 topics with 30 diverse NLP templates to generate 1050 unique items.
async function generateGeneralData() {
    let generatedPairs = [];

    const templates = [
        // 1. Definition templates
        (t, d, i, b, c) => ({ q: `What is ${t}?`, a: `${t} can be defined as: ${d}` }),
        (t, d, i, b, c) => ({ q: `Explain ${t}.`, a: `In Sri Lankan agriculture, ${t} means: ${d}` }),
        (t, d, i, b, c) => ({ q: `Tell me about ${t}.`, a: `${t} is an agricultural concept where: ${d} Its importance is: ${i}` }),
        (t, d, i, b, c) => ({ q: `Can you define ${t} for me?`, a: `Yes. ${d} That is the standard definition of ${t}.` }),

        // 2. Importance/Value templates
        (t, d, i, b, c) => ({ q: `Why is ${t} important?`, a: `The primary importance of ${t} is that: ${i}` }),
        (t, d, i, b, c) => ({ q: `What is the significance of ${t}?`, a: `In terms of significance, ${i}` }),
        (t, d, i, b, c) => ({ q: `How does ${t} benefit farmers?`, a: `Farmers benefit massively because ${i}` }),
        (t, d, i, b, c) => ({ q: `What value does ${t} provide to Sri Lanka?`, a: `${t} provides immense value because ${i}` }),

        // 3. Best Practices templates
        (t, d, i, b, c) => ({ q: `What are the best practices for ${t}?`, a: `To succeed with ${t}, you should follow these best practices: ${b}` }),
        (t, d, i, b, c) => ({ q: `How should I manage ${t}?`, a: `Proper management of ${t} dictates that: ${b}` }),
        (t, d, i, b, c) => ({ q: `Give me tips on doing ${t} correctly.`, a: `The best tip for handling ${t} correctly is: ${b}` }),
        (t, d, i, b, c) => ({ q: `What is the correct way to handle ${t}?`, a: `The correct operational approach is: ${b}` }),
        (t, d, i, b, c) => ({ q: `How do professionals deal with ${t}?`, a: `Professional agriculturists approach it by: ${b}` }),

        // 4. Challenges templates
        (t, d, i, b, c) => ({ q: `What are the challenges associated with ${t}?`, a: `The main challenges facing ${t} are: ${c}` }),
        (t, d, i, b, c) => ({ q: `What problems arise with ${t}?`, a: `When dealing with ${t}, farmers typically face these problems: ${c}` }),
        (t, d, i, b, c) => ({ q: `Are there any risks regarding ${t}?`, a: `Yes, the primary risks and difficulties are: ${c}` }),
        (t, d, i, b, c) => ({ q: `Why is ${t} difficult?`, a: `It is considered difficult largely because: ${c}` }),
        (t, d, i, b, c) => ({ q: `What are the disadvantages of ${t}?`, a: `Some prominent disadvantages or hurdles of ${t} include: ${c}` }),

        // 5. Mixed Conversational templates
        (t, d, i, b, c) => ({ q: `Give me a full overview of ${t}.`, a: `Overview of ${t}:\n- Definition: ${d}\n- Importance: ${i}\n- Best Practice: ${b}\n- Challenges: ${c}` }),
        (t, d, i, b, c) => ({ q: `I want to know everything about ${t}.`, a: `Here is everything about ${t}: ${d} It is highly utilized because ${i}. Be aware of difficulties: ${c}. Handle it by: ${b}.` }),
        (t, d, i, b, c) => ({ q: `Is ${t} good for farming?`, a: `Yes, ${i}. The standard rule is: ${b}. But be cautious: ${c}.` }),
        (t, d, i, b, c) => ({ q: `What should a beginner know about ${t}?`, a: `A beginner should first know that ${d}. To succeed: ${b}.` }),
        (t, d, i, b, c) => ({ q: `Summary of ${t} please.`, a: `Summary: ${d}. Value: ${i}. Action: ${b}.` }),
        (t, d, i, b, c) => ({ q: `${t} in Sri Lanka.`, a: `Regarding ${t} specifically in Sri Lanka: ${d} Specifically, its challenges locally are: ${c}.` }),
        (t, d, i, b, c) => ({ q: `Help me understand ${t}.`, a: `To understand it simply: ${d}. It's critical because ${i}.` }),
        (t, d, i, b, c) => ({ q: `What are the pros and cons of ${t}?`, a: `Pros: ${i}. Cons: ${c}.` }),
        (t, d, i, b, c) => ({ q: `Can you outline the methods for ${t}?`, a: `The core method is: ${b}.` }),
        (t, d, i, b, c) => ({ q: `What makes ${t} unique?`, a: `What makes ${t} unique is: ${d} combined with the fact that ${i}.` }),
        (t, d, i, b, c) => ({ q: `Give me the facts about ${t}.`, a: `Fact 1: ${d}. Fact 2: ${i}. Fact 3: ${c}.` }),
        (t, d, i, b, c) => ({ q: `How does ${t} work?`, a: `It works fundamentally like this: ${d}. Ensure you apply the best practice: ${b}.` }),
    ];

    agConcepts.forEach(concept => {
        templates.forEach(tpl => {
            generatedPairs.push(tpl(
                concept.topic,
                concept.definition,
                concept.importance,
                concept.bestPractices,
                concept.challenges
            ));
        });
    });

    console.log(`Generated exactly ${generatedPairs.length} overarching Sri Lankan Agriculture Q&A permutations.`);

    try {
        if (!process.env.MONGO_URL) throw new Error("Missing MONGO_URL in .env");
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to MongoDB for Database Injection...");

        const operations = generatedPairs.map(pair => {
            return {
                updateOne: {
                    filter: { question: pair.q },
                    update: {
                        $set: {
                            question: pair.q,
                            username: "System",
                            category: "General",
                            chatbotConfidence: 0,
                            status: "Answered",
                            usedForTraining: true,
                            helpfulCount: 0,
                            answers: [{
                                username: "System",
                                answer: pair.a,
                                isAccepted: true
                            }]
                        }
                    },
                    upsert: true
                }
            };
        });

        const result = await Question.bulkWrite(operations);
        console.log(`Successfully completed General Agriculture bulk operations.`);
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

generateGeneralData();
