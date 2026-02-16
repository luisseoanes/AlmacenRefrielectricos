from backend import models, database, auth
from sqlalchemy.orm import Session

# Create tables
models.Base.metadata.create_all(bind=database.engine)

db = database.SessionLocal()

def seed(db: Session):
    # Create Admin User
    admin_user = db.query(models.User).filter(models.User.username == "admin").first()
    if not admin_user:
        hashed_pw = auth.get_password_hash("admin123") # Default password
        admin_user = models.User(username="admin", hashed_password=hashed_pw)
        db.add(admin_user)
        print("Created admin user (password: admin123)")
    else:
        print("Admin user already exists")

    # Seed Products if empty
    if db.query(models.Product).count() == 0:
        products = [
            models.Product(
                name="Unidades de Aire",
                category="aire",
                price=320000,
                price_text="Desde $320.000 COP",
                image_url="https://images.unsplash.com/photo-1724488751821-1415f5cf4960?auto=format&fit=crop&w=1200&q=60",
                brands="Donper Embraco Tecunseh LG GMCC",
                search_tags="unidades aire donper embraco tecunseh lg gmcc compresor",
                options="Donper ($320.000)|Embraco ($350.000)|Tecunseh ($380.000)|LG ($340.000)|GMCC ($330.000)",
                description="Marcas disponibles: Donper, Embraco, Tecunseh, LG, GMCC"
            ),
             models.Product(
                name="Rubatex",
                category="refrigeracion",
                price=8500,
                price_text="Desde $8.500 COP / metro",
                image_url="https://images.unsplash.com/photo-1664693641366-83170c06b230?auto=format&fit=crop&w=1200&q=60",
                brands="Rubatex",
                search_tags="rubatex aislamiento espuma 3/8 5/16 1/4 1/2 5/8",
                options="3/8 ($8.500)|5/16 ($9.000)|1/4 ($7.500)|1/2 ($12.000)|5/8 ($15.000)",
                description="Medidas disponibles: 3/8, 5/16, 1/4, 1/2, 5/8. Ventas por metro o rollo"
            ),
            models.Product(
                name="Cintas Vinilo",
                category="consumibles",
                price=6000,
                price_text="Desde $6.000 COP",
                image_url="https://images.unsplash.com/photo-1760377821917-722e631cd716?auto=format&fit=crop&w=1200&q=60",
                brands="Vinilo",
                search_tags="cintas vinilo cinta aislante colores",
                options="Negra ($6.000)|Roja ($6.000)|Azul ($6.000)|Verde ($6.000)|Amarilla ($6.000)",
                description="Varios colores y anchos. Uso eléctrico y aislamiento"
            ),
            models.Product(
                name="Gases Refrigerantes",
                category="refrigeracion",
                price=22000,
                price_text="Desde $22.000 COP",
                image_url="https://images.unsplash.com/photo-1760036455561-3044404472db?auto=format&fit=crop&w=1200&q=60",
                brands="R134a R600 R290 R404",
                search_tags="gases refrigerantes r134a r600 r290 r404 pipetas",
                options="R134A pequeño ($22.000)|R134A grande ($45.000)|R600 pipeta ($25.000)|R290 pipeta ($28.000)|R404 grande ($50.000)",
                description="134A, R600, R290, 404. Presentación pequeña, grande y pipetas"
            ),
             models.Product(
                name="Mangueras",
                category="lavado",
                price=18000,
                price_text="Desde $18.000 COP",
                image_url="https://images.unsplash.com/photo-1764046907576-6786dee69c51?auto=format&fit=crop&w=1200&q=60",
                brands="LG Samsung",
                search_tags="mangueras aire lavadoras lg samsung",
                options="Lavadora LG/Samsung ($18.000)|Aire split ($20.000)|Universal ($15.000)",
                description="Para aire y lavadoras. Compatibles LG, Samsung y más"
            ),
             models.Product(
                name="Tuberías",
                category="refrigeracion",
                price=22000,
                price_text="Desde $22.000 COP / metro",
                image_url="https://images.unsplash.com/photo-1723988429049-0a42e45e8501?auto=format&fit=crop&w=1200&q=60",
                brands="",
                search_tags="tuberias cobre 3/16 1/4 5/16 3/8 1/2 rollo",
                options="3/16 ($18.000)|1/4 ($22.000)|5/16 ($25.000)|3/8 ($30.000)|1/2 ($45.000)",
                description="3/16, 1/4, 1/2 y más. Por metro o por rollo"
            ),
        ]
        db.add_all(products)
        print(f"Seeded {len(products)} products")
    else:
        print("Products already seeded")

    db.commit()

if __name__ == "__main__":
    seed(db)
    print("Database seeding completed.")
