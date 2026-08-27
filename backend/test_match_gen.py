from main import generate_matches
from database import SessionLocal

db = SessionLocal()
try:
    res = generate_matches(db)
    print("Result:", res)
except Exception as e:
    import traceback
    traceback.print_exc()
finally:
    db.close()
