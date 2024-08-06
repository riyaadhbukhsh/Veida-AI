from flask import Flask, jsonify, request, render_template_string
from pymongo import MongoClient
from dotenv import load_dotenv
import os
from helpers.mongo import create_user, update_user, delete_user #user funcs
from helpers.mongo import create_or_update_notes, delete_notes, get_note_names, get_note_by_name #notes funcs
from helpers.mongo import update_last_seen, make_deck, delete_deck, remove_card, add_card, edit_deck, edit_class, get_flashcards #flashcard funcs
from datetime import datetime

from pdf2image import convert_from_bytes
from pptx import Presentation
from PIL import Image, UnidentifiedImageError
import pytesseract
from flask_cors import CORS
import io
import PyPDF2


load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# MongoDB setup
mongo_uri = os.getenv('MONGO_URI')
client = MongoClient(mongo_uri)
db = client['VeidaAI']

@app.route('/api/extract_text', methods=['POST'])
def extract_text():
    """
    Extract text from uploaded files (PDF, PPTX, images).
    
    Returns:
        tuple: A JSON response containing the extracted text and HTTP status code.
    """
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    file_type = file.filename.split('.')[-1].lower()
    extracted_text = ""

    try:
        if file_type == 'pdf':
            pdf_reader = PyPDF2.PdfReader(file)
            for page in pdf_reader.pages:
                extracted_text += page.extract_text() + "\n"
            file.seek(0)
            images = convert_from_bytes(file.read())
            for image in images:
                extracted_text += pytesseract.image_to_string(image) + "\n"
        elif file_type in ['jpg', 'jpeg', 'png']:
            image = Image.open(file)
            extracted_text = pytesseract.image_to_string(image)
        else:
            return jsonify({"error": "Unsupported file type"}), 400

        return jsonify({"extracted_text": extracted_text}), 200
    except UnidentifiedImageError:
        return jsonify({"error": "Unsupported image type"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/webhook/clerk', methods=['POST'])
def clerk_webhook():
    """
    Handle Clerk webhook events for user management.

    This endpoint processes POST requests from Clerk webhook,
    managing user creation, updates, and deletion in the database.

    Returns:
        tuple: A JSON response indicating success and HTTP status code 200.
    """
    event = request.json
    event_type = event.get('type')
    user_data = event.get('data')

    if event_type == 'user.created':
        create_user(user_data)
    elif event_type == 'user.updated':
        update_user(user_data)
    elif event_type == 'user.deleted':
        delete_user(user_data)

    return jsonify({"success": True}), 200


@app.route('/api/createnotes', methods=['POST'])
def handle_notes():
    """
    Create or update notes for a user.

    This endpoint processes POST requests to create or update notes
    for a specific user identified by their Clerk ID.

    Returns:
        tuple: A JSON response and appropriate HTTP status code.
    """
    data = request.json
    clerk_id = data.get('clerk_id')
    notes = data.get('notes')
    notes_name = data.get('notes_name')

    if not all([clerk_id, notes, notes_name]):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        result = create_or_update_notes(clerk_id, notes, notes_name)
        if result:
            return jsonify({"success": True, "message": "Notes created or updated successfully"}), 200
        else:
            return jsonify({"error": "User not found"}), 404
    except Exception as e:
        app.logger.error(f"Error creating or updating notes: {str(e)}")
        return jsonify({"error": "An error occurred while processing the notes"}), 500


@app.route('/api/deletenotes', methods=['DELETE'])
def handle_delete_notes():
    """
    Delete specific notes for a user.

    This endpoint processes DELETE requests to remove specific notes
    for a user identified by their Clerk ID.

    Returns:
        tuple: A JSON response and appropriate HTTP status code.
    """
    data = request.json
    clerk_id = data.get('clerk_id')
    notes_name = data.get('notes_name')

    if not all([clerk_id, notes_name]):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        result = delete_notes(clerk_id, notes_name)
        if result:
            return jsonify({"success": True, "message": "Notes deleted successfully"}), 200
        else:
            return jsonify({"error": "Note not found or user doesn't exist"}), 404
    except Exception as e:
        app.logger.error(f"Error deleting notes: {str(e)}")
        return jsonify({"error": "An error occurred while deleting the notes"}), 500




#Untested
@app.route('/api/getnotes', methods=['GET'])
def handle_get_note_names():
    """
    Get the names of all notes for a user.

    This endpoint processes GET requests to retrieve the names of all notes
    for a user identified by their Clerk ID.

    Returns:
        tuple: A JSON response and appropriate HTTP status code.
    """
    clerk_id = request.args.get('clerk_id')

    if not clerk_id:
        return jsonify({"error": "Missing clerk_id parameter"}), 400

    try:
        note_names = get_note_names(clerk_id)
        return jsonify({"success": True, "note_names": note_names}), 200
    except Exception as e:
        app.logger.error(f"Error retrieving note names: {str(e)}")
        return jsonify({"error": "An error occurred while retrieving note names"}), 500


@app.route('/api/getnote', methods=['GET'])
def handle_get_note():
    """
    Get a specific note for a user by its name.

    This endpoint processes GET requests to retrieve a specific note
    for a user identified by their Clerk ID and the note name.

    Returns:
        tuple: A JSON response and appropriate HTTP status code.
    """
    clerk_id = request.args.get('clerk_id')
    note_name = request.args.get('note_name')

    if not all([clerk_id, note_name]):
        return jsonify({"error": "Missing required parameters"}), 400

    try:
        note_content = get_note_by_name(clerk_id, note_name)
        if note_content is not None:
            return jsonify({"success": True, "note_content": note_content}), 200
        else:
            return jsonify({"error": "Note not found"}), 404
    except Exception as e:
        app.logger.error(f"Error retrieving note: {str(e)}")
        return jsonify({"error": "An error occurred while retrieving the note"}), 500


@app.route('/api/update_last_seen', methods=['POST'])
def route_update_last_seen():
    """
    Update the last seen timestamp for a specific flashcard.

    This endpoint processes POST requests to update the 'last_seen' timestamp
    for a specific flashcard identified by its card_id, within a specific deck
    and class for a user.

    Returns:
        tuple: A JSON response and appropriate HTTP status code.
    """
    data = request.json
    clerk_id = data.get('clerk_id')
    class_name = data.get('class_name')
    deck_name = data.get('deck_name')
    card_id = data.get('card_id')
    
    if all([clerk_id, class_name, deck_name, card_id]):
        update_last_seen(clerk_id, class_name, deck_name, card_id)
        return jsonify({"message": "Last seen updated successfully"}), 200
    return jsonify({"error": "Missing required fields"}), 400

@app.route('/api/make_deck', methods=['POST'])
def route_make_deck():
    """
    Create a new deck of flashcards.

    This endpoint processes POST requests to create a new deck of flashcards
    for a specific class and user. It requires the clerk_id, class_name, 
    deck_name, cards, and due_by date.

    Returns:
        tuple: A JSON response and appropriate HTTP status code.
    """
    data = request.json
    clerk_id = data.get('clerk_id')
    class_name = data.get('class_name')
    deck_name = data.get('deck_name')
    cards = data.get('cards')
    due_by = datetime.fromisoformat(data.get('due_by'))
    
    if all([clerk_id, class_name, deck_name, cards, due_by]):
        make_deck(clerk_id, class_name, deck_name, cards, due_by)
        return jsonify({"message": "Deck created successfully"}), 201
    return jsonify({"error": "Missing required fields"}), 400

@app.route('/api/delete_deck', methods=['DELETE'])
def route_delete_deck():
    """
    Delete a specific deck of flashcards.

    This endpoint processes DELETE requests to remove a specific deck
    of flashcards for a user within a specific class.

    Returns:
        tuple: A JSON response and appropriate HTTP status code.
    """
    data = request.json
    clerk_id = data.get('clerk_id')
    class_name = data.get('class_name')
    deck_name = data.get('deck_name')
    
    if all([clerk_id, class_name, deck_name]):
        delete_deck(clerk_id, class_name, deck_name)
        return jsonify({"message": "Deck deleted successfully"}), 200
    return jsonify({"error": "Missing required fields"}), 400

@app.route('/api/remove_card', methods=['DELETE'])
def route_remove_card():
    """
    Remove a specific flashcard from a deck.

    This endpoint processes DELETE requests to remove a specific flashcard
    identified by its card_id from a deck within a specific class for a user.

    Returns:
        tuple: A JSON response and appropriate HTTP status code.
    """
    data = request.json
    clerk_id = data.get('clerk_id')
    class_name = data.get('class_name')
    deck_name = data.get('deck_name')
    card_id = data.get('card_id')
    
    if all([clerk_id, class_name, deck_name, card_id]):
        remove_card(clerk_id, class_name, deck_name, card_id)
        return jsonify({"message": "Card removed successfully"}), 200
    return jsonify({"error": "Missing required fields"}), 400

@app.route('/api/add_card', methods=['POST'])
def route_add_card():
    """
    Add a new flashcard to a deck.

    This endpoint processes POST requests to add a new flashcard to a specific
    deck within a class for a user. It requires the front and back content of the card.

    Returns:
        tuple: A JSON response and appropriate HTTP status code.
    """
    data = request.json
    clerk_id = data.get('clerk_id')
    class_name = data.get('class_name')
    deck_name = data.get('deck_name')
    front = data.get('front')
    back = data.get('back')
    
    if all([clerk_id, class_name, deck_name, front, back]):
        add_card(clerk_id, class_name, deck_name, front, back)
        return jsonify({"message": "Card added successfully"}), 201
    return jsonify({"error": "Missing required fields"}), 400

@app.route('/api/edit_deck', methods=['PUT'])
def route_edit_deck():
    """
    Edit a deck's details.

    This endpoint processes PUT requests to update a deck's name or due date.
    It allows changing the deck name, the due date, or both.

    Returns:
        tuple: A JSON response and appropriate HTTP status code.
    """
    data = request.json
    clerk_id = data.get('clerk_id')
    class_name = data.get('class_name')
    old_deck_name = data.get('old_deck_name')
    new_deck_name = data.get('new_deck_name')
    new_due_by = data.get('new_due_by')
    
    if new_due_by:
        new_due_by = datetime.fromisoformat(new_due_by)
    
    if all([clerk_id, class_name, old_deck_name]):
        edit_deck(clerk_id, class_name, old_deck_name, new_deck_name, new_due_by)
        return jsonify({"message": "Deck updated successfully"}), 200
    return jsonify({"error": "Missing required fields"}), 400

@app.route('/api/edit_class', methods=['PUT'])
def route_edit_class():
    """
    Edit a class name.

    This endpoint processes PUT requests to update a class name for a user.

    Returns:
        tuple: A JSON response and appropriate HTTP status code.
    """
    data = request.json
    clerk_id = data.get('clerk_id')
    old_class_name = data.get('old_class_name')
    new_class_name = data.get('new_class_name')
    
    if all([clerk_id, old_class_name, new_class_name]):
        edit_class(clerk_id, old_class_name, new_class_name)
        return jsonify({"message": "Class updated successfully"}), 200
    return jsonify({"error": "Missing required fields"}), 400

@app.route('/api/get_flashcards', methods=['GET'])
def route_get_flashcards():
    """
    Retrieve flashcards for a user.

    This endpoint processes GET requests to retrieve flashcards for a user.
    It can return all flashcards for a user, or filter by class and deck.

    Returns:
        tuple: A JSON response containing the flashcards and appropriate HTTP status code.
    """
    clerk_id = request.args.get('clerk_id')
    class_name = request.args.get('class_name')
    deck_name = request.args.get('deck_name')
    
    if clerk_id:
        flashcards = get_flashcards(clerk_id, class_name, deck_name)
        return jsonify(flashcards), 200
    return jsonify({"error": "Missing clerk_id"}), 400

if __name__ == '__main__':
    app.run(debug=True, port=8080)