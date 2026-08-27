import models
from database import SessionLocal
from supabase_client import supabase

def sync_all_to_supabase():
    db = SessionLocal()
    print("Starting sync from SQLite to Supabase...")
    
    # 1. Sync Companies
    try:
        companies = db.query(models.Company).all()
        comp_data = [
            {
                "id": c.id,
                "name": c.name,
                "industry": c.industry,
                "location": c.location,
                "verificationStatus": c.verificationStatus or "Verified",
            }
            for c in companies
        ]
        if comp_data:
            supabase.table("companies").upsert(comp_data).execute()
            print(f"Synced {len(comp_data)} companies to Supabase.")
    except Exception as e:
        print("Note: companies table not created yet in Supabase (skipped).")

    # 2. Sync Resources to 'listing datas'
    try:
        resources = db.query(models.Resource).all()
        if resources:
            for idx, r in enumerate(resources, start=1000):
                payload = {
                    "id": idx,
                    "companyId": r.companyId,
                    "name": r.name,
                    "materialType": r.materialType,
                    "quantity": float(r.quantity),
                    "unit": r.unit,
                    "quality": r.quality,
                    "location": r.location,
                    "availability": r.availability,
                    "price": float(r.price),
                }
                supabase.table("listing datas").upsert(payload).execute()
            print(f"Synced {len(resources)} resources to 'listing datas' in Supabase!")
    except Exception as e:
        print("Error syncing to 'listing datas':", e)

    # 3. Sync Requirements
    try:
        requirements = db.query(models.Requirement).all()
        req_data = [
            {
                "id": req.id,
                "companyId": req.companyId,
                "materialType": req.materialType,
                "quantity": float(req.quantity),
                "unit": req.unit,
                "quality": req.quality,
                "requiredDate": req.requiredDate,
                "location": req.location,
            }
            for req in requirements
        ]
        if req_data:
            supabase.table("requirements").upsert(req_data).execute()
            print(f"Synced {len(req_data)} requirements to Supabase.")
    except Exception as e:
        print("Note: requirements table not created yet in Supabase (skipped).")

    # 4. Sync Matches
    try:
        matches = db.query(models.Match).all()
        match_data = [
            {
                "id": m.id,
                "resourceId": m.resourceId,
                "requirementId": m.requirementId,
                "matchScore": float(m.matchScore) if m.matchScore else 0.0,
                "distanceKm": float(m.distanceKm) if m.distanceKm else 0.0,
                "status": m.status or "MATCHED",
                "negotiatedPrice": float(m.negotiatedPrice) if m.negotiatedPrice else None,
                "negotiatedQuantity": float(m.negotiatedQuantity) if m.negotiatedQuantity else None,
                "chatHistory": m.chatHistory,
            }
            for m in matches
        ]
        if match_data:
            supabase.table("matches").upsert(match_data).execute()
            print(f"Synced {len(match_data)} matches to Supabase.")
    except Exception as e:
        print("Note: matches table not created yet in Supabase (skipped).")

    print("\nSync completed successfully!")
    db.close()

if __name__ == "__main__":
    sync_all_to_supabase()
