from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db
import models
import schemas
from services.matching_engine import find_matches

router = APIRouter(prefix="/matches", tags=["matches"])

@router.get("", response_model=List[schemas.Match])
def get_all_matches(db: Session = Depends(get_db)):
    return db.query(models.Match).all()

@router.post("/{match_id}/status")
def update_match_status(match_id: str, payload: schemas.StatusUpdate, db: Session = Depends(get_db)):
    match = db.query(models.Match).filter(models.Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    match.status = payload.status
    db.commit()
    return {"status": "updated", "new_status": match.status}

@router.get("/{requirement_id}")
def get_matches(requirement_id: str, db: Session = Depends(get_db)):
    requirement = db.query(models.Requirement).filter(models.Requirement.id == str(requirement_id)).first()
    if not requirement:
        raise HTTPException(status_code=404, detail="Requirement not found")

    resources = (
        db.query(models.Resource)
        .filter(models.Resource.companyId != requirement.companyId)  # exclude own company
        .all()
    )

    results = find_matches(requirement, resources, min_score=60)

    # Fetch company names for resources
    company_ids = list({r["resource"].companyId for r in results if hasattr(r["resource"], "companyId") and r["resource"].companyId})
    companies = {}
    if company_ids:
        comp_records = db.query(models.Company).filter(models.Company.id.in_(company_ids)).all()
        companies = {c.id: c.name for c in comp_records}

    # serialize (resource is a SQLAlchemy object, not JSON-safe by default)
    return {
        "matches": [
            {
                "match_score": r["match_score"],
                "distance_km": r["distance_km"],
                "breakdown": r["breakdown"],
                "resource": {
                    "id": r["resource"].id,
                    "company_name": companies.get(r["resource"].companyId, "Industrial Partner"),
                    "material_type": getattr(r["resource"], "materialType", getattr(r["resource"], "material_type", "")),
                    "quantity": r["resource"].quantity,
                    "unit": getattr(r["resource"], "unit", "kg"),
                    "price": getattr(r["resource"], "price", 0.0),
                    "location": getattr(r["resource"], "location", ""),
                    "quality": getattr(r["resource"], "quality", ""),
                },
            }
            for r in results
        ]
    }
