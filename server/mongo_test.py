import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

mongo_uri = os.getenv('MONGO_URI')
print(f"Attempting to connect with URI: {mongo_uri}")

try:
    client = MongoClient(mongo_uri)
    client.admin.command('ping')
    print("Successfully connected to MongoDB!")
except Exception as e:
    print(f"Failed to connect to MongoDB. Error: {e}")