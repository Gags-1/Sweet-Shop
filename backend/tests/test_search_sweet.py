from fastapi.testclient import TestClient
from app.main import app
client = TestClient(app)

def test_search_sweets():
    """Test searching sweets - This will FAIL because of no authorization"""
    # Search by category
    response = client.get("/api/sweets/search?category=Chocolate")
    
    # These will FAIL initially
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert any(sweet["category"] == "Chocolate" for sweet in response.json())