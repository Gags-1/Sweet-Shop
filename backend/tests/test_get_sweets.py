from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

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