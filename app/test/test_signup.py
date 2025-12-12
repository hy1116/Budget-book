"""회원가입 엔드포인트 테스트"""
import requests
import json

url = "http://localhost:8000/api/v1/users/signup"

# 테스트 데이터
data = {
    "email": "test@example.com",
    "password": "test123456",
    "name": "테스트유저"
}

print(f"Testing signup endpoint: {url}")
print(f"Request data: {json.dumps(data, ensure_ascii=False, indent=2)}")

try:
    response = requests.post(url, json=data)
    print(f"\nStatus Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), ensure_ascii=False, indent=2)}")
except requests.exceptions.RequestException as e:
    print(f"Request error: {e}")
except Exception as e:
    print(f"Error: {e}")
    print(f"Response text: {response.text}")
