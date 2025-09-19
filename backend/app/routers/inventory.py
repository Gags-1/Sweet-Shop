from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.models import Sweet, User
from app.schemas import SweetResponse
from app.utils import get_current_user

router = APIRouter(prefix="/api/sweets", tags=["inventory"])

class PurchaseRequest(BaseModel):
    quantity: int

@router.post("/{sweet_id}/purchase", response_model=SweetResponse)
def purchase_sweet(
    sweet_id: int,
    purchase: PurchaseRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if purchase.quantity <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quantity must be positive"
        )
    
    db_sweet = db.query(Sweet).filter(Sweet.id == sweet_id).first()
    
    if not db_sweet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sweet not found"
        )
    
    if db_sweet.quantity < purchase.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Not enough stock available"
        )
    
    # Update quantity
    db_sweet.quantity -= purchase.quantity
    db.commit()
    db.refresh(db_sweet)
    
    return db_sweet