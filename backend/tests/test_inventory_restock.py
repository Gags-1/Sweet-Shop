from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_restock_sweet():
    """Test restocking a sweet - This will FAIL initially"""
    # First login as admin (need to create admin user first)
    admin_data = {
        "username": "adminuser",
        "email": "admin@example.com",
        "password": "adminpass123"
    }
    client.post("/api/auth/register", json=admin_data)
    # TODO: Need to make this user an admin in database
    
    login_data = {"email": "magan@example.com", "password": "string"}
    login_response = client.post("/api/auth/login", json=login_data)
    token = login_response.json()["access_token"]
    
    # Create a sweet first
    sweet_data = {
        "name": "Sour Patch",
        "category": "Sour",
        "price": 2.49,
        "quantity": 20
    }
    create_response = client.post(
        "/api/sweets",
        json=sweet_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    sweet_id = 5
    
    # Restock the sweet
    restock_data = {"quantity": 30}
    response = client.post(
        f"/api/sweets/{sweet_id}/restock",
        json=restock_data,
        headers={"Authorization": f"Bearer {token}"}
    )
     # 20 + 30