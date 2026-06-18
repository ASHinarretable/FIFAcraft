from flask import Flask, jsonify, request, send_from_directory
import os
import predictor

app = Flask(__name__, static_folder="static")

# Serve frontend
@app.route("/")
def index():
    return send_from_directory("static", "index.html")

@app.route("/<path:path>")
def static_files(path):
    return send_from_directory("static", path)

# API to get teams
@app.route("/api/teams", methods=["GET"])
def get_teams():
    try:
        data = predictor.load_teams_data()
        
        # Format list of clubs and nations sorted alphabetically
        clubs = sorted([
            {"name": k, "rating": v["rating"]} 
            for k, v in data.get("clubs", {}).items()
        ], key=lambda x: x["name"])
        
        nations = sorted([
            {"name": k, "rating": v["rating"]} 
            for k, v in data.get("nations", {}).items()
        ], key=lambda x: x["name"])
        
        return jsonify({
            "success": True,
            "clubs": clubs,
            "nations": nations
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# API to run simulation
@app.route("/api/predict", methods=["GET"])
def predict():
    team_a = request.args.get("team_a")
    team_b = request.args.get("team_b")
    
    if not team_a or not team_b:
        return jsonify({"success": False, "error": "Both team_a and team_b are required"}), 400
        
    try:
        result = predictor.predict_match(team_a, team_b)
        return jsonify({
            "success": True,
            "prediction": result
        })
    except ValueError as ve:
        return jsonify({"success": False, "error": str(ve)}), 404
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
