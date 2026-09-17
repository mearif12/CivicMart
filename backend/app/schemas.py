"""
Pydantic schemas -- define the shape of request/response JSON.
Keeping these separate from the SQLAlchemy models (models.py) means we
never accidentally leak internal fields like hashed_password to the client.
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, ConfigDict
from .models import UserRole, ApplicationStatus, ComplaintStatus, OrderStatus


# ---------- Auth / User ----------

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole = UserRole.citizen
    phone: Optional[str] = None
    address: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    email: EmailStr
    role: UserRole
    phone: Optional[str] = None
    address: Optional[str] = None
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- Notices ----------

class NoticeCreate(BaseModel):
    title: str
    content: str
    category: str = "General"


class NoticeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    content: str
    category: str
    created_at: datetime


# ---------- Complaints ----------

class ComplaintCreate(BaseModel):
    subject: str
    description: str


class ComplaintStatusUpdate(BaseModel):
    status: ComplaintStatus
    admin_remarks: Optional[str] = None


class ComplaintOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    subject: str
    description: str
    status: ComplaintStatus
    admin_remarks: Optional[str] = None
    created_at: datetime
    citizen: UserOut


# ---------- Certificate applications ----------

class CertificateCreate(BaseModel):
    cert_type: str
    details: str


class CertificateStatusUpdate(BaseModel):
    status: ApplicationStatus
    admin_remarks: Optional[str] = None


class CertificateOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    cert_type: str
    details: str
    status: ApplicationStatus
    admin_remarks: Optional[str] = None
    created_at: datetime
    citizen: UserOut


# ---------- Products ----------

class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    stock: int = 0
    category: str = "General"
    image_url: Optional[str] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    category: Optional[str] = None
    image_url: Optional[str] = None


class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    description: Optional[str] = None
    price: float
    stock: int
    category: str
    image_url: Optional[str] = None
    created_at: datetime
    vendor: UserOut


# ---------- Orders ----------

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = 1


class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    shipping_address: Optional[str] = None


class OrderItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    product_id: int
    quantity: int
    price_at_purchase: float
    product: ProductOut


class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    total_amount: float
    status: OrderStatus
    shipping_address: Optional[str] = None
    created_at: datetime
    items: List[OrderItemOut]
    citizen: UserOut


class OrderStatusUpdate(BaseModel):
    status: OrderStatus
