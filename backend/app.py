from flask import Flask, jsonify, request
import json
import random
from pathlib import Path

app = Flask(__name__)

# Load plants data
PLANTS_FILE = Path(__file__).parent / "plants.json"

def load_plants():
    with open(PLANTS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

@app.route("/")
def index():
    return "Tatra Flora Quiz API - use /api/plants, /api/random, /api/quiz"


@app.route("/api/plants")
def get_all_plants():
    """Get all plants data"""
    plants = load_plants()
    return jsonify(plants)


@app.route("/api/plants/<int:plant_id>")
def get_plant(plant_id):
    """Get specific plant by ID"""
    plants = load_plants()
    plant = next((p for p in plants if p["id"] == plant_id), None)
    if plant:
        return jsonify(plant)
    return jsonify({"error": "Plant not found"}), 404


@app.route("/api/random")
def get_random_plant():
    """Get a random plant with a random image"""
    plants = load_plants()
    plant = random.choice(plants)
    
    # Select random image
    if plant["images"]:
        plant["current_image"] = random.choice(plant["images"])
    else:
        plant["current_image"] = None
    
    return jsonify(plant)


@app.route("/api/quiz")
def get_quiz_question():
    """Get a quiz question with 4 options (1 correct, 3 random)"""
    plants = load_plants()
    
    # Select correct plant
    correct_plant = random.choice(plants)
    correct_name = correct_plant["name"]
    
    # Select random image from correct plant
    if correct_plant["images"]:
        correct_plant["current_image"] = random.choice(correct_plant["images"])
    
    # Get 3 wrong options (different from correct)
    all_plants = [p for p in plants if p["name"] != correct_name]
    wrong_options = random.sample(all_plants, min(3, len(all_plants)))
    
    # Prepare options (shuffled)
    options = [correct_plant] + wrong_options
    random.shuffle(options)
    
    # Format response
    response = {
        "correct_plant": correct_plant,
        "options": [
            {"id": p["id"], "name": p["name"], "is_correct": p["name"] == correct_name}
            for p in options
        ],
        "correct_answer": correct_name,
        "correct_answer_id": correct_plant["id"]
    }
    
    return jsonify(response)


@app.route("/api/check-answer", methods=["POST"])
def check_answer():
    """Check if the provided answer is correct"""
    data = request.get_json()
    if not data or "answer_id" not in data:
        return jsonify({"error": "Missing answer_id"}), 400
    
    plants = load_plants()
    correct_plant = next((p for p in plants if p["id"] == data.get("correct_id")), None)
    
    if not correct_plant:
        return jsonify({"error": "Plant not found"}), 404
    
    answer_plant = next((p for p in plants if p["id"] == data["answer_id"]), None)
    
    is_correct = answer_plant and answer_plant["name"] == correct_plant["name"]
    
    return jsonify({
        "is_correct": is_correct,
        "correct_plant": correct_plant if is_correct else None,
        "selected_plant": answer_plant
    })


@app.route("/api/plants-by-name/<path:name>")
def get_plant_by_name(name):
    """Get plant by name (URL encoded)"""
    plants = load_plants()
    # Decode the name and find plant
    plant = next((p for p in plants if p["name"].lower() == name.lower()), None)
    if plant:
        return jsonify(plant)
    return jsonify({"error": "Plant not found"}), 404


if __name__ == "__main__":
    app.run(debug=True)
