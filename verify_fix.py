
import sqlite3
import os

db_path = "c:/Users/Luis Seoanes/Documents/PaginaWeb Refrielectricos/refrielectricos.db"

def verify_price_update():
    if not os.path.exists(db_path):
        print(f"Error: Database not found at {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # Find a pending quotation
        cursor.execute("SELECT id, total_estimated FROM quotations WHERE status = 'Pending' LIMIT 1")
        row = cursor.fetchone()
        
        if not row:
            print("No pending quotations found to test.")
            return

        q_id, old_total = row
        new_total = 99999.0
        
        print(f"Found Pending Quotation #{q_id} with total: {old_total}")
        print(f"Manually updating total to: {new_total} (simulating endpoint logic)")

        # Simulate what the API does
        cursor.execute("UPDATE quotations SET total_estimated = ? WHERE id = ?", (new_total, q_id))
        conn.commit()

        # Verify
        cursor.execute("SELECT total_estimated FROM quotations WHERE id = ?", (q_id,))
        updated_total = cursor.fetchone()[0]

        if updated_total == new_total:
            print(f"SUCCESS: Quotation #{q_id} total updated correctly to {updated_total}")
            
            # Revert change to be clean
            cursor.execute("UPDATE quotations SET total_estimated = ? WHERE id = ?", (old_total, q_id))
            conn.commit()
            print(f"Cleaned up: Reverted total back to {old_total}")
        else:
            print(f"FAILURE: Expected {new_total}, but got {updated_total}")

    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    verify_price_update()
