from backend import models, database
from sqlalchemy import text

def clean_database():
    db = database.SessionLocal()
    try:
        print("--- Iniciando limpieza de Base de Datos ---")
        
        # Eliminar registros de tablas específicas
        num_quotations = db.query(models.Quotation).delete()
        print(f"✓ Cotizaciones eliminadas: {num_quotations}")
        
        num_products = db.query(models.Product).delete()
        print(f"✓ Productos eliminados: {num_products}")
        
        num_categories = db.query(models.Category).delete()
        print(f"✓ Categorías eliminadas: {num_categories}")
        
        # Reiniciar contadores (ID) en SQLite
        try:
            db.execute(text("DELETE FROM sqlite_sequence WHERE name IN ('products', 'categories', 'quotations')"))
            print("✓ Contadores de ID reiniciados.")
        except Exception as seq_e:
            print(f"! Aviso: No se pudieron reiniciar los contadores: {seq_e}")
        
        db.commit()
        print("------------------------------------------")
        print("¡ÉXITO! Los datos han sido limpiados.")
        print("La tabla de USUARIOS se mantuvo intacta.")
        
    except Exception as e:
        db.rollback()
        print(f"CRÍTICO: Error durante la limpieza: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    clean_database()
