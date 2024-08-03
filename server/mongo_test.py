#Creating test collection and db to test the connection to the database
##!Created by @RB 
import os
import json
from bson import json_util
from pprint import pprint
from pymongo import MongoClient



### Run this in the 
mongo_password = "Ggbxv9Tfq4hVLLuC"


client = MongoClient(f"mongodb+srv://rbukhsh:{mongo_password}@veidaai.6vxc6jh.mongodb.net/?retryWrites=true&w=majority&appName=VeidaAI")



db = client.sample_mflix.users
test_data = db.find({}, {"_id": 0})
json_data = json_util.dumps(test_data)


test = json.loads(json_data)


pprint(test)


