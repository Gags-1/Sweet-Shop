from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_purchase_sweet():
    """Test purchasing a sweet - This will FAIL initially"""
    # First login
    login_data = {"email": "magan@example.com", "password": "string"}
    login_response = client.post("/api/auth/login", json=login_data)
    token = login_response.json()["access_token"]
    
    # Create a sweet first
    sweet_data = {
        "name": "Gummy Bears",
        "category": "Gummies",
        "price": 1.99,
        "quantity": 100
    }
    create_response = client.post(
        "/api/sweets",
        json=sweet_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    sweet_id = create_response.json()["id"]
    
    # Purchase some sweets
    purchase_data = {"quantity": 5}
    response = client.post(
        f"/api/sweets/{sweet_id}/purchase",
        json=purchase_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    
    # These will FAIL initially
    assert response.status_code == 200
    assert response.json()["quantity"] == 95  # 100 - 5