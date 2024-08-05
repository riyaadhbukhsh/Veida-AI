from flask import Flask, jsonify, request, render_template_string
from pymongo import MongoClient
from dotenv import load_dotenv
import os
from helpers.mongo import create_user, update_user, delete_user, create_or_update_notes, delete_notes

load_dotenv()

app = Flask(__name__)

# MongoDB setup
mongo_uri = os.getenv('MONGO_URI')
client = MongoClient(mongo_uri)
db = client['VeidaAI']

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

if __name__ == '__main__':
    app.run(debug=True, port=8080)