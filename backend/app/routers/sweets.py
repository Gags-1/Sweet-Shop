from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Sweet, User
from app.schemas import SweetCreate, SweetResponse
from app.utils import get_current_user
from typing import Optional

router = APIRouter(prefix="/api/sweets", tags=["sweets"])

@router.post("", response_model=SweetResponse)
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

@router.get("", response_model=List[SweetResponse])
def get_sweets(
    skip: int = 0, 
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user) 
):
    sweets = db.query(Sweet).offset(skip).limit(limit).all()
    return sweets



@router.get("/search", response_model=List[SweetResponse])
def search_sweets(
    name: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user) 
):
    query = db.query(Sweet)
    
    if name:
        query = query.filter(Sweet.name.ilike(f"%{name}%"))
    if category:
        query = query.filter(Sweet.category.ilike(f"%{category}%"))
    if min_price is not None:
        query = query.filter(Sweet.price >= min_price)
    if max_price is not None:
        query = query.filter(Sweet.price <= max_price)
    
    return query.all()