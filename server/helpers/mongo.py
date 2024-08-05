from bson import ObjectId
from dotenv import load_dotenv
from pymongo import MongoClient
import os

load_dotenv()

# MongoDB setup
mongo_uri = os.getenv('MONGO_URI')
client = MongoClient(mongo_uri)
db = client['VeidaAI']

def create_user(user_data):
    """
    Create a new user in the database.

    Args:
        user_data (dict): A dictionary containing user information from Clerk.

    Returns:
        None
    """
    users_collection = db.users
    users_collection.insert_one({
        'clerk_id': user_data['id'],
        'email': user_data['email_addresses'][0]['email_address'],
        'username': user_data.get('username'),
        'first_name': user_data.get('first_name'),
        'last_name': user_data.get('last_name'),
        'created_at': user_data['created_at']
    })

def update_user(user_data):
    """
    Update an existing user's information in the database.

    Args:
        user_data (dict): A dictionary containing updated user information from Clerk.

    Returns:
        None
    """
    users_collection = db.users
    users_collection.update_one(
        {'clerk_id': user_data['id']},
        {'$set': {
            'email': user_data['email_addresses'][0]['email_address'],
            'username': user_data.get('username'),
            'first_name': user_data.get('first_name'),
            'last_name': user_data.get('last_name'),
        }}
    )

def delete_user(user_data):
    """
    Delete a user from the database.

    Args:
        user_data (dict): A dictionary containing user information from Clerk.

    Returns:
        None
    """
    users_collection = db.users
    users_collection.delete_one({'clerk_id': user_data['id']})
    
def create_or_update_notes(clerk_id, notes, notes_name):
    """
    Create or update notes for a user.

    Args:
        clerk_id (str): The Clerk ID of the user.
        notes (str): The content of the notes.
        notes_name (str): The name of the notes.

    Returns:
        bool: True if the notes were created or updated successfully, False if the user was not found.
    """
    users_collection = db.users
    notes_collection = db.notes

    # Check if the user exists
    user = users_collection.find_one({'clerk_id': clerk_id})
    if not user:
        return False  # User not found

    # User exists, proceed with creating or updating notes
    result = notes_collection.update_one(
        {'clerk_id': clerk_id},
        {'$set': {f'note_data.{notes_name}': notes}},
        upsert=True
    )
    return result.matched_count > 0 or result.upserted_id is not None

def delete_notes(clerk_id, notes_name):
    """
    Delete specific notes for a user.

    Args:
        clerk_id (str): The Clerk ID of the user.
        notes_name (str): The name of the notes to be deleted.

    Returns:
        bool: True if the notes were deleted successfully, False if the notes or user were not found.
    """
    notes_collection = db.notes
    result = notes_collection.update_one(
        {'clerk_id': clerk_id, f'note_data.{notes_name}': {'$exists': True}},
        {'$unset': {f'note_data.{notes_name}': ''}}
    )
    if result.matched_count == 0:
        return False
    return True

