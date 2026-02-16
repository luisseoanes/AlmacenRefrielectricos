import requests
import sys

BASE_URL = "http://localhost:8000"

def log(msg, status="INFO"):
    print(f"[{status}] {msg}")

def verify():
    # 1. Login
    log("Attempting Login...")
    login_data = {"username": "admin", "password": "admin123"}
    try:
        res = requests.post(f"{BASE_URL}/token", data=login_data)
        if res.status_code != 200:
            log(f"Login failed: {res.text}", "ERROR")
            return
        token = res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        log("Login Successful.")
    except Exception as e:
        log(f"Connection failed: {e}", "ERROR")
        return

    # 2. Get Products
    log("Fetching Products...")
    res = requests.get(f"{BASE_URL}/products/")
    if res.status_code == 200:
        products = res.json()
        log(f"Found {len(products)} products.")
        if len(products) == 0:
            log("No products found, seeding might have failed.", "WARN")
    else:
        log(f"Failed to fetch products: {res.text}", "ERROR")

    # 3. Create Quotation (Public endpoint)
    log("Creating Quotation...")
    quote_data = {
        "customer_name": "Test Customer",
        "customer_contact": "test@example.com",
        "items": [{"product_id": 1, "product_name": "Test Product", "quantity": 1, "option": "Default", "price": 100}],
        "total_estimated": 100
    }
    res = requests.post(f"{BASE_URL}/quotations/", json=quote_data)
    if res.status_code == 200:
        quote_id = res.json()["id"]
        log(f"Quotation created (ID: {quote_id}).")
    else:
        log(f"Failed to create quotation: {res.text}", "ERROR")

    # 4. Verify Quotation as Admin
    log("Verifying Quotation in Admin List...")
    res = requests.get(f"{BASE_URL}/quotations/", headers=headers)
    if res.status_code == 200:
        quotes = res.json()
        found = any(q["id"] == quote_id for q in quotes)
        if found:
            log("Quotation verified in admin list.")
        else:
            log("Quotation NOT found in admin list.", "ERROR")
    else:
        log(f"Failed to fetch quotations: {res.text}", "ERROR")

if __name__ == "__main__":
    verify()
