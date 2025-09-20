from fastapi.testclient import TestClient
from app.main import app
client = TestClient(app)

def test_delete_sweet():
    """Test deleting a sweet - This will FAIL initially"""
    # First login
    login_data = {"email": "magan@example.com", "password": "string"}
    login_response = client.post("/api/auth/login", json=login_data)
    token = login_response.json()["access_token"]
    
    # Get a sweet to delete
    # sweets_response = client.get("/api/sweets")
    sweet_id = 9
    
    # Try to delete
    response = client.delete(
        f"/api/sweets/{sweet_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    # These will FAIL initially
    assert response.status_code == 200
    assert response.json()["message"] == "Sweet deleted successfully"
    
    # Verify it's actually deleted
    get_response = client.get(f"/api/sweets/{sweet_id}")
    assert get_response.status_code == 404