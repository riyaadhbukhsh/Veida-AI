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
courses_collection = db['courses']

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



def make_course(clerk_id, course_name, notes):
    """
    Create a new course for a user.

    Args:
        clerk_id (str): The Clerk ID of the user.
        course_name (str): The name of the course.
        notes (dict): A dictionary of notes for the course.

    Returns:
        None
    """
    new_course = {
        "course_name": course_name,
        "notes": notes,
        "flashcards": [],
        "created_at": datetime.datetime.now(),
        "updated_at": datetime.datetime.now()
    }
    courses_collection.update_one(
        {"clerk_id": clerk_id},
        {"$addToSet": {"courses": new_course}},
        upsert=True
    )

def create_or_update_notes(clerk_id, course_name, notes, notes_name):
    """
    Create or update notes for a specific course.

    Args:
        clerk_id (str): The Clerk ID of the user.
        course_name (str): The name of the course.
        notes (str): The notes to be created or updated.
        notes_name (str): The name of the notes.

    Returns:
        bool: True if the operation was successful, False otherwise.
    """
    result = courses_collection.update_one(
        {"clerk_id": clerk_id, "courses.course_name": course_name},
        {"$set": {f"courses.$.notes.{notes_name}": notes}},
        upsert=True
    )
    return result.matched_count > 0 or result.upserted_id is not None

def delete_notes(clerk_id, course_name, notes_name):
    """
    Delete specific notes for a course.

    Args:
        clerk_id (str): The Clerk ID of the user.
        course_name (str): The name of the course.
        notes_name (str): The name of the notes to be deleted.

    Returns:
        bool: True if the operation was successful, False otherwise.
    """
    result = courses_collection.update_one(
        {"clerk_id": clerk_id, "courses.course_name": course_name},
        {"$unset": {f"courses.$.notes.{notes_name}": ""}}
    )
    return result.matched_count > 0

def get_note_names(clerk_id, course_name):
    """
    Retrieve the names of all notes for a specific course.

    Args:
        clerk_id (str): The Clerk ID of the user.
        course_name (str): The name of the course.

    Returns:
        list: A list of note names.
    """
    user_notes = courses_collection.find_one({'clerk_id': clerk_id, "courses.course_name": course_name})
    if user_notes and 'courses' in user_notes:
        for course in user_notes['courses']:
            if course['course_name'] == course_name:
                return list(course['notes'].keys())
    return []

def get_note_by_name(clerk_id, course_name, note_name):
    """
    Retrieve a specific note by its name for a course.

    Args:
        clerk_id (str): The Clerk ID of the user.
        course_name (str): The name of the course.
        note_name (str): The name of the note.

    Returns:
        str: The content of the note, or None if not found.
    """
    user_notes = courses_collection.find_one({'clerk_id': clerk_id, "courses.course_name": course_name})
    if user_notes and 'courses' in user_notes:
        for course in user_notes['courses']:
            if course['course_name'] == course_name:
                return course['notes'].get(note_name)
    return None

def add_flashcard(clerk_id, course_name, front, back):
    """
    Add a new flashcard to a course.

    Args:
        clerk_id (str): The Clerk ID of the user.
        course_name (str): The name of the course.
        front (str): The front side of the flashcard.
        back (str): The back side of the flashcard.

    Returns:
        None
    """
    new_card = {"id": str(ObjectId()), "front": front, "back": back, "last_seen": None}
    courses_collection.update_one(
        {"clerk_id": clerk_id, "courses.course_name": course_name},
        {"$push": {"courses.$.flashcards": new_card}}
    )

def remove_flashcard(clerk_id, course_name, card_id):
    """
    Remove a flashcard from a course.

    Args:
        clerk_id (str): The Clerk ID of the user.
        course_name (str): The name of the course.
        card_id (str): The ID of the flashcard to be removed.

    Returns:
        None
    """
    courses_collection.update_one(
        {"clerk_id": clerk_id, "courses.course_name": course_name},
        {"$pull": {"courses.$.flashcards": {"id": card_id}}}
    )

def get_flashcards(clerk_id, course_name):
    """
    Retrieve all flashcards for a specific course.

    Args:
        clerk_id (str): The Clerk ID of the user.
        course_name (str): The name of the course.

    Returns:
        list: A list of flashcards, or None if not found.
    """
    user_courses = courses_collection.find_one({"clerk_id": clerk_id})
    if user_courses and 'courses' in user_courses:
        for course in user_courses['courses']:
            if course['course_name'] == course_name:
                return course['flashcards']
    return None

def get_courses(clerk_id):
    """
    Retrieve all courses for a user.

    Args:
        clerk_id (str): The Clerk ID of the user.

    Returns:
        list: A list of courses, or None if not found.
    """
    user_courses = courses_collection.find_one({"clerk_id": clerk_id}, {"courses": 1, "_id": 0})
    return user_courses['courses'] if user_courses and 'courses' in user_courses else []

def delete_course(clerk_id, course_name):
    """
    Delete a course for a user.

    Args:
        clerk_id (str): The Clerk ID of the user.
        course_name (str): The name of the course to be deleted.

    Returns:
        bool: True if the operation was successful, False otherwise.
    """
    result = courses_collection.update_one(
        {"clerk_id": clerk_id},
        {"$pull": {"courses": {"course_name": course_name}}}
    )
    return result.deleted_count > 0

def update_lastseen(clerk_id, course_name, card_id):
    """
    Update the last seen date of a flashcard.

    Args:
        clerk_id (str): The Clerk ID of the user.
        course_name (str): The name of the course.
        card_id (str): The ID of the flashcard.

    Returns:
        bool: True if the operation was successful, False otherwise.
    """
    result = courses_collection.update_one(
        {"clerk_id": clerk_id, "courses.course_name": course_name, "courses.flashcards.id": card_id},
        {"$set": {"courses.$[course].flashcards.$[card].last_seen": datetime.datetime.now()}},
        array_filters=[{"course.course_name": course_name}, {"card.id": card_id}]
    )
    return result.modified_count > 0

def edit_flashcard(clerk_id, course_name, card_id, front=None, back=None):
    """
    Edit an existing flashcard.

    Args:
        clerk_id (str): The Clerk ID of the user.
        course_name (str): The name of the course.
        card_id (str): The ID of the flashcard.
        front (str): The new front side of the flashcard (optional).
        back (str): The new back side of the flashcard (optional).

    Returns:
        bool: True if the operation was successful, False otherwise.
    """
    update_fields = {}
    if front is not None:
        update_fields["courses.$[course].flashcards.$[card].front"] = front
    if back is not None:
        update_fields["courses.$[course].flashcards.$[card].back"] = back

    result = courses_collection.update_one(
        {"clerk_id": clerk_id, "courses.course_name": course_name, "courses.flashcards.id": card_id},
        {"$set": update_fields},
        array_filters=[{"course.course_name": course_name}, {"card.id": card_id}]
    )
    return result.modified_count > 0

def edit_note(clerk_id, course_name, notes_name, new_content):
    """
    Edit an existing note.

    Args:
        clerk_id (str): The Clerk ID of the user.
        course_name (str): The name of the course.
        notes_name (str): The name of the note to be edited.
        new_content (str): The new content for the note.

    Returns:
        bool: True if the operation was successful, False otherwise.
    """
    result = courses_collection.update_one(
        {"clerk_id": clerk_id, "courses.course_name": course_name},
        {"$set": {f"courses.$.notes.{notes_name}": new_content}}
    )
    return result.modified_count > 0