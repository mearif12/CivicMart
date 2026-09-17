"""
Optional: populate the database with demo data so the site isn't empty
on first run. Run once with:  python seed.py
"""
from app.database import SessionLocal, Base, engine
from app import models, auth

Base.metadata.create_all(bind=engine)
db = SessionLocal()

def get_or_create_user(name, email, password, role):
    user = db.query(models.User).filter(models.User.email == email).first()
    if user:
        return user
    user = models.User(name=name, email=email, hashed_password=auth.hash_password(password), role=role)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

admin = get_or_create_user("Admin User", "admin@civicmart.gov", "admin123", models.UserRole.admin)
vendor = get_or_create_user("Rahim's Store", "vendor@civicmart.gov", "vendor123", models.UserRole.vendor)
citizen = get_or_create_user("Karim Citizen", "citizen@civicmart.gov", "citizen123", models.UserRole.citizen)

if not db.query(models.Notice).first():
    db.add_all([
        models.Notice(title="Union Office Holiday Notice", content="The union office will remain closed on the upcoming public holiday.", category="General", posted_by_id=admin.id),
        models.Notice(title="Trade License Renewal Deadline", content="All trade licenses must be renewed by the end of this month to avoid a late fee.", category="Business", posted_by_id=admin.id),
    ])

if not db.query(models.Product).first():
    db.add_all([
        models.Product(vendor_id=vendor.id, name="Handwoven Cotton Saree", description="Locally handwoven cotton saree, breathable and durable.", price=1250, stock=15, category="Fashion"),
        models.Product(vendor_id=vendor.id, name="Organic Honey (500g)", description="Raw organic honey sourced from local farms.", price=450, stock=40, category="Grocery"),
        models.Product(vendor_id=vendor.id, name="Bamboo Handicraft Basket", description="Eco-friendly handmade bamboo basket.", price=300, stock=25, category="Handicraft"),
    ])

db.commit()
db.close()
print("Seed data inserted.")
print("Login with: admin@civicmart.gov / admin123 (Admin)")
print("            vendor@civicmart.gov / vendor123 (Vendor)")
print("            citizen@civicmart.gov / citizen123 (Citizen)")
