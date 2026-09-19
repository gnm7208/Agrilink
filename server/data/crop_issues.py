"""
Curated knowledge base for the Crop Issue Helper.

This is a rule-based symptom checker, not an image-classification model —
matching is done by tag overlap between the crop/symptoms a farmer selects
and each entry's tags. Framed in the UI as a quick first-pass triage tool,
not a diagnosis, since there is no real image analysis behind it.
"""

CROPS = [
    "maize",
    "beans",
    "coffee",
    "tomatoes",
    "kale",
    "cassava",
    "bananas",
    "rice",
    "wheat",
    "sorghum",
    "groundnuts",
    "onions",
    "cabbage",
    "sweet potatoes",
    "sunflower",
]

SYMPTOMS = [
    {"id": "yellowing_leaves", "label": "Yellowing leaves"},
    {"id": "brown_spots", "label": "Brown or dark spots on leaves"},
    {"id": "wilting", "label": "Wilting despite watering"},
    {"id": "holes_in_leaves", "label": "Holes or chewed leaves"},
    {"id": "stunted_growth", "label": "Stunted growth"},
    {"id": "white_powdery_coating", "label": "White powdery coating"},
    {"id": "curling_leaves", "label": "Curling or distorted leaves"},
    {"id": "black_sooty_mold", "label": "Black sooty mold"},
    {"id": "root_rot", "label": "Soft, rotting roots"},
    {"id": "discoloration_on_fruit", "label": "Discoloration on fruit/pods"},
    {"id": "leaf_drop", "label": "Premature leaf drop"},
    {"id": "mosaic_pattern", "label": "Mosaic/mottled leaf pattern"},
    {"id": "chewed_stems", "label": "Chewed or bored stems"},
    {"id": "oozing_sap", "label": "Oozing sap or discharge"},
]

# crop_tags: "any" matches every crop.
CROP_ISSUES = [
    {
        "id": "fall-armyworm",
        "name": "Fall Armyworm",
        "category": "pest",
        "crop_tags": ["maize"],
        "symptom_tags": ["holes_in_leaves", "chewed_stems", "stunted_growth"],
        "description": "Caterpillar pest that bores into the whorl and chews leaves in a distinctive window-pane pattern.",
        "recommended_action": "Apply a Bt-based biopesticide early morning or evening while larvae are small. Push-pull companion planting with desmodium can help suppress it long-term.",
    },
    {
        "id": "maize-streak-virus",
        "name": "Maize Streak Virus",
        "category": "disease",
        "crop_tags": ["maize"],
        "symptom_tags": ["mosaic_pattern", "yellowing_leaves", "stunted_growth"],
        "description": "Virus spread by leafhoppers, causing pale streaking along the leaf veins and stunted plants.",
        "recommended_action": "Remove and destroy infected plants early. Plant certified resistant varieties next season and control leafhoppers with recommended insecticides.",
    },
    {
        "id": "bean-rust",
        "name": "Bean Rust",
        "category": "disease",
        "crop_tags": ["beans"],
        "symptom_tags": ["brown_spots", "yellowing_leaves", "leaf_drop"],
        "description": "Fungal disease causing reddish-brown pustules on leaves, leading to early defoliation.",
        "recommended_action": "Remove heavily infected leaves, improve airflow with wider spacing, and apply a copper-based fungicide if the infection is spreading.",
    },
    {
        "id": "bean-fly",
        "name": "Bean Fly",
        "category": "pest",
        "crop_tags": ["beans"],
        "symptom_tags": ["wilting", "stunted_growth"],
        "description": "Larvae tunnel into stems near the base, weakening and sometimes killing seedlings.",
        "recommended_action": "Earth up soil around the stem base to encourage secondary roots. Rotate crops and avoid planting beans in the same plot consecutively.",
    },
    {
        "id": "coffee-berry-disease",
        "name": "Coffee Berry Disease",
        "category": "disease",
        "crop_tags": ["coffee"],
        "symptom_tags": ["discoloration_on_fruit", "black_sooty_mold"],
        "description": "Fungal disease causing dark, sunken lesions on green and ripening berries.",
        "recommended_action": "Prune for better airflow, pick and destroy infected berries, and time copper-based sprays before the rains when infection risk is highest.",
    },
    {
        "id": "coffee-leaf-rust",
        "name": "Coffee Leaf Rust",
        "category": "disease",
        "crop_tags": ["coffee"],
        "symptom_tags": ["yellowing_leaves", "brown_spots", "leaf_drop"],
        "description": "Orange-yellow powdery spots on the underside of leaves, causing heavy leaf drop.",
        "recommended_action": "Prune to improve ventilation, remove fallen infected leaves, and consider resistant varieties for future replanting.",
    },
    {
        "id": "tomato-blight",
        "name": "Tomato Blight",
        "category": "disease",
        "crop_tags": ["tomatoes"],
        "symptom_tags": ["brown_spots", "wilting", "leaf_drop"],
        "description": "Fast-spreading fungal disease causing dark blotches on leaves and stems, especially in wet weather.",
        "recommended_action": "Remove and destroy affected foliage immediately, avoid overhead watering, and apply a preventive fungicide before the next rains.",
    },
    {
        "id": "tomato-mosaic-virus",
        "name": "Tomato Mosaic Virus",
        "category": "disease",
        "crop_tags": ["tomatoes"],
        "symptom_tags": ["mosaic_pattern", "curling_leaves", "stunted_growth"],
        "description": "Virus causing mottled light/dark green patterns and distorted, curled leaves.",
        "recommended_action": "Remove infected plants to prevent spread, wash hands/tools between plants, and source certified virus-free seed next season.",
    },
    {
        "id": "cassava-mosaic-disease",
        "name": "Cassava Mosaic Disease",
        "category": "disease",
        "crop_tags": ["cassava"],
        "symptom_tags": ["mosaic_pattern", "curling_leaves", "stunted_growth"],
        "description": "One of the most damaging cassava diseases, spread by whitefly and infected cuttings.",
        "recommended_action": "Always source clean, certified planting material. Rogue out and destroy infected plants early to slow spread to healthy ones.",
    },
    {
        "id": "cassava-brown-streak",
        "name": "Cassava Brown Streak Disease",
        "category": "disease",
        "crop_tags": ["cassava"],
        "symptom_tags": ["discoloration_on_fruit", "root_rot"],
        "description": "Disease that causes brown corky rot inside the tuber, often with few above-ground symptoms.",
        "recommended_action": "Inspect tubers at harvest; discard visibly affected roots. Use disease-free cuttings from a trusted source for the next planting.",
    },
    {
        "id": "kale-aphids",
        "name": "Aphid Infestation",
        "category": "pest",
        "crop_tags": ["kale"],
        "symptom_tags": ["curling_leaves", "black_sooty_mold", "stunted_growth"],
        "description": "Small sap-sucking insects that cluster on new growth, causing curling and sooty mold from their honeydew.",
        "recommended_action": "Spray with a soap-water solution or neem oil, and encourage natural predators like ladybirds. Remove heavily infested leaves.",
    },
    {
        "id": "powdery-mildew",
        "name": "Powdery Mildew",
        "category": "disease",
        "crop_tags": ["any"],
        "symptom_tags": ["white_powdery_coating", "leaf_drop"],
        "description": "Common fungal disease appearing as a white, dusty coating on leaves, thriving in humid, low-airflow conditions.",
        "recommended_action": "Improve spacing/airflow, avoid wetting leaves when watering, and apply a sulfur-based fungicide if it's spreading fast.",
    },
    {
        "id": "root-rot",
        "name": "Root Rot",
        "category": "disease",
        "crop_tags": ["any"],
        "symptom_tags": ["root_rot", "wilting", "yellowing_leaves"],
        "description": "Fungal/water-mold infection of the roots, usually caused by waterlogged, poorly-drained soil.",
        "recommended_action": "Improve drainage immediately, reduce watering frequency, and remove severely affected plants to stop spread to neighbors.",
    },
    {
        "id": "nitrogen-deficiency",
        "name": "Nitrogen Deficiency",
        "category": "nutrient",
        "crop_tags": ["any"],
        "symptom_tags": ["yellowing_leaves", "stunted_growth"],
        "description": "Older/lower leaves yellow first while growth slows, typical of nitrogen-poor soil.",
        "recommended_action": "Apply a nitrogen-rich fertilizer or well-composted manure. A basic soil test can confirm before you buy inputs.",
    },
    {
        "id": "potassium-deficiency",
        "name": "Potassium Deficiency",
        "category": "nutrient",
        "crop_tags": ["any"],
        "symptom_tags": ["brown_spots", "curling_leaves"],
        "description": "Scorched, browning leaf edges and curling, often showing up during fruiting/pod-filling stages.",
        "recommended_action": "Apply a potassium-rich fertilizer (e.g. muriate of potash) and ensure consistent watering, since drought stress worsens symptoms.",
    },
    {
        "id": "drought-stress",
        "name": "Drought Stress",
        "category": "environmental",
        "crop_tags": ["any"],
        "symptom_tags": ["wilting", "leaf_drop", "stunted_growth"],
        "description": "Water shortage causing wilting, curling, and shed leaves to reduce water loss.",
        "recommended_action": "Mulch to retain soil moisture, water deeply but less frequently, and consider drip irrigation if this recurs each season.",
    },
    {
        "id": "overwatering",
        "name": "Overwatering",
        "category": "environmental",
        "crop_tags": ["any"],
        "symptom_tags": ["root_rot", "yellowing_leaves", "wilting"],
        "description": "Excess water suffocates roots, leading to yellowing and wilting that looks similar to drought stress.",
        "recommended_action": "Let the soil dry out between waterings and improve drainage. Check that pots/beds aren't waterlogged after rain.",
    },
    {
        "id": "banana-bacterial-wilt",
        "name": "Banana Bacterial Wilt (BXW)",
        "category": "disease",
        "crop_tags": ["bananas"],
        "symptom_tags": ["wilting", "yellowing_leaves", "oozing_sap"],
        "description": "Serious bacterial disease causing yellowing, wilting, and yellowish ooze from cut stems.",
        "recommended_action": "Cut down and destroy infected plants completely, disinfect tools between plants with fire or bleach, and remove male buds to reduce insect transmission.",
    },
    {
        "id": "rice-blast",
        "name": "Rice Blast",
        "category": "disease",
        "crop_tags": ["rice"],
        "symptom_tags": ["brown_spots", "leaf_drop"],
        "description": "Fungal disease producing diamond-shaped grey-centered lesions on leaves, and can also rot the neck of the panicle.",
        "recommended_action": "Avoid excess nitrogen, ensure fields aren't kept flooded too long, and apply a tricyclazole-based fungicide at early signs.",
    },
    {
        "id": "brown-planthopper",
        "name": "Brown Planthopper",
        "category": "pest",
        "crop_tags": ["rice"],
        "symptom_tags": ["yellowing_leaves", "stunted_growth", "wilting"],
        "description": "Sap-sucking insect at the base of the plant causing 'hopperburn' — patches of rice that yellow, dry, and collapse.",
        "recommended_action": "Avoid excessive nitrogen fertilizer, drain the field periodically to disrupt breeding, and use a recommended insecticide if hopper numbers are high.",
    },
    {
        "id": "wheat-rust",
        "name": "Wheat Rust",
        "category": "disease",
        "crop_tags": ["wheat"],
        "symptom_tags": ["brown_spots", "yellowing_leaves"],
        "description": "Fungal disease producing orange-brown pustules on leaves and stems that can spread quickly in humid conditions.",
        "recommended_action": "Plant rust-resistant varieties where available, rotate cereal crops, and apply a triazole fungicide if caught early.",
    },
    {
        "id": "wheat-aphids",
        "name": "Cereal Aphids",
        "category": "pest",
        "crop_tags": ["wheat", "sorghum"],
        "symptom_tags": ["curling_leaves", "black_sooty_mold", "stunted_growth"],
        "description": "Sap-sucking insects clustering on leaves and stems, weakening the plant and coating it in sticky honeydew that grows sooty mold.",
        "recommended_action": "Encourage natural predators, spray with soap-water or neem oil for light infestations, and use a targeted insecticide only if numbers spike.",
    },
    {
        "id": "sorghum-downy-mildew",
        "name": "Sorghum Downy Mildew",
        "category": "disease",
        "crop_tags": ["sorghum"],
        "symptom_tags": ["mosaic_pattern", "yellowing_leaves", "stunted_growth"],
        "description": "Fungal disease causing pale green to yellow striping on leaves and severely stunted, distorted plants.",
        "recommended_action": "Use certified disease-free seed, rotate away from sorghum/maize for a season, and rogue out infected plants as soon as they're spotted.",
    },
    {
        "id": "sorghum-shoot-fly",
        "name": "Sorghum Shoot Fly",
        "category": "pest",
        "crop_tags": ["sorghum"],
        "symptom_tags": ["wilting", "stunted_growth", "chewed_stems"],
        "description": "Larvae bore into the central shoot of young plants, killing the growing point and causing the classic wilted 'deadheart' symptom.",
        "recommended_action": "Plant early with the first rains to avoid peak fly season, use a seed dressing insecticide, and consider intercropping to reduce egg-laying.",
    },
    {
        "id": "groundnut-rosette",
        "name": "Groundnut Rosette Disease",
        "category": "disease",
        "crop_tags": ["groundnuts"],
        "symptom_tags": ["mosaic_pattern", "stunted_growth", "yellowing_leaves"],
        "description": "Aphid-transmitted virus causing severe stunting and mottled, bunched ('rosetted') yellow-green leaves.",
        "recommended_action": "Plant early and densely to reduce aphid landing rates, control aphids with a recommended insecticide, and rogue out infected plants promptly.",
    },
    {
        "id": "groundnut-leaf-spot",
        "name": "Groundnut Leaf Spot",
        "category": "disease",
        "crop_tags": ["groundnuts"],
        "symptom_tags": ["brown_spots", "leaf_drop"],
        "description": "Fungal disease (early or late leaf spot) causing dark circular lesions that merge and cause heavy defoliation.",
        "recommended_action": "Rotate with a non-legume crop, remove crop debris after harvest, and apply a chlorothalonil-based fungicide if spots are spreading fast.",
    },
    {
        "id": "onion-purple-blotch",
        "name": "Purple Blotch",
        "category": "disease",
        "crop_tags": ["onions"],
        "symptom_tags": ["brown_spots", "leaf_drop"],
        "description": "Fungal disease causing purplish-brown lesions with yellow margins on leaves, leading to dieback from the tip.",
        "recommended_action": "Avoid overhead irrigation, space plants for airflow, and apply a mancozeb-based fungicide at the first sign of lesions.",
    },
    {
        "id": "onion-thrips",
        "name": "Onion Thrips",
        "category": "pest",
        "crop_tags": ["onions"],
        "symptom_tags": ["curling_leaves", "stunted_growth"],
        "description": "Tiny insects that rasp at leaf surfaces, leaving silvery streaks and causing curled, stunted growth and smaller bulbs.",
        "recommended_action": "Use blue or white sticky traps to monitor, apply neem oil or a recommended insecticide, and avoid planting next to onion/garlic fields already infested.",
    },
    {
        "id": "cabbage-diamondback-moth",
        "name": "Diamondback Moth",
        "category": "pest",
        "crop_tags": ["cabbage", "kale"],
        "symptom_tags": ["holes_in_leaves", "stunted_growth"],
        "description": "Small caterpillars that chew irregular 'window' holes in leaves without breaking the outer surface, and can devastate heads if unchecked.",
        "recommended_action": "Rotate Bt-based biopesticide with other modes of action to avoid resistance, and intercrop with trap crops like mustard to draw moths away.",
    },
    {
        "id": "cabbage-black-rot",
        "name": "Black Rot",
        "category": "disease",
        "crop_tags": ["cabbage"],
        "symptom_tags": ["yellowing_leaves", "brown_spots", "leaf_drop"],
        "description": "Bacterial disease producing distinctive V-shaped yellow lesions from the leaf edge inward, with blackened veins.",
        "recommended_action": "Use certified disease-free seed, avoid working fields when leaves are wet, and rotate out of brassicas for at least two seasons.",
    },
    {
        "id": "sweet-potato-weevil",
        "name": "Sweet Potato Weevil",
        "category": "pest",
        "crop_tags": ["sweet potatoes"],
        "symptom_tags": ["wilting", "chewed_stems", "discoloration_on_fruit"],
        "description": "Larvae tunnel into vines and tubers, causing wilting above ground and bitter, dark, cracked tubers below.",
        "recommended_action": "Hill up soil to cover exposed tubers, rotate away from sweet potato for a season, and use clean, weevil-free vines for planting.",
    },
    {
        "id": "sweet-potato-virus-disease",
        "name": "Sweet Potato Virus Disease (SPVD)",
        "category": "disease",
        "crop_tags": ["sweet potatoes"],
        "symptom_tags": ["mosaic_pattern", "stunted_growth", "curling_leaves"],
        "description": "Combination of two viruses causing severe stunting, small distorted leaves, and a strong mottled/mosaic pattern.",
        "recommended_action": "Always plant certified virus-free vines, rogue out infected plants immediately, and control aphids and whiteflies that spread the viruses.",
    },
    {
        "id": "sunflower-downy-mildew",
        "name": "Sunflower Downy Mildew",
        "category": "disease",
        "crop_tags": ["sunflower"],
        "symptom_tags": ["yellowing_leaves", "stunted_growth", "white_powdery_coating"],
        "description": "Fungal disease causing stunted plants with pale, yellow-mottled leaves and a white fuzzy growth on the leaf undersides.",
        "recommended_action": "Use certified treated seed, rotate out of sunflower for 3-4 years in affected fields, and remove volunteer plants that can harbor the disease.",
    },
    {
        "id": "sunflower-head-rot",
        "name": "Sunflower Head Rot",
        "category": "disease",
        "crop_tags": ["sunflower"],
        "symptom_tags": ["brown_spots", "discoloration_on_fruit"],
        "description": "Fungal or bacterial rot starting on the back of the flower head, turning it dark and mushy and reducing seed quality.",
        "recommended_action": "Improve field drainage, avoid overhead irrigation once heads form, and harvest promptly once mature to limit time at risk.",
    },
]


def get_crops():
    return CROPS


def get_symptoms():
    return SYMPTOMS


def diagnose(crop, symptom_ids):
    """Return matching issues ranked by symptom-tag overlap."""
    symptom_set = set(symptom_ids)
    matches = []
    for issue in CROP_ISSUES:
        if crop not in issue["crop_tags"] and "any" not in issue["crop_tags"]:
            continue
        overlap = symptom_set & set(issue["symptom_tags"])
        if not overlap:
            continue
        score = len(overlap)
        total = len(issue["symptom_tags"])
        if score >= total or score >= 3:
            confidence = "high"
        elif score == 2:
            confidence = "medium"
        else:
            confidence = "low"
        matches.append(
            {
                "id": issue["id"],
                "name": issue["name"],
                "category": issue["category"],
                "description": issue["description"],
                "recommended_action": issue["recommended_action"],
                "confidence": confidence,
                "matched_symptoms": sorted(overlap),
            }
        )

    matches.sort(key=lambda m: len(m["matched_symptoms"]), reverse=True)
    return matches
