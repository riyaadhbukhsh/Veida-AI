import os
import json
from bson import json_util
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient




app = Flask(__name__)
CORS(app)

##!Mongo Information and client connect @RB
mongo_password = "Ggbxv9Tfq4hVLLuC"
mongo_db_access = f"mongodb+srv://rbukhsh:{mongo_password}@veidaai.6vxc6jh.mongodb.net/?retryWrites=true&w=majority&appName=VeidaAI"
client = MongoClient(mongo_db_access)


##!TESTING DATABASE CONNECTION @RB
db = client.sample_mflix.users
test_data = db.find({}, {"_id": 0})
json_data = json_util.dumps(test_data)
test = json.loads(json_data)

##!END OF TESTING DATABASE CONNECTION @RB

@app.route('/', methods =["GET"])
def home():
    return "Welcome to the home page"


@app.route('/api/test', methods=["GET"])
def index():
    #return jsonify(test)
    return jsonify({"message": "Hello, World!", "people": ["John", "Jane", "Jim"], "test_users_db": test})

if __name__ == '__main__':
    app.run(debug=True, port = 8080)