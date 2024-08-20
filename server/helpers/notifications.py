import requests
import os

def send_push_notification(token, title, body):
    url = 'https://fcm.googleapis.com/fcm/send'
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'key={os.getenv("FCM_SERVER_KEY")}',
    }
    payload = {
        'to': token,
        'notification': {
            'title': title,
            'body': body,
        },
    }
    response = requests.post(url, headers=headers, json=payload)
    return response.json()