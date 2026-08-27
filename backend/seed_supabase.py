from supabase_client import supabase

def seed():
    print("Testing Supabase connection from Python...")
    try:
        res = supabase.table("companies").select("*").execute()
        print("Connected! Current companies in Supabase:", res.data)
        
        # Insert initial companies
        companies = [
            {"id": "c1", "name": "ABC Manufacturing", "industry": "Manufacturing", "location": "Chennai", "verificationStatus": "Verified"},
            {"id": "c2", "name": "XYZ Components", "industry": "Electronics", "location": "Chennai", "verificationStatus": "Verified"},
        ]
        supabase.table("companies").upsert(companies).execute()
        print("Seeded companies.")

        # Insert initial resources
        resources = [
            {"id": "res1", "companyId": "c1", "name": "Copper Scrap", "materialType": "Copper", "quantity": 1000, "unit": "kg", "quality": "Industrial Grade", "location": "Chennai North", "availability": "Immediate", "price": 45},
            {"id": "res2", "companyId": "c1", "name": "Aluminium Scrap", "materialType": "Aluminium", "quantity": 500, "unit": "kg", "quality": "6061", "location": "Chennai North", "availability": "Immediate", "price": 30},
        ]
        supabase.table("resources").upsert(resources).execute()
        print("Seeded resources.")

        # Insert initial requirements
        requirements = [
            {"id": "req1", "companyId": "c2", "materialType": "Copper", "quantity": 800, "unit": "kg", "quality": "Industrial Grade", "requiredDate": "2026-09-10", "location": "Chennai South"},
        ]
        supabase.table("requirements").upsert(requirements).execute()
        print("Seeded requirements.")
        
        print("All data successfully synced with Supabase!")
    except Exception as e:
        print("Supabase connection message:", e)
        print("Note: If the tables do not exist yet, please run the SQL from supabase_schema.sql in your Supabase SQL editor.")

if __name__ == "__main__":
    seed()
