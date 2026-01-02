import util
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# ✅ LOAD MODEL ON SERVER START
util.load_saved_artifacts()

@app.route("/classify_image", methods=["POST"])
def classify_image():
    image_data = request.form["image_data"]
    response = jsonify(util.classify_image(image_data))
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response

if __name__ == "__main__":
    print("Starting Flask server...")
    app.run(port=5000, debug=True)
