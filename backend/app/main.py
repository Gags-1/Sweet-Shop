from fastapi import FastAPI
from app.database import Base, engine
from . import models
from .routers import auth,sweets

try:
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully")
except Exception as e:
    print(f"Error creating tables: {e}")

app = FastAPI()

@app.get("/")
def message():
    return {"message": "API RUNNING"}


app.include_router(auth.router)
app.include_router(sweets.router)