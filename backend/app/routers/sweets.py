from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Sweet, User
from app.schemas import SweetCreate, SweetResponse
from app.utils import get_current_user

router = APIRouter(prefix="/api/sweets", tags=["sweets"])

@router.post("/create", response_model=SweetResponse)
def create_sweet(
    sweet: SweetCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_sweet = db.query(Sweet).filter(Sweet.name == sweet.name).first()
    
    if db_sweet:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Sweet with this name already exists"
        )
    
    db_sweet = Sweet(
        name=sweet.name,
        category=sweet.category,
        price=sweet.price,
        quantity=sweet.quantity
    )
    
    db.add(db_sweet)
    db.commit()
    db.refresh(db_sweet)
    
    return db_sweet