from flask import Flask, jsonify, request, render_template
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
    update_times_seen,
    check_premium_status, 
    update_premium_status,
    update_subscription_id
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
import stripe

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# MongoDB setup
mongo_uri = os.getenv('MONGO_URI')
client = MongoClient(mongo_uri)
db = client['VeidaAI']

# Set your Stripe API key
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
endpoint_secret = os.getenv('STRIPE_WEBHOOK_SECRET')

@app.route('/')
def index():
  return render_template('index.html')


@app.route('/webhook/clerk', methods=['POST'])
def clerk_webhook():
    event = request.json
    event_type = event.get('type')
    user_data = event.get('data')

    if event_type == 'user.created':
        create_user(user_data)
        check_premium_status(user_data['id'])  # Check premium status on user creation
    elif event_type == 'user.updated':
        update_user(user_data)
        check_premium_status(user_data['id'])  # Check premium status on user update
    elif event_type == 'user.deleted':
        delete_user(user_data)

    return jsonify({"success": True}), 200


stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
endpoint_secret = os.getenv('STRIPE_WEBHOOK_SECRET')

@app.route('/api/create-checkout-session', methods=['POST'])
def create_checkout_session():
    data = request.json
    clerk_id = data.get('clerk_id')

    if not clerk_id:
        return jsonify({"error": "Missing required parameter: clerk_id"}), 400

    session = stripe.checkout.Session.create(
        payment_method_types=['card'],
        line_items=[
            {
                'price': 'price_1PnXLSGxUp9wQ6awUitR5t0v', 
                'quantity': 1,
            },
        ],
        mode='subscription',
        success_url=os.getenv('STRIPE_SUCCESS_URL'),  # Use environment variable
        cancel_url=os.getenv('STRIPE_CANCEL_URL'),    # Use environment variable
        subscription_data={
            'metadata': {
                'clerk_id': clerk_id  # Store clerk_id in metadata
            }
        }
    )

    return jsonify({'url': session.url})

@app.route('/api/cancel-subscription', methods=['POST'])
def cancel_subscription():
       data = request.json
       clerk_id = data.get('clerk_id')

       if not clerk_id:
           print("Missing clerk_id")
           return jsonify({"error": "Missing required parameter: clerk_id"}), 400

       print(f"Received clerk_id: {clerk_id}")

       # Retrieve the user's subscription from the database
       user = db.users.find_one({'clerk_id': clerk_id})
       subscription_id = user.get('subscription_id')

       if not subscription_id:
           print("No active subscription found")
           return jsonify({"error": "No active subscription found"}), 400

       try:
           # Cancel the subscription using the Stripe API
           stripe.Subscription.delete(subscription_id)

           # Update the user's premium status in the database
           update_subscription_id(clerk_id, None)
           update_premium_status(clerk_id, False)

           return jsonify({"message": "Subscription canceled successfully"}), 200
       except stripe.error.StripeError as e:
           return jsonify({"error": str(e)}), 500
    
    
@app.route('/webhook', methods=['POST'])
def webhook():
    event = None
    payload = request.data
    sig_header = request.headers.get('STRIPE_SIGNATURE')
    if not sig_header:
        return jsonify({"error": "Missing Stripe signature header"}), 400

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except ValueError as e:
        # Invalid payload
        print(f"Invalid payload: {e}")
        return jsonify({"error": "Invalid payload"}), 400
    except stripe.error.SignatureVerificationError as e:
        return jsonify({"error": "Invalid signature"}), 400

    if event['type'] == 'invoice.payment_succeeded':
        invoice = event['data']['object']
        subscription_id = invoice['subscription']
        subscription = stripe.Subscription.retrieve(subscription_id)
        clerk_id = subscription['metadata'].get('clerk_id')
        if clerk_id:
            update_premium_status(clerk_id, True)
            update_subscription_id(clerk_id, subscription_id)
            print(f"Updated premium status and subscription ID for clerk_id: {clerk_id}")
        else:
            print("clerk_id not found in metadata")
        print("Invoice payment succeeded event received")

    return jsonify(success=True)


@app.route('/api/check_premium_status', methods=['GET'])
def route_check_premium_status():
    clerk_id = request.args.get('clerk_id')

    if not clerk_id:
        return jsonify({"error": "Missing required parameter: clerk_id"}), 400

    is_premium = check_premium_status(clerk_id)
    return jsonify({"premium": is_premium}), 200


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

        return jsonify({"notes": notes, "flashcards": flashcards}), 200
    except UnidentifiedImageError:
        return jsonify({"error": "Unsupported image type"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500



@app.route('/api/create_course', methods=['POST'])
def create_course():
    data = request.json
    clerk_id = data.get('clerk_id')
    course_name = data.get('course_name')
    description = data.get('description', '')
    exam_date = data.get('exam_date', '')
    notes = data.get('notes', {})
    flashcards = data.get('flashcards', [])

    if not all([clerk_id, course_name, description, exam_date]):
        return jsonify({"error": "Missing required fields"}), 400

    make_course(clerk_id, course_name, description, exam_date, notes, flashcards)
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
def get_courses_route():
    clerk_id = request.args.get('clerk_id')

    if not clerk_id:
        return jsonify({"error": "Missing required parameter: clerk_id"}), 400

    courses = get_courses(clerk_id)
    return jsonify({"courses": courses}), 200
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