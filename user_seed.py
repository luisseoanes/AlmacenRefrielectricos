import os
import sys
import traceback

# Add the project root to sys.path to allow importing from 'backend'
sys.path.append(os.getcwd())

from backend import models, database, auth
from sqlalchemy.orm import Session

def seed_real_data():
    db = database.SessionLocal()
    try:
        print("--- [DEBUG] Iniciando Carga ---")
        
        # 1. Limpiar datos previos
        print("[DEBUG] Intentando borrar productos...")
        db.query(models.Product).delete()
        print("[DEBUG] Intentando borrar categorías...")
        db.query(models.Category).delete()
        print("✓ Tablas limpias.")

        # 2. Definir Categorías
        print("[DEBUG] Creando categorías...")
        categories = [
            models.Category(name="compresores", tags="compresor motor refrigeracion donper embraco"),
            models.Category(name="refrigeracion", tags="nevera timer control frio cortina cuarto frio"),
            models.Category(name="estufas", tags="suiche perilla valvula haceb mabe calor"),
            models.Category(name="herramientas", tags="bomba vacio manometro herramienta refrigeracion"),
            models.Category(name="repuestos", tags="repuesto original generico")
        ]
        db.add_all(categories)
        print("✓ Categorías en sesión.")

        # 3. Lista de Productos
        print("[DEBUG] Creando productos...")
        new_products = [
            models.Product(
                name="Compresor Donper 1/6 R600 SJ96XY1 631BTU",
                code="3494",
                category="compresores",
                price=300000,
                price_text="Consultar Precio",
                image_url="https://images.unsplash.com/photo-1724488751821-1415f5cf4960?auto=format&fit=crop&w=1200&q=60",
                brands="Donper",
                search_tags="compresor refrigeracion donper 1/6 r600 sj96xy1",
                options="Estándar",
                description="Compresor Donper 1/6 R600 SJ96XY1 631BTU 1010080"
            ),
            models.Product(
                name="Compresor Donper 1/6 R134 LK56XZ1 631 BTU",
                code="2429",
                category="compresores",
                price=275000,
                price_text="Consultar Precio",
                image_url="https://images.unsplash.com/photo-1724488751821-1415f5cf4960?auto=format&fit=crop&w=1200&q=60",
                brands="Donper",
                search_tags="compresor refrigeracion donper 1/6 r134 lk56xz1",
                options="Estándar",
                description="Compresor Donper 1/6 R134 LK56XZ1 3016216 631 BTU"
            )
        ]
        
        db.add_all(new_products)
        print("[DEBUG] Intentando commit...")
        db.commit()
        print("✓ Carga completada.")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Falló la carga: {e}")
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    seed_real_data()
