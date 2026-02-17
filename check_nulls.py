import sqlite3
import os

db_path = 'refrielectricos.db'

def check_nulls():
    if not os.path.exists(db_path):
        print("DB not found")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT id, total_estimated FROM quotations WHERE total_estimated IS NULL")
    rows = cursor.fetchall()
    print(f"Found {len(rows)} nulls")
    for r in rows:
        print(r)
    conn.close()

if __name__ == "__main__":
    check_nulls()
