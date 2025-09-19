from fastapi.testclient import TestClient
from app.main import app
client = TestClient(app)

def test_register_user():
    """Test user registration - This will FAIL initially"""
    user_data = {
        "username": "testuser",
        "email": "test@example.com", 
        "password": "testpass123"
    }
    
    response = client.post("/api/auth/register", json=user_data)
    
    # These assertions will FAIL
    assert response.status_code == 200
    assert "id" in response.json()
    assert response.json()["email"] == "test@example.com"


def test_login_user():
    """Test user login - This will FAIL initially"""
    # First register a user
    user_data = {
        "username": "loginuser",
        "email": "login@example.com",
        "password": "loginpass123"
    }
    client.post("/api/auth/register", json=user_data)
    
    # Now try to login
    login_data = {
        "email": "login@example.com",
        "password": "loginpass123"
    }
    
    response = client.post("/api/auth/login", json=login_data)
    
    # These will FAIL initially
    assert response.status_code == 200
    assert "access_token" in response.json()