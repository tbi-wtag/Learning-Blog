from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm

from app.database import pool
from app.routers import auth, resources

@asynccontextmanager
async def lifespan(app: FastAPI):
    await pool.open()  
    yield
    await pool.close() 

app = FastAPI(title="Learning Resource Sharing API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(resources.router)

@app.get("/")
def read_root(): 
    return {"message": "Welcome to the Learning Resource Sharing API"}

@app.get("/health")
async def health(): 
    async with pool.connection() as conn:
        await conn.execute("SELECT 1")
    return {"status": "ok", "database": "connected"}