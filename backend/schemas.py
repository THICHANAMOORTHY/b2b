# pyrefly: ignore [missing-import]
from pydantic import BaseModel
from typing import Optional, List

# ─── Company ──────────────────────────────────────────────────────────────────

class CompanyCreate(BaseModel):
    id: Optional[str] = None
    name: str
    industry: str
    location: str
    verificationStatus: Optional[str] = "Verified"

class CompanyBase(BaseModel):
    id: str
    name: str
    industry: str
    location: str
    verificationStatus: str

class Company(CompanyBase):
    class Config:
        from_attributes = True

# ─── Resource ─────────────────────────────────────────────────────────────────

class ResourceCreate(BaseModel):
    companyId: str
    name: str
    materialType: str
    quantity: float
    unit: str
    quality: str
    location: str
    availability: str
    price: float

class ResourceBase(ResourceCreate):
    id: str

class Resource(ResourceBase):
    class Config:
        from_attributes = True

# ─── Requirement ──────────────────────────────────────────────────────────────

class RequirementCreate(BaseModel):
    companyId: str
    materialType: str
    quantity: float
    unit: str
    quality: str
    requiredDate: str
    location: str

class RequirementBase(RequirementCreate):
    id: str

class Requirement(RequirementBase):
    class Config:
        from_attributes = True

# ─── Match ────────────────────────────────────────────────────────────────────

class MatchBase(BaseModel):
    id: str
    resourceId: str
    requirementId: str
    matchScore: float
    distanceKm: float
    status: str

class Match(MatchBase):
    class Config:
        from_attributes = True

class StatusUpdate(BaseModel):
    status: str

# ─── Impact ───────────────────────────────────────────────────────────────────

class ImpactResponse(BaseModel):
    wasteDiverted: float
    co2eAvoided: float
    waterSaved: float
    resourcesReused: int
    disposalCostAvoided: float
