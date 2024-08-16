# THIS IS A TESTING FILE TO TEST FLASK ROUTES 

import requests

url = "http://localhost:8080/api/check_premium_status"
payload = {
    "clerk_id": "user_2kD0iEClrxstpOf9v1o5mDAptEa",
}

response = requests.get(url, json=payload)
print(response.status_code)
print(response.json())