"""
CivicMart backend -- FastAPI application entry point.

Run locally with:
    uvicorn app.main:app --reload

Interactive API docs are auto-generated at /docs (Swagger UI) and /redoc.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routers import auth_router, governance_router, ecommerce_router

# Create all tables on startup (fine for SQLite / small deployments;
# for production Postgres, prefer a migration tool such as Alembic).
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CivicMart API",
    description="A combined E-Governance and E-Commerce platform backend.",
    version="1.0.0",
)

# Allow the React frontend (any origin, incl. local dev + your deployed
# domain) to call this API. Tighten `allow_origins` to your real domain
# once you know it, for better security.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(governance_router.router)
app.include_router(ecommerce_router.router)


@app.get("/")
def root():
    return {
        "message": "CivicMart API is running.",
        "docs": "/docs",
    }


@app.get("/api/health")
@app.head("/api/health")
def health_check():
    return {"status": "ok"}
