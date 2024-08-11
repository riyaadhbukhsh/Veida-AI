from flask import Flask, jsonify, request
from pymongo import MongoClient
from dotenv import load_dotenv
import os
from helpers.mongo import (
    create_user,
    delete_user,
    update_user,
    make_course,
    create_or_update_notes,
    delete_notes,
    get_note_names,
    get_note_by_name,
    add_flashcard,
    remove_flashcard,
    get_flashcards,
    get_courses,
    delete_course,
    edit_flashcard,
    edit_note,
    update_lastseen,
    get_next_study_date,
    get_flashcards_with_today_study_date,
    create_or_update_next_study_date,
    get_times_seen,
    update_times_seen
)
from helpers.ai import (
    generate_flashcards,
    generate_notes
)
from PIL import Image, UnidentifiedImageError
import pytesseract
from flask_cors import CORS
import fitz  # PyMuPDF
import io
import datetime


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
    Extracts text from uploaded files (PDF, PPTX, images).

    This endpoint accepts a POST request with a file attachment. It attempts to extract text from the file based on its type. Supported file types include PDF, PPTX, JPG, JPEG, and PNG. The extracted text is then returned in the response.

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
            pdf_document = fitz.open(stream=file.read(), filetype="pdf")
            for page in pdf_document:
                extracted_text += page.get_text() + "\n"
                # Extract text from images in the PDF
                images = page.get_images(full=True)
                for img in images:
                    xref = img[0]
                    base_image = pdf_document.extract_image(xref)
                    image_bytes = base_image["image"]
                    image = Image.open(io.BytesIO(image_bytes))
                    extracted_text += pytesseract.image_to_string(image) + "\n"
        elif file_type in ['jpg', 'jpeg', 'png']:
            image = Image.open(file)
            extracted_text = pytesseract.image_to_string(image)
        else:
            return jsonify({"error": "Unsupported file type"}), 400
        
        # Call the functions with extracted_text
        notes = generate_notes(extracted_text)
        flashcards = generate_flashcards(notes)

        print(notes)
        print(flashcards)

        return jsonify({"extracted_text": extracted_text, "summary_notes": notes, "flashcards": flashcards}), 200
    except UnidentifiedImageError:
        return jsonify({"error": "Unsupported image type"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/webhook/clerk', methods=['POST'])
def clerk_webhook():
    """
    Handles Clerk webhook events for user management.

    This endpoint processes POST requests from Clerk webhook, managing user creation, updates, and deletion in the database.

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


@app.route('/api/make_course', methods=['POST'])
def route_make_course():
    """
    Creates a new course for a user.

    This endpoint accepts a POST request with JSON data containing the clerk_id, course_name, notes, and due_by date.

    Returns:
        tuple: A JSON response indicating success and HTTP status code.
    """
    data = request.json
    clerk_id = data.get('clerk_id')
    course_name = data.get('course_name')
    notes = data.get('notes')
    due_by = datetime.datetime.fromisoformat(data.get('due_by'))  # Parse due_by date

    if not all([clerk_id, course_name, notes, due_by]):
        return jsonify({"error": "Missing required fields"}), 400

    make_course(clerk_id, course_name, notes, due_by)
    return jsonify({"message": "Course created successfully"}), 201

@app.route('/api/create_or_update_notes', methods=['POST'])
def route_create_or_update_notes():
    """
    Creates or updates notes for a specific course.

    This endpoint accepts a POST request with JSON data containing the clerk_id, course_name, notes, and notes_name. It creates or updates the specified notes for the given course.

    Returns:
        tuple: A JSON response indicating success and HTTP status code 200.
    """
    data = request.json
    clerk_id = data.get('clerk_id')
    course_name = data.get('course_name')
    notes = data.get('notes')
    notes_name = data.get('notes_name')

    if not all([clerk_id, course_name, notes, notes_name]):
        return jsonify({"error": "Missing required fields"}), 400

    result = create_or_update_notes(clerk_id, course_name, notes, notes_name)
    return jsonify({"success": result}), 200

@app.route('/api/delete_notes', methods=['DELETE'])
def route_delete_notes():
    """
    Deletes specific notes for a course.

    This endpoint accepts a DELETE request with JSON data containing the clerk_id, course_name, and notes_name. It deletes the specified notes for the given course.

    Returns:
        tuple: A JSON response indicating success and HTTP status code 200.
    """
    data = request.json
    clerk_id = data.get('clerk_id')
    course_name = data.get('course_name')
    notes_name = data.get('notes_name')

    if not all([clerk_id, course_name, notes_name]):
        return jsonify({"error": "Missing required fields"}), 400

    result = delete_notes(clerk_id, course_name, notes_name)
    return jsonify({"success": result}), 200

@app.route('/api/get_note_names', methods=['GET'])
def route_get_note_names():
    """
    Retrieves note names for a course.

    This endpoint accepts a GET request with query parameters clerk_id and course_name. It returns a list of note names for the specified course.

    Returns:
        tuple: A JSON response containing the list of note names and HTTP status code 200.
    """
    clerk_id = request.args.get('clerk_id')
    course_name = request.args.get('course_name')

    if not all([clerk_id, course_name]):
        return jsonify({"error": "Missing required parameters"}), 400

    note_names = get_note_names(clerk_id, course_name)
    return jsonify({"note_names": note_names}), 200

@app.route('/api/get_note', methods=['GET'])
def route_get_note():
    """
    Retrieves the content of a specific note.

    This endpoint accepts a GET request with query parameters clerk_id, course_name, and note_name. It returns the content of the specified note.

    Returns:
        tuple: A JSON response containing the note content and HTTP status code 200.
    """
    clerk_id = request.args.get('clerk_id')
    course_name = request.args.get('course_name')
    note_name = request.args.get('note_name')

    if not all([clerk_id, course_name, note_name]):
        return jsonify({"error": "Missing required parameters"}), 400

    note_content = get_note_by_name(clerk_id, course_name, note_name)
    return jsonify({"note_content": note_content}), 200

@app.route('/api/add_flashcard', methods=['POST'])
def route_add_flashcard():
    """
    Adds a new flashcard to a course.

    This endpoint accepts a POST request with JSON data containing the clerk_id, course_name, front, and back. It adds a new flashcard to the specified course.

    Returns:
        tuple: A JSON response indicating success and HTTP status code 201.
    """
    data = request.json
    clerk_id = data.get('clerk_id')
    course_name = data.get('course_name')
    front = data.get('front')
    back = data.get('back')

    if not all([clerk_id, course_name, front, back]):
        return jsonify({"error": "Missing required fields"}), 400

    add_flashcard(clerk_id, course_name, front, back)
    return jsonify({"message": "Flashcard added successfully"}), 201

@app.route('/api/remove_flashcard', methods=['DELETE'])
def route_remove_flashcard():
    """
    Removes a flashcard from a course.

    This endpoint accepts a DELETE request with JSON data containing the clerk_id, course_name, and card_id. It removes the specified flashcard from the given course.

    Returns:
        tuple: A JSON response indicating success and HTTP status code 200.
    """
    data = request.json
    clerk_id = data.get('clerk_id')
    course_name = data.get('course_name')
    card_id = data.get('card_id')

    if not all([clerk_id, course_name, card_id]):
        return jsonify({"error": "Missing required fields"}), 400

    remove_flashcard(clerk_id, course_name, card_id)
    return jsonify({"message": "Flashcard removed successfully"}), 200

@app.route('/api/get_flashcards', methods=['GET'])
def route_get_flashcards():
    """
    Retrieves all flashcards for a course.

    This endpoint accepts a GET request with query parameters clerk_id and course_name. It returns a list of flashcards for the specified course.

    Returns:
        tuple: A JSON response containing the list of flashcards and HTTP status code 200.
    """
    clerk_id = request.args.get('clerk_id')
    course_name = request.args.get('course_name')

    if not all([clerk_id, course_name]):
        return jsonify({"error": "Missing required parameters"}), 400

    flashcards = get_flashcards(clerk_id, course_name)
    return jsonify({"flashcards": flashcards}), 200

@app.route('/api/get_courses', methods=['GET'])
def route_get_courses():
    """
    Retrieves all courses for a user.

    This endpoint accepts a GET request with query parameter clerk_id. It returns a list of courses for the specified user.

    Returns:
        tuple: A JSON response containing the list of courses and HTTP status code 200.
    """
    clerk_id = request.args.get('clerk_id')

    if not clerk_id:
        return jsonify({"error": "Missing required parameter: clerk_id"}), 400

    courses = get_courses(clerk_id)
    return jsonify({"courses": courses}), 200

@app.route('/api/delete_course', methods=['DELETE'])
def route_delete_course():
    """
    Deletes a course for a user.

    This endpoint accepts a DELETE request with JSON data containing the clerk_id and course_name. It deletes the specified course for the given user.

    Returns:
        tuple: A JSON response indicating success and HTTP status code 200 or 404 if the course is not found.
    """
    data = request.json
    clerk_id = data.get('clerk_id')
    course_name = data.get('course_name')

    if not all([clerk_id, course_name]):
        return jsonify({"error": "Missing required fields"}), 400

    result = delete_course(clerk_id, course_name)
    if result:
        return jsonify({"message": "Course deleted successfully"}), 200
    else:
        return jsonify({"error": "Course not found"}), 404
    

@app.route('/api/update_lastseen', methods=['POST'])
def route_update_lastseen():
    """
    Updates the last seen date of a flashcard.

    This endpoint accepts a POST request with JSON data containing the clerk_id, course_name, and card_id.
    
    Returns:
        tuple: A JSON response indicating success or failure and HTTP status code.
    """
    data = request.json
    clerk_id = data.get('clerk_id')
    course_name = data.get('course_name')
    card_id = data.get('card_id')

    if not all([clerk_id, course_name, card_id]):
        return jsonify({"error": "Missing required fields"}), 400

    success = update_lastseen(clerk_id, course_name, card_id)
    return jsonify({"success": success}), 200 if success else 404

@app.route('/api/edit_flashcard', methods=['POST'])
def route_edit_flashcard():
    """
    Edits an existing flashcard.

    This endpoint accepts a POST request with JSON data containing the clerk_id, course_name, card_id, front, and back.
    
    Returns:
        tuple: A JSON response indicating success or failure and HTTP status code.
    """
    data = request.json
    clerk_id = data.get('clerk_id')
    course_name = data.get('course_name')
    card_id = data.get('card_id')
    front = data.get('front')
    back = data.get('back')

    if not all([clerk_id, course_name, card_id]):
        return jsonify({"error": "Missing required fields"}), 400

    success = edit_flashcard(clerk_id, course_name, card_id, front, back)
    return jsonify({"success": success}), 200 if success else 404

@app.route('/api/edit_note', methods=['POST'])
def route_edit_note():
    """
    Edits an existing note.

    This endpoint accepts a POST request with JSON data containing the clerk_id, course_name, notes_name, and new_content.
    
    Returns:
        tuple: A JSON response indicating success or failure and HTTP status code.
    """
    data = request.json
    clerk_id = data.get('clerk_id')
    course_name = data.get('course_name')
    notes_name = data.get('notes_name')
    new_content = data.get('new_content')

    if not all([clerk_id, course_name, notes_name, new_content]):
        return jsonify({"error": "Missing required fields"}), 400

    success = edit_note(clerk_id, course_name, notes_name, new_content)
    return jsonify({"success": success}), 200 if success else 404

@app.route('/api/create_or_update_next_study_date', methods=['POST'])
def route_create_or_update_next_study_date():
    """
    Creates or updates the next study date for a specific flashcard.

    This endpoint accepts a POST request with JSON data containing the clerk_id, course_name, card_id, and next_study_date.

    Returns:
        tuple: A JSON response indicating success and HTTP status code 200.
    """
    data = request.json
    clerk_id = data.get('clerk_id')
    course_name = data.get('course_name')
    card_id = data.get('card_id')
    next_study_date = data.get('next_study_date')

    if not all([clerk_id, course_name, card_id, next_study_date]):
        return jsonify({"error": "Missing required fields"}), 400

    create_or_update_next_study_date(clerk_id, course_name, card_id, next_study_date)
    return jsonify({"message": "Next study date updated successfully"}), 200

@app.route('/api/get_next_study_date', methods=['GET'])
def route_get_next_study_date():
    """
    Retrieves the next study date for a specific flashcard.

    This endpoint accepts a GET request with query parameters clerk_id, course_name, and card_id.

    Returns:
        tuple: A JSON response containing the next study date and HTTP status code 200.
    """
    clerk_id = request.args.get('clerk_id')
    course_name = request.args.get('course_name')
    card_id = request.args.get('card_id')

    if not all([clerk_id, course_name, card_id]):
        return jsonify({"error": "Missing required parameters"}), 400

    next_study_date = get_next_study_date(clerk_id, course_name, card_id)
    return jsonify({"next_study_date": next_study_date}), 200

@app.route('/api/get_flashcards_today', methods=['GET'])
def route_get_flashcards_today():
    """
    Retrieves all flashcards with a next study date of today.

    This endpoint accepts a GET request with query parameter clerk_id.

    Returns:
        tuple: A JSON response containing the list of flashcards and HTTP status code 200.
    """
    clerk_id = request.args.get('clerk_id')

    if not clerk_id:
        return jsonify({"error": "Missing required parameter: clerk_id"}), 400

    flashcards_today = get_flashcards_with_today_study_date(clerk_id)
    return jsonify({"flashcards": flashcards_today}), 200

@app.route('/api/update_times_seen', methods=['POST'])
def route_update_times_seen():
    """
    Updates the times_seen count for a specific flashcard.

    This endpoint accepts a POST request with JSON data containing the clerk_id, course_name, and card_id.
    
    Returns:
        tuple: A JSON response indicating success and HTTP status code.
    """
    data = request.json
    clerk_id = data.get('clerk_id')
    course_name = data.get('course_name')
    card_id = data.get('card_id')

    if not all([clerk_id, course_name, card_id]):
        return jsonify({"error": "Missing required fields"}), 400

    update_times_seen(clerk_id, course_name, card_id)
    return jsonify({"message": "Times seen updated successfully"}), 200


if __name__ == '__main__':
    
    app.run(debug=True, port=8080)