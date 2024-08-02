from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# tetsing cors
@app.route('/api/test', methods=["GET"])
def index():
    return jsonify({"message": "Hello, World!", "people": ["John", "Jane", "Jim"]})


if __name__ == '__main__':
    app.run(debug=True, port = 8080)