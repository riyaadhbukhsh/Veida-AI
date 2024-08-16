def parse_mc_questions(multiple_choice_questions):
    # Extract the JSON string (ignoring surrounding text)
    start_index = multiple_choice_questions.find('```json') + len('```json')
    end_index = multiple_choice_questions.find('```', start_index)
    json_str = multiple_choice_questions[start_index:end_index].strip()

    # Remove escape sequences if any
    json_str = json_str.replace('\n', '').replace('\\"', '"').replace('\\\'', '\'')

    # Ensure it starts with a proper JSON list or object
    if not json_str.startswith('[') and not json_str.startswith('{'):
        json_str = '[' + json_str

    # Ensure it ends properly
    if not json_str.endswith(']') and not json_str.endswith('}'):
        json_str += ']'

    return json_str