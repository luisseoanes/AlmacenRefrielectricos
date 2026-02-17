import sqlite3
import os

db_path = 'refrielectricos.db'

def verify_schema():
    if not os.path.exists(db_path):
        print("DB not found")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("PRAGMA table_info(quotations)")
    columns = cursor.fetchall()
    print("Columns in 'quotations' table:")
    for col in columns:
        print(f"ID: {col[0]}, Name: {col[1]}, Type: {col[2]}")
    conn.close()

if __name__ == "__main__":
    verify_schema()
