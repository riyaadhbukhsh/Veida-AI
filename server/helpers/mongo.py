from bson import ObjectId
from dotenv import load_dotenv
from pymongo import MongoClient
import os
import datetime

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

#untested
def get_note_names(clerk_id):
    """
    Get the names of all notes for a user.

    Args:
        clerk_id (str): The Clerk ID of the user.

    Returns:
        list: A list of note names for the user, or an empty list if the user has no notes.
    """
    notes_collection = db.notes
    user_notes = notes_collection.find_one({'clerk_id': clerk_id})
    if user_notes and 'note_data' in user_notes:
        return list(user_notes['note_data'].keys())
    return []

def get_note_by_name(clerk_id, note_name):
    """
    Get a specific note for a user by its name.

    Args:
        clerk_id (str): The Clerk ID of the user.
        note_name (str): The name of the note to retrieve.

    Returns:
        str: The content of the note if found, None otherwise.
    """
    notes_collection = db.notes
    user_notes = notes_collection.find_one({'clerk_id': clerk_id})
    if user_notes and 'note_data' in user_notes:
        return user_notes['note_data'].get(note_name)
    return None


# Assuming you have a MongoDB connection established
client = MongoClient('your_mongodb_uri')
db = client['VeidaAI']
users_collection = db['users']

def update_last_seen(clerk_id, class_name, deck_name, card_id):
    users_collection.update_one(
        {"clerk_id": clerk_id, "classes.name": class_name, f"classes.$.decks.{deck_name}.cards.id": card_id},
        {"$set": {f"classes.$.decks.{deck_name}.cards.$.last_seen": datetime.now()}}
    )

def make_deck(clerk_id, class_name, deck_name, cards, due_by):
    new_deck = {
        deck_name: {
            "cards": [{"id": str(ObjectId()), "front": card[0], "back": card[1], "last_seen": None, "due_by": due_by} for card in cards],
            "due_by": due_by
        }
    }
    users_collection.update_one(
        {"clerk_id": clerk_id, "classes.name": class_name},
        {"$set": {f"classes.$.decks.{deck_name}": new_deck[deck_name]}}
    )

def delete_deck(clerk_id, class_name, deck_name):
    users_collection.update_one(
        {"clerk_id": clerk_id, "classes.name": class_name},
        {"$unset": {f"classes.$.decks.{deck_name}": ""}}
    )

def remove_card(clerk_id, class_name, deck_name, card_id):
    users_collection.update_one(
        {"clerk_id": clerk_id, "classes.name": class_name},
        {"$pull": {f"classes.$.decks.{deck_name}.cards": {"id": card_id}}}
    )

def add_card(clerk_id, class_name, deck_name, front, back):
    new_card = {"id": str(ObjectId()), "front": front, "back": back, "last_seen": None, "due_by": None}
    users_collection.update_one(
        {"clerk_id": clerk_id, "classes.name": class_name},
        {"$push": {f"classes.$.decks.{deck_name}.cards": new_card}}
    )

def edit_deck(clerk_id, class_name, old_deck_name, new_deck_name=None, new_due_by=None):
    update_fields = {}
    if new_deck_name:
        update_fields[f"classes.$.decks.{new_deck_name}"] = f"$classes.$.decks.{old_deck_name}"
        update_fields[f"classes.$.decks.{old_deck_name}"] = ""
    if new_due_by:
        update_fields[f"classes.$.decks.{old_deck_name}.due_by"] = new_due_by
    
    users_collection.update_one(
        {"clerk_id": clerk_id, "classes.name": class_name},
        {"$rename" if new_deck_name else "$set": update_fields}
    )
    if new_deck_name:
        users_collection.update_one(
            {"clerk_id": clerk_id, "classes.name": class_name},
            {"$unset": {f"classes.$.decks.{old_deck_name}": ""}}
        )

def edit_class(clerk_id, old_class_name, new_class_name):
    users_collection.update_one(
        {"clerk_id": clerk_id, "classes.name": old_class_name},
        {"$set": {"classes.$.name": new_class_name}}
    )

def get_flashcards(clerk_id, class_name=None, deck_name=None):
    query = {"clerk_id": clerk_id}
    if class_name:
        query["classes.name"] = class_name
    
    projection = {"classes": 1, "_id": 0}
    if class_name and deck_name:
        projection[f"classes.decks.{deck_name}"] = 1
    
    result = users_collection.find_one(query, projection)
    return result["classes"] if result else None