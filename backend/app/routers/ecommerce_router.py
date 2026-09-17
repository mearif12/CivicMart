"""
E-Commerce endpoints: product catalogue (managed by vendors) and the
checkout / order flow (used by citizens). Cart state itself is kept
client-side in the React app and only sent to the server at checkout.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/api/shop", tags=["E-Commerce"])


# ---------------- Products ----------------

@router.get("/products", response_model=List[schemas.ProductOut])
def list_products(category: str | None = None, search: str | None = None, db: Session = Depends(get_db)):
    query = db.query(models.Product)
    if category:
        query = query.filter(models.Product.category == category)
    if search:
        query = query.filter(models.Product.name.ilike(f"%{search}%"))
    return query.order_by(models.Product.created_at.desc()).all()


@router.get("/products/mine", response_model=List[schemas.ProductOut])
def my_products(
    db: Session = Depends(get_db),
    vendor: models.User = Depends(auth.require_role(models.UserRole.vendor)),
):
    return db.query(models.Product).filter(models.Product.vendor_id == vendor.id).all()


@router.get("/products/{product_id}", response_model=schemas.ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).get(product_id)
    if not product:
        raise HTTPException(404, "Product not found")
    return product


@router.post("/products", response_model=schemas.ProductOut, status_code=201)
def create_product(
    payload: schemas.ProductCreate,
    db: Session = Depends(get_db),
    vendor: models.User = Depends(auth.require_role(models.UserRole.vendor)),
):
    product = models.Product(**payload.model_dump(), vendor_id=vendor.id)
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.put("/products/{product_id}", response_model=schemas.ProductOut)
def update_product(
    product_id: int,
    payload: schemas.ProductUpdate,
    db: Session = Depends(get_db),
    vendor: models.User = Depends(auth.require_role(models.UserRole.vendor)),
):
    product = db.query(models.Product).get(product_id)
    if not product or product.vendor_id != vendor.id:
        raise HTTPException(404, "Product not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(product, field, value)
    db.commit()
    db.refresh(product)
    return product


@router.delete("/products/{product_id}", status_code=204)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    vendor: models.User = Depends(auth.require_role(models.UserRole.vendor)),
):
    product = db.query(models.Product).get(product_id)
    if not product or product.vendor_id != vendor.id:
        raise HTTPException(404, "Product not found")
    db.delete(product)
    db.commit()


# ---------------- Orders / Checkout ----------------

@router.post("/orders", response_model=schemas.OrderOut, status_code=201)
def place_order(
    payload: schemas.OrderCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    if not payload.items:
        raise HTTPException(400, "Cannot place an empty order")

    order = models.Order(citizen_id=current_user.id, shipping_address=payload.shipping_address)
    total = 0.0

    for item in payload.items:
        product = db.query(models.Product).get(item.product_id)
        if not product:
            raise HTTPException(404, f"Product {item.product_id} not found")
        if product.stock < item.quantity:
            raise HTTPException(400, f"Not enough stock for '{product.name}'")

        product.stock -= item.quantity
        line_total = product.price * item.quantity
        total += line_total
        order.items.append(models.OrderItem(
            product_id=product.id,
            quantity=item.quantity,
            price_at_purchase=product.price,
        ))

    order.total_amount = total
    db.add(order)
    db.commit()
    db.refresh(order)
    return order


@router.get("/orders", response_model=List[schemas.OrderOut])
def list_my_orders(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    return (
        db.query(models.Order)
        .filter(models.Order.citizen_id == current_user.id)
        .order_by(models.Order.created_at.desc())
        .all()
    )


@router.get("/vendor/orders", response_model=List[schemas.OrderOut])
def vendor_orders(
    db: Session = Depends(get_db),
    vendor: models.User = Depends(auth.require_role(models.UserRole.vendor)),
):
    """Every order that contains at least one of this vendor's products."""
    return (
        db.query(models.Order)
        .join(models.OrderItem)
        .join(models.Product)
        .filter(models.Product.vendor_id == vendor.id)
        .distinct()
        .order_by(models.Order.created_at.desc())
        .all()
    )


@router.patch("/orders/{order_id}", response_model=schemas.OrderOut)
def update_order_status(
    order_id: int,
    payload: schemas.OrderStatusUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(models.UserRole.vendor, models.UserRole.admin)),
):
    order = db.query(models.Order).get(order_id)
    if not order:
        raise HTTPException(404, "Order not found")
    order.status = payload.status
    db.commit()
    db.refresh(order)
    return order
