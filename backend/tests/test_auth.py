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