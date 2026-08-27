import sqlite3

conn = sqlite3.connect("circula.db")
cursor = conn.cursor()

# Check and add columns to matches
columns_to_add = [
    ("matches", "negotiatedPrice", "REAL"),
    ("matches", "negotiatedQuantity", "REAL"),
    ("matches", "chatHistory", "TEXT"),
    ("resources", "embedding", "TEXT"),
    ("requirements", "embedding", "TEXT"),
]

for table, col, col_type in columns_to_add:
    try:
        cursor.execute(f"ALTER TABLE {table} ADD COLUMN {col} {col_type}")
        print(f"Added column {col} to {table} table.")
    except Exception as e:
        print(f"Column {col} on {table} already exists or error: {e}")

conn.commit()
conn.close()
print("SQLite schema updated successfully.")
