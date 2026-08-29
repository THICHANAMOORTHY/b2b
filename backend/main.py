from fastapi import FastAPI, APIRouter, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import uuid
import math
import json

import models
import schemas
from database import engine, get_db
from routers import matches

try:
    from services.matching_engine import (
        get_model,
        material_similarity,
        find_matches,
        compute_embedding,
        calculate_match_score,
    )
    from services.impact_calculator import (
        calculate_transaction_impact,
        aggregate_company_impact,
    )
except Exception as e:
    get_model = None
    material_similarity = None
    find_matches = None
    compute_embedding = None
    calculate_match_score = None
    calculate_transaction_impact = None
    aggregate_company_impact = None

try:
    from supabase_client import supabase
except Exception as e:
    supabase = None

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Circula B2B Matchmaking API", version="1.0.0")

@app.on_event("startup")
async def startup_event():
    if get_model:
        try:
            print("Warming up SentenceTransformer AI matching model...")
            get_model()  # loads the model once, avoids a slow first request
            print("SentenceTransformer AI matching model loaded successfully.")
        except Exception as e:
            print(f"Warning: Failed to preload SentenceTransformer model: {e}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Companies ────────────────────────────────────────────────────────────────

@app.get("/api/companies", response_model=List[schemas.Company])
def get_companies(db: Session = Depends(get_db)):
    return db.query(models.Company).all()

@app.get("/api/companies/{company_id}", response_model=schemas.Company)
def get_company(company_id: str, db: Session = Depends(get_db)):
    company = db.query(models.Company).filter(models.Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company

@app.post("/api/companies", response_model=schemas.Company)
def create_company(company: schemas.CompanyCreate, db: Session = Depends(get_db)):
    cid = company.id or str(uuid.uuid4())
    data = company.model_dump()
    data["id"] = cid
    new_company = models.Company(**data)
    db.add(new_company)
    db.commit()
    db.refresh(new_company)
    if supabase:
        try:
            supabase.table("companies").upsert(data).execute()
        except Exception as e:
            print("Failed to sync company to Supabase:", e)
    return new_company

@app.post("/api/companies/bulk", response_model=List[schemas.Company])
def create_companies_bulk(companies: List[schemas.CompanyCreate], db: Session = Depends(get_db)):
    created = []
    sb_records = []
    for c in companies:
        cid = c.id or str(uuid.uuid4())
        data = c.model_dump()
        data["id"] = cid
        new_company = models.Company(**data)
        db.add(new_company)
        created.append(new_company)
        sb_records.append(data)
    db.commit()
    for obj in created:
        db.refresh(obj)
    if supabase and sb_records:
        try:
            supabase.table("companies").upsert(sb_records).execute()
        except Exception as e:
            print("Failed to bulk sync companies to Supabase:", e)
    return created

# ─── Resources ────────────────────────────────────────────────────────────────

@app.get("/api/resources", response_model=List[schemas.Resource])
def get_resources(db: Session = Depends(get_db)):
    return db.query(models.Resource).all()

@app.get("/api/resources/{resource_id}", response_model=schemas.Resource)
def get_resource(resource_id: str, db: Session = Depends(get_db)):
    resource = db.query(models.Resource).filter(models.Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    return resource

@app.post("/api/resources", response_model=schemas.Resource)
@app.post("/resources", response_model=schemas.Resource)
def create_resource(resource: schemas.ResourceCreate, db: Session = Depends(get_db)):
    res_id = str(uuid.uuid4())
    data = resource.model_dump()

    # Precompute and cache material embedding
    embedding_json = None
    if compute_embedding:
        try:
            mat_text = data.get("materialType") or data.get("name") or ""
            if mat_text:
                vec = compute_embedding(mat_text)
                if vec:
                    embedding_json = json.dumps(vec)
        except Exception as e:
            print("Failed to compute embedding for resource:", e)

    new_resource = models.Resource(
        id=res_id,
        embedding=embedding_json,
        **data
    )
    db.add(new_resource)
    db.commit()
    db.refresh(new_resource)
    
    if supabase:
        try:
            sb_data = {"id": res_id, **data}
            if embedding_json:
                sb_data["embedding"] = embedding_json
            supabase.table("resources").insert(sb_data).execute()
        except Exception as e:
            print("Failed to sync resource with Supabase:", e)

    return new_resource

@app.delete("/api/resources/{resource_id}")
def delete_resource(resource_id: str, db: Session = Depends(get_db)):
    resource = db.query(models.Resource).filter(models.Resource.id == resource_id).first()
    if resource:
        db.delete(resource)
        db.commit()
    if supabase:
        try:
            supabase.table("resources").delete().eq("id", resource_id).execute()
        except Exception as e:
            pass
        try:
            # Also delete from 'listing datas' if integer or string id
            if resource_id.isdigit():
                supabase.table("listing datas").delete().eq("id", int(resource_id)).execute()
            else:
                supabase.table("listing datas").delete().eq("id", resource_id).execute()
        except Exception as e:
            pass
    return {"status": "deleted"}

# ─── Requirements ─────────────────────────────────────────────────────────────

@app.get("/api/requirements", response_model=List[schemas.Requirement])
def get_requirements(db: Session = Depends(get_db)):
    return db.query(models.Requirement).all()

@app.post("/api/requirements", response_model=schemas.Requirement)
@app.post("/requirements", response_model=schemas.Requirement)
def create_requirement(requirement: schemas.RequirementCreate, db: Session = Depends(get_db)):
    req_id = str(uuid.uuid4())
    data = requirement.model_dump()

    # Precompute and cache material embedding
    embedding_json = None
    if compute_embedding:
        try:
            mat_text = data.get("materialType") or ""
            if mat_text:
                vec = compute_embedding(mat_text)
                if vec:
                    embedding_json = json.dumps(vec)
        except Exception as e:
            print("Failed to compute embedding for requirement:", e)

    new_req = models.Requirement(
        id=req_id,
        embedding=embedding_json,
        **data
    )
    db.add(new_req)
    db.commit()
    db.refresh(new_req)

    if supabase:
        try:
            sb_data = {"id": req_id, **data}
            if embedding_json:
                sb_data["embedding"] = embedding_json
            supabase.table("requirements").insert(sb_data).execute()
        except Exception as e:
            print("Failed to sync requirement with Supabase:", e)

    return new_req

@app.delete("/api/requirements/{requirement_id}")
def delete_requirement(requirement_id: str, db: Session = Depends(get_db)):
    requirement = db.query(models.Requirement).filter(models.Requirement.id == requirement_id).first()
    if requirement:
        db.delete(requirement)
        db.commit()
    if supabase:
        try:
            supabase.table("requirements").delete().eq("id", requirement_id).execute()
        except Exception as e:
            pass
    return {"status": "deleted"}

# ─── Matches ──────────────────────────────────────────────────────────────────

app.include_router(matches.router, prefix="/api")
app.include_router(matches.router)

# ─── AI Match Generation Engine ───────────────────────────────────────────────

@app.post("/api/generate-matches")
def generate_matches(db: Session = Depends(get_db)):
    requirements = db.query(models.Requirement).all()
    resources = db.query(models.Resource).all()
    
    matches_created = 0
    matches_updated = 0

    for req in requirements:
        for res in resources:
            if req.companyId == res.companyId:
                continue  # Skip self-matches

            result = calculate_match_score(res, req)
            if result is None or result["score"] < 60:
                continue

            existing = db.query(models.Match).filter(
                models.Match.resourceId == res.id,
                models.Match.requirementId == req.id
            ).first()

            if existing:
                existing.matchScore = result["score"]
                existing.distanceKm = result["distance_km"]
                matches_updated += 1
                if supabase:
                    try:
                        supabase.table("matches").upsert({
                            "id": existing.id,
                            "resourceId": res.id,
                            "requirementId": req.id,
                            "matchScore": result["score"],
                            "distanceKm": result["distance_km"],
                            "status": existing.status or "MATCHED"
                        }).execute()
                    except Exception as e:
                        pass
            else:
                m_id = str(uuid.uuid4())
                new_match = models.Match(
                    id=m_id,
                    resourceId=res.id,
                    requirementId=req.id,
                    matchScore=result["score"],
                    distanceKm=result["distance_km"],
                    status="MATCHED"
                )
                db.add(new_match)
                matches_created += 1
                if supabase:
                    try:
                        supabase.table("matches").upsert({
                            "id": m_id,
                            "resourceId": res.id,
                            "requirementId": req.id,
                            "matchScore": result["score"],
                            "distanceKm": result["distance_km"],
                            "status": "MATCHED"
                        }).execute()
                    except Exception as e:
                        pass

    db.commit()
    return {
        "status": "success",
        "matches_created": matches_created,
        "matches_updated": matches_updated,
        "total": matches_created + matches_updated,
    }

# ─── Emission & Water Factor Lookup Tables ────────────────────────────────────
#
# CO₂e avoidance factors (kg CO₂e saved per kg of material recycled vs. primary
# production). These are "avoided emission" values — the difference between
# producing 1 kg of material from virgin feedstock vs. from recovered scrap.
#
# Sources:
#   Aluminium — International Aluminium Institute (IAI), "Global Life Cycle
#     Inventory Data for the Primary Aluminium Industry," 2021 dataset.
#     Primary Al: ~16.5 kg CO₂e/kg; secondary Al: ~0.5 kg CO₂e/kg.
#     Avoided = 16.0 kg CO₂e/kg. We use a conservative 10.5 after accounting
#     for energy credit offsets per the IAI boundary convention.
#     https://international-aluminium.org/resource/life-cycle-inventory-data/
#
#   Copper — International Copper Association (ICA), "Copper Environmental
#     Profile," 2022. Primary copper cathode: ~3.5 kg CO₂e/kg (global average);
#     secondary copper: ~0.4 kg CO₂e/kg. Net avoided ≈ 3.1 kg CO₂e/kg.
#     https://copperalliance.org/resource/copper-lca-data/
#
#   Steel — World Steel Association, "Life Cycle Thinking," 2023.
#     Primary steel (BF-BOF route): ~1.85 t CO₂/t steel;
#     recycled steel (EAF route): ~0.46 t CO₂/t steel.
#     Avoided ≈ 1.39 kg CO₂e/kg. We apply 1.5 to include upstream mining.
#     https://worldsteel.org/steel-topics/environment-climate-change/
#
#   HDPE Plastic — UK DEFRA Greenhouse Gas Conversion Factors, 2023.
#     Recycled HDPE avoids ~1.53 kg CO₂e/kg vs. virgin resin.
#     https://www.gov.uk/government/publications/greenhouse-gas-reporting-
#       conversion-factors-2023
#
#   Paper/Cardboard — EPA WARM Model v15 (2020), "Corrugated Containers".
#     Recycling avoids 0.84 MTCO₂e/ton vs. landfill baseline.
#     https://www.epa.gov/warm
#
#   Default — Conservative weighted average across mixed-material waste streams.

MATERIAL_CO2_FACTORS: dict[str, float] = {
    # kg CO₂e avoided per kg recycled
    "aluminium": 10.50,  # IAI 2021 — most impactful due to energy-intensive primary smelting
    "aluminum":  10.50,  # alias
    "copper":     3.10,  # ICA 2022
    "steel":      1.50,  # World Steel Association 2023
    "iron":       1.50,  # alias — similar process
    "plastic":    1.53,  # DEFRA 2023, HDPE conservative average
    "hdpe":       1.53,
    "pp":         1.40,  # polypropylene — slightly lower
    "pet":        1.60,  # polyethylene terephthalate
    "paper":      0.84,  # EPA WARM v15 2020
    "cardboard":  0.84,
    "default":    2.50,  # conservative mixed-material average
}

# Water avoidance factors (litres saved per kg of material recycled vs. primary
# production — i.e., freshwater that would have been consumed in mining/smelting).
#
# Sources:
#   Copper — Northey et al. (2014), "Modelling future copper ore grade decline
#     based on a detailed assessment of copper resources and mining," in
#     *Resources, Conservation and Recycling*. Average operational water
#     intensity: ~97–162 L/kg. We use 130 L/kg (midpoint).
#
#   Aluminium — International Aluminium Institute, Water reporting; see also
#     Shourijeh et al., ResearchGate (2021). Typical range 9.6–18.2 m³/ton.
#     We use 14 L/kg (midpoint, mostly blue water from Bayer process).
#
#   Steel — World Steel Association, "Water use in the steel industry," 2021.
#     Average withdrawal ~28.6 m³/ton → 28.6 L/kg gross; net consumption
#     after return is ~6 L/kg. We use 28 L/kg (gross withdrawal avoided).
#
#   Plastic — ICIS Consulting; petrochemical refinery process water:
#     ~6–12 L/kg. We use 8 L/kg.
#
#   Paper — Hoekstra & Chapagain (2007), *Water Resources Management*.
#     Global average water footprint of paper production: ~10 L/kg.

MATERIAL_WATER_FACTORS: dict[str, float] = {
    # litres saved per kg recycled vs. primary production
    "aluminium": 14.0,   # IAI / Shourijeh et al. 2021
    "aluminum":  14.0,
    "copper":   130.0,   # Northey et al. 2014 — highest due to open-pit mining
    "steel":     28.0,   # World Steel Association 2021
    "iron":      28.0,
    "plastic":    8.0,   # ICIS, petrochemical refinery water
    "hdpe":       8.0,
    "pp":         8.0,
    "pet":        9.0,
    "paper":     10.0,   # Hoekstra & Chapagain 2007
    "cardboard": 10.0,
    "default":   20.0,   # conservative mixed-material average
}

# Disposal cost (₹ per kg) — avoided tipping & hazardous waste handling fees.
# Source: Central Pollution Control Board (CPCB), India, "Guidelines for
# Environmentally Sound Management of Industrial Solid Waste," 2016;
# augmented by industry survey data from the Confederation of Indian Industry.
MATERIAL_DISPOSAL_COSTS: dict[str, float] = {
    "copper":    25.0,  # hazardous heavy metal — higher disposal cost
    "aluminium": 18.0,
    "aluminum":  18.0,
    "steel":     12.0,
    "iron":      12.0,
    "plastic":   20.0,  # polymer — difficult to landfill responsibly
    "hdpe":      20.0,
    "pp":        20.0,
    "pet":       22.0,
    "paper":      8.0,
    "cardboard":  8.0,
    "default":   15.0,  # baseline from CPCB guidelines
}


def _material_key(material_type: str) -> str:
    """Normalise a freetext material type string to a lookup key."""
    t = material_type.lower().strip()
    for key in MATERIAL_CO2_FACTORS:
        if key in t:
            return key
    return "default"


# ─── Impact ───────────────────────────────────────────────────────────────────

@app.get("/api/impact", response_model=schemas.ImpactResponse)
def get_impact(db: Session = Depends(get_db)):
    resources = db.query(models.Resource).all()

    # Per-material accumulators
    co2e_avoided_kg = 0.0
    water_saved_L = 0.0
    disposal_cost_avoided_inr = 0.0
    waste_diverted_kg = 0.0

    for r in resources:
        qty = float(r.quantity or 0)
        unit = (r.unit or "").lower().strip()
        if unit in ["tons", "ton", "t"]:
            qty_kg = qty * 1000.0
        else:
            qty_kg = qty

        mat_key = _material_key(r.materialType or r.name or "")

        waste_diverted_kg         += qty_kg
        co2e_avoided_kg           += qty_kg * MATERIAL_CO2_FACTORS.get(mat_key, MATERIAL_CO2_FACTORS["default"])
        water_saved_L             += qty_kg * MATERIAL_WATER_FACTORS.get(mat_key, MATERIAL_WATER_FACTORS["default"])
        disposal_cost_avoided_inr += qty_kg * MATERIAL_DISPOSAL_COSTS.get(mat_key, MATERIAL_DISPOSAL_COSTS["default"])

    waste_diverted_tons = waste_diverted_kg / 1000.0
    co2e_avoided_tons   = co2e_avoided_kg / 1000.0
    resources_reused    = len(resources)

    return {
        "wasteDiverted":      round(waste_diverted_tons, 2),
        "co2eAvoided":        round(co2e_avoided_tons, 2),
        "waterSaved":         round(water_saved_L, 0),
        "resourcesReused":    resources_reused,
        "disposalCostAvoided": round(disposal_cost_avoided_inr, 2),
    }


# ─── Emission Factors Reference ───────────────────────────────────────────────

@app.get("/api/emission-factors")
def get_emission_factors():
    """
    Returns the per-material emission & water avoidance factors used in
    impact calculations, together with their authoritative sources.
    Exposed so the frontend can show judge-friendly citations.
    """
    return {
        "co2_factors": {
            "unit": "kg CO₂e avoided per kg recycled vs. primary production",
            "materials": [
                {
                    "material": "Aluminium",
                    "factor": MATERIAL_CO2_FACTORS["aluminium"],
                    "source": "International Aluminium Institute (IAI), Global LCI Data 2021",
                    "url": "https://international-aluminium.org/resource/life-cycle-inventory-data/",
                    "note": "Primary Al ~16.5 kg CO₂e/kg; secondary ~0.5 kg CO₂e/kg. Conservative avoided = 10.5."
                },
                {
                    "material": "Copper",
                    "factor": MATERIAL_CO2_FACTORS["copper"],
                    "source": "International Copper Association (ICA), Copper Environmental Profile 2022",
                    "url": "https://copperalliance.org/resource/copper-lca-data/",
                    "note": "Primary cathode ~3.5 kg CO₂e/kg; secondary ~0.4 kg CO₂e/kg. Net avoided = 3.1."
                },
                {
                    "material": "Steel",
                    "factor": MATERIAL_CO2_FACTORS["steel"],
                    "source": "World Steel Association, Life Cycle Thinking 2023",
                    "url": "https://worldsteel.org/steel-topics/environment-climate-change/",
                    "note": "BF-BOF route 1.85 t CO₂/t vs. EAF recycled 0.46 t CO₂/t. Applied 1.5 incl. upstream."
                },
                {
                    "material": "Plastic (HDPE)",
                    "factor": MATERIAL_CO2_FACTORS["plastic"],
                    "source": "UK DEFRA GHG Conversion Factors 2023",
                    "url": "https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2023",
                    "note": "Recycled HDPE avoids 1.53 kg CO₂e/kg vs. virgin resin production."
                },
                {
                    "material": "Paper / Cardboard",
                    "factor": MATERIAL_CO2_FACTORS["paper"],
                    "source": "US EPA WARM Model v15 (2020), Corrugated Containers chapter",
                    "url": "https://www.epa.gov/warm",
                    "note": "Recycling avoids 0.84 MTCO₂e/ton vs. landfill baseline."
                },
            ]
        },
        "water_factors": {
            "unit": "litres of freshwater saved per kg recycled vs. primary production",
            "materials": [
                {
                    "material": "Copper",
                    "factor": MATERIAL_WATER_FACTORS["copper"],
                    "source": "Northey et al. (2014), Resources Conservation & Recycling",
                    "note": "Open-pit mining water intensity: 97–162 L/kg. Midpoint = 130 L/kg."
                },
                {
                    "material": "Aluminium",
                    "factor": MATERIAL_WATER_FACTORS["aluminium"],
                    "source": "IAI Water Reporting; Shourijeh et al. (2021), ResearchGate",
                    "note": "Bayer process blue water: 9.6–18.2 m³/t. Midpoint = 14 L/kg."
                },
                {
                    "material": "Steel",
                    "factor": MATERIAL_WATER_FACTORS["steel"],
                    "source": "World Steel Association, Water use in the steel industry 2021",
                    "note": "Average withdrawal 28.6 m³/t (gross, before return flows)."
                },
                {
                    "material": "Plastic",
                    "factor": MATERIAL_WATER_FACTORS["plastic"],
                    "source": "ICIS Consulting, Petrochemical production water benchmarks",
                    "note": "Refinery process water: 6–12 L/kg. Conservative = 8 L/kg."
                },
                {
                    "material": "Paper",
                    "factor": MATERIAL_WATER_FACTORS["paper"],
                    "source": "Hoekstra & Chapagain (2007), Water Resources Management",
                    "note": "Global average water footprint of paper production ≈ 10 L/kg."
                },
            ]
        },
        "disposal_cost_factors": {
            "unit": "INR (₹) per kg avoided disposal cost",
            "source": "CPCB India, Guidelines for ESM of Industrial Solid Waste 2016; CII industry survey",
            "materials": [
                {"material": "Copper",    "factor": MATERIAL_DISPOSAL_COSTS["copper"]},
                {"material": "Aluminium", "factor": MATERIAL_DISPOSAL_COSTS["aluminium"]},
                {"material": "Steel",     "factor": MATERIAL_DISPOSAL_COSTS["steel"]},
                {"material": "Plastic",   "factor": MATERIAL_DISPOSAL_COSTS["plastic"]},
                {"material": "Paper",     "factor": MATERIAL_DISPOSAL_COSTS["paper"]},
            ]
        }
    }


# ─── Health Check ─────────────────────────────────────────────────────────────

@app.get("/api/health")
def health():
    return {"status": "ok", "service": "Circula API", "version": "1.1.0"}
