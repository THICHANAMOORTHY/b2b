from database import SessionLocal, engine
import models

# Re-create tables
models.Base.metadata.drop_all(bind=engine)
models.Base.metadata.create_all(bind=engine)

db = SessionLocal()

companies = [
    models.Company(id="c1", name="ABC Manufacturing", industry="Manufacturing", location="Chennai", verificationStatus="Verified"),
    models.Company(id="c2", name="XYZ Components", industry="Electronics", location="Chennai", verificationStatus="Verified"),
]

resources = [
    models.Resource(id="res1", companyId="c1", name="Copper Scrap", materialType="Copper", quantity=1000, unit="kg", quality="Industrial Grade", location="Chennai North", availability="Immediate", price=45),
    models.Resource(id="res2", companyId="c1", name="Aluminium Scrap", materialType="Aluminium", quantity=500, unit="kg", quality="6061", location="Chennai North", availability="Immediate", price=30),
]

requirements = [
    models.Requirement(id="req1", companyId="c2", materialType="Copper", quantity=800, unit="kg", quality="Industrial Grade", requiredDate="2026-09-10", location="Chennai South"),
]

db.add_all(companies)
db.add_all(resources)
db.add_all(requirements)

db.commit()

print("Database seeded with mock data. Run /api/generate-matches to generate matches.")
db.close()
