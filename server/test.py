# THIS IS A TESTING FILE TO TEST FLASK ROUTES 

import requests

url = "http://localhost:8080/api/deletenotes"
payload = {
    "clerk_id": "user_2kD0iEClrxstpOf9v1o5mDAptEa",
    "notes_name": "Note2",
}

response = requests.delete(url, json=payload)
print(response.status_code)
print(response.json())