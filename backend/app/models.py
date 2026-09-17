"""
SQLAlchemy ORM models for CivicMart.

The platform has three user roles:
  - citizen : registers, applies for certificates, files complaints,
              reads notices, and shops on the marketplace.
  - vendor  : lists and manages products, fulfils orders.
  - admin   : publishes notices, reviews complaints and certificate
              applications, oversees the whole platform.
"""
import enum
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Float, DateTime, ForeignKey, Enum as SAEnum
)
from sqlalchemy.orm import relationship
from .database import Base


class UserRole(str, enum.Enum):
    citizen = "citizen"
    vendor = "vendor"
    admin = "admin"


class ApplicationStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class ComplaintStatus(str, enum.Enum):
    pending = "pending"
    in_progress = "in_progress"
    resolved = "resolved"


class OrderStatus(str, enum.Enum):
    pending = "pending"
    paid = "paid"
    shipped = "shipped"
    delivered = "delivered"
    cancelled = "cancelled"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(180), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(SAEnum(UserRole), default=UserRole.citizen, nullable=False)
    phone = Column(String(30), nullable=True)
    address = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    complaints = relationship("Complaint", back_populates="citizen")
    applications = relationship("CertificateApplication", back_populates="citizen")
    products = relationship("Product", back_populates="vendor")
    orders = relationship("Order", back_populates="citizen")


class Notice(Base):
    """Government / admin announcements -- the public notice board."""
    __tablename__ = "notices"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String(80), default="General")
    posted_by_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    posted_by = relationship("User")


class Complaint(Base):
    """A citizen grievance / complaint filed with the local authority."""
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    citizen_id = Column(Integer, ForeignKey("users.id"))
    subject = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(SAEnum(ComplaintStatus), default=ComplaintStatus.pending)
    admin_remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    citizen = relationship("User", back_populates="complaints")


class CertificateApplication(Base):
    """A citizen's application for an official certificate/document."""
    __tablename__ = "certificate_applications"

    id = Column(Integer, primary_key=True, index=True)
    citizen_id = Column(Integer, ForeignKey("users.id"))
    cert_type = Column(String(100), nullable=False)  # e.g. Birth, Trade License, Citizenship
    details = Column(Text, nullable=False)
    status = Column(SAEnum(ApplicationStatus), default=ApplicationStatus.pending)
    admin_remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    citizen = relationship("User", back_populates="applications")


class Product(Base):
    """A product listed on the marketplace by a vendor."""
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String(160), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    stock = Column(Integer, default=0)
    category = Column(String(80), default="General")
    image_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    vendor = relationship("User", back_populates="products")
    order_items = relationship("OrderItem", back_populates="product")


class Order(Base):
    """A checked-out order placed by a citizen; may contain many products."""
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    citizen_id = Column(Integer, ForeignKey("users.id"))
    total_amount = Column(Float, default=0)
    status = Column(SAEnum(OrderStatus), default=OrderStatus.pending)
    shipping_address = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    citizen = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    """A single product line inside an order (price captured at purchase time)."""
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer, default=1)
    price_at_purchase = Column(Float, nullable=False)

    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")
