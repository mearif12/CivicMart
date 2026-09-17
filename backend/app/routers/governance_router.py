"""
E-Governance endpoints: public notices, citizen complaints, and
certificate applications. Citizens create complaints/applications for
themselves; admins review and update their status.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/api/governance", tags=["E-Governance"])


# ---------------- Notices ----------------

@router.get("/notices", response_model=List[schemas.NoticeOut])
def list_notices(db: Session = Depends(get_db)):
    return db.query(models.Notice).order_by(models.Notice.created_at.desc()).all()


@router.post("/notices", response_model=schemas.NoticeOut, status_code=201)
def create_notice(
    payload: schemas.NoticeCreate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(auth.require_role(models.UserRole.admin)),
):
    notice = models.Notice(**payload.model_dump(), posted_by_id=admin.id)
    db.add(notice)
    db.commit()
    db.refresh(notice)
    return notice


@router.delete("/notices/{notice_id}", status_code=204)
def delete_notice(
    notice_id: int,
    db: Session = Depends(get_db),
    admin: models.User = Depends(auth.require_role(models.UserRole.admin)),
):
    notice = db.query(models.Notice).get(notice_id)
    if not notice:
        raise HTTPException(404, "Notice not found")
    db.delete(notice)
    db.commit()


# ---------------- Complaints ----------------

@router.post("/complaints", response_model=schemas.ComplaintOut, status_code=201)
def file_complaint(
    payload: schemas.ComplaintCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    complaint = models.Complaint(**payload.model_dump(), citizen_id=current_user.id)
    db.add(complaint)
    db.commit()
    db.refresh(complaint)
    return complaint


@router.get("/complaints", response_model=List[schemas.ComplaintOut])
def list_complaints(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    # Admins see every complaint; citizens see only their own.
    query = db.query(models.Complaint)
    if current_user.role != models.UserRole.admin:
        query = query.filter(models.Complaint.citizen_id == current_user.id)
    return query.order_by(models.Complaint.created_at.desc()).all()


@router.patch("/complaints/{complaint_id}", response_model=schemas.ComplaintOut)
def update_complaint_status(
    complaint_id: int,
    payload: schemas.ComplaintStatusUpdate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(auth.require_role(models.UserRole.admin)),
):
    complaint = db.query(models.Complaint).get(complaint_id)
    if not complaint:
        raise HTTPException(404, "Complaint not found")
    complaint.status = payload.status
    complaint.admin_remarks = payload.admin_remarks
    db.commit()
    db.refresh(complaint)
    return complaint


# ---------------- Certificate Applications ----------------

@router.post("/certificates", response_model=schemas.CertificateOut, status_code=201)
def apply_for_certificate(
    payload: schemas.CertificateCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    application = models.CertificateApplication(**payload.model_dump(), citizen_id=current_user.id)
    db.add(application)
    db.commit()
    db.refresh(application)
    return application


@router.get("/certificates", response_model=List[schemas.CertificateOut])
def list_certificate_applications(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    query = db.query(models.CertificateApplication)
    if current_user.role != models.UserRole.admin:
        query = query.filter(models.CertificateApplication.citizen_id == current_user.id)
    return query.order_by(models.CertificateApplication.created_at.desc()).all()


@router.patch("/certificates/{application_id}", response_model=schemas.CertificateOut)
def update_certificate_status(
    application_id: int,
    payload: schemas.CertificateStatusUpdate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(auth.require_role(models.UserRole.admin)),
):
    application = db.query(models.CertificateApplication).get(application_id)
    if not application:
        raise HTTPException(404, "Application not found")
    application.status = payload.status
    application.admin_remarks = payload.admin_remarks
    db.commit()
    db.refresh(application)
    return application
