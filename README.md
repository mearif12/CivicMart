# CivicMart — E-Governance + E-Commerce Platform

A single web platform that combines **citizen government services**
(notices, complaints, certificate applications) with a **local
marketplace** (vendors list products, citizens shop and check out).

- **Frontend:** React 18 + Vite, React Router, Axios
- **Backend:** FastAPI + SQLAlchemy + JWT authentication
- **Database:** SQLite by default (zero-config); swap to PostgreSQL by
  setting one environment variable

Three roles share one login system:
| Role | Can do |
|---|---|
| **Citizen** | Read notices, file/track complaints, apply for certificates, shop & checkout, view orders |
| **Vendor** | List/edit/delete products, view & update orders containing their products |
| **Admin** | Publish/delete notices, resolve complaints, approve/reject certificate applications |

## Quick Start (local)

### 1. Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python seed.py                  # optional: creates demo accounts + products
uvicorn app.main:app --reload
```
Backend runs at http://localhost:8000 (interactive docs at `/docs`).

Demo accounts:
- Admin: `admin@civicmart.gov` /
- Vendor: `vendor@civicmart.gov` /
- Citizen: `citizen@civicmart.gov` /

### 2. Frontend
```bash
cd frontend
npm install
cp .env.example .env            # edit VITE_API_URL if needed
npm run dev
```
Frontend runs at http://localhost:5173

## Free Deployment

See **CivicMart_Documentation.docx** for the full step-by-step guide
(Render for the backend, Vercel/Netlify for the frontend — both have
generous free tiers with no credit card required).

## Project Structure
```
backend/
  app/
    main.py            FastAPI app, CORS, router registration
    database.py         SQLAlchemy engine/session setup
    models.py            ORM table definitions
    schemas.py            Pydantic request/response models
    auth.py                 Password hashing + JWT helpers
    routers/
      auth_router.py         /api/auth/*
      governance_router.py    /api/governance/*
      ecommerce_router.py      /api/shop/*
  seed.py                Demo data loader
  requirements.txt

frontend/
  src/
    api.js               Axios instance (auto-attaches JWT)
    context/              Auth & Cart React Context providers
    components/            Navbar, ProductCard, ProtectedRoute
    pages/                   One file per page/route
    App.jsx                   Route definitions
    main.jsx                   App bootstrap
```
