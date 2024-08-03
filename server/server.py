from flask import Flask, jsonify
from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)

# MongoDB setup
mongo_uri = os.getenv('MONGO_URI')
client = MongoClient(mongo_uri)
db = client['VeidaAI']  # Replace 'VeidaAI' with your actual database name

@app.route('/api/test', methods=["GET"])
def index():
    try:
        # Use a specific collection, e.g., 'users'
        collection = db.users
        test_data = list(collection.find({}, {"_id": 0}).limit(10))
        return jsonify({"test_users_db": test_data})
    except Exception as e:
        app.logger.error(f"Error accessing MongoDB: {str(e)}")
        return jsonify({"error": "An error occurred while accessing the database."}), 500

if __name__ == '__main__':
    app.run(debug=True, port=8080)