from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_create_sweet():
    """Test creating a sweet - This will FAIL initially"""
    # First register and login
    user_data = {
        "username": "sweetuser",
        "email": "sweet@example.com",
        "password": "sweetpass123"
    }
    client.post("/api/auth/register", json=user_data)
    
    login_data = {
        "email": "sweet@example.com",
        "password": "sweetpass123"
    }
    login_response = client.post("/api/auth/login", json=login_data)
    token = login_response.json()["access_token"]
    
    # Try to create a sweet
    sweet_data = {
        "name": "Chocolate Bar",
        "category": "Chocolate",
        "price": 2.99,
        "quantity": 50
    }
    
    response = client.post(
        "/api/sweets/create",
        json=sweet_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    
    # These will FAIL initially
    assert response.status_code == 200
    assert response.json()["name"] == "Chocolate Bar"
    assert response.json()["category"] == "Chocolate"


def test_get_sweets_authenticated():
    """Test getting sweets with authentication - This will FAIL initially"""
    # First login (assuming you already have a user)
    login_data = {"email": "magan@example.com", "password": "string"}
    login_response = client.post("/api/auth/login", json=login_data)
    token = login_response.json()["access_token"]
    
    # Try to get sweets with authentication
    response = client.get(
        "/api/sweets",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    # This will FAIL initially
    assert response.status_code == 200
    assert isinstance(response.json(), list)