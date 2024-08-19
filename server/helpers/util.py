import datetime
from datetime import timedelta

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


def generate_review_dates(learned_date, exam_date):
    
    given_dates_list = [learned_date]

    # Create a list of days to add Goal to long term memory 
    days_to_add = [1,3,7,21,30,45,60]

    # Convert exam date to datetime object
    exam_date = datetime.datetime.strptime(exam_date, '%Y-%m-%d %H:%M:%S')

    # Calculate new dates for each given date
    new_dates_list = []
    review_dates = {}

    for given_date_str in given_dates_list:
        # converts given date to mm/dd/yyyy and adds to dictionary
        given_date = datetime.datetime.strptime(given_date_str, '%Y-%m-%d %H:%M:%S')
        new_dates = []
        # calculates list of review dates
        for days in days_to_add:
            new_date = given_date + timedelta(days=days)
            # If the exam date is before the 6th review date, alter the algorithm to ensure reviews are not after the exam date
            if new_date > exam_date:
                break
            new_date_str = new_date.strftime('%Y-%m-%d')
            new_dates.append(new_date_str)
        new_dates_list.extend(new_dates)  # Extend the list with new dates

    # If the exam date is within 21 days of the learned date, add the exam date as a review date
    if (exam_date - given_date).days <= 21:
        exam_date_str = exam_date.strftime('%Y-%m-%d')
        new_dates_list.append(exam_date_str)

    for i in range(len(new_dates_list)):
        review_dates[f'review_{i+1}'] = {
            'reviewDate': new_dates_list[i],
            'status': False  # True or False
        }

    
    return review_dates

