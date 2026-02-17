import sqlite3
import os

# Database path
db_path = 'refrielectricos.db'

def seed_real_data_direct():
    if not os.path.exists(db_path):
        print(f"Error: No se encontró {db_path}")
        return

    print(f"--- Iniciando Carga Directa a {db_path} ---")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # 1. Limpiar datos previos
        print("Borrando productos y categorías actuales...")
        cursor.execute("DELETE FROM products")
        cursor.execute("DELETE FROM categories")
        cursor.execute("DELETE FROM sqlite_sequence WHERE name IN ('products', 'categories')")
        
        # 2. Insertar Categorías
        print("Insertando categorías...")
        categories = [
            ("compresores", "compresor motor refrigeracion donper embraco"),
            ("refrigeracion", "nevera timer control frio cortina cuarto frio"),
            ("estufas", "suiche perilla valvula haceb mabe calor"),
            ("herramientas", "bomba vacio manometro herramienta refrigeracion"),
            ("repuestos", "repuesto original generico")
        ]
        cursor.executemany("INSERT INTO categories (name, tags) VALUES (?, ?)", categories)

        # 3. Insertar Productos
        print("Insertando productos...")
        # (code, name, category, price, price_text, image_url, brands, search_tags, options, description)
        products = [
            ("3494", "Compresor Donper 1/6 R600 SJ96XY1 631BTU", "compresores", 300000.0, "Consultar Precio", "https://images.unsplash.com/photo-1724488751821-1415f5cf4960?auto=format&fit=crop&w=1200&q=60", "Donper", "compresor refrigeracion donper 1/6 r600 sj96xy1", "Estándar", "Compresor Donper 1/6 R600 SJ96XY1 631BTU 1010080"),
            ("2429", "Compresor Donper 1/6 R134 LK56XZ1 631 BTU", "compresores", 275000.0, "Consultar Precio", "https://images.unsplash.com/photo-1724488751821-1415f5cf4960?auto=format&fit=crop&w=1200&q=60", "Donper", "compresor refrigeracion donper 1/6 r134 lk56xz1", "Estándar", "Compresor Donper 1/6 R134 LK56XZ1 3016216 631 BTU"),
            ("2428", "Compresor Donper 1/5 R600 LZ111BY1 682 BTU", "compresores", 305000.0, "Consultar Precio", "https://images.unsplash.com/photo-1724488751821-1415f5cf4960?auto=format&fit=crop&w=1200&q=60", "Donper", "compresor refrigeracion donper 1/5 r600 lz111by1", "Estándar", "Compresor Donper 1/5 R600 LZ111BY1 682 BTU"),
            ("789", "Suiche 3 calores grande suelto 1003235", "estufas", 25000.0, "Consultar Precio", "https://images.unsplash.com/photo-1760377821917-722e631cd716?auto=format&fit=crop&w=1200&q=60", "Haceb", "suiche 3 calores grande estufa control", "Estándar", "Suiche 3 calores grande suelto 1003235"),
            ("554", "Suiche 3 calores pequeño 1002213", "estufas", 25000.0, "Consultar Precio", "https://images.unsplash.com/photo-1760377821917-722e631cd716?auto=format&fit=crop&w=1200&q=60", "Haceb", "suiche 3 calores pequeño estufa control", "Estándar", "Suiche 3 calores pequeño 1002213"),
            ("587", "Perilla eléctrica plana switch 3 calores 30189", "estufas", 20000.0, "Consultar Precio", "https://images.unsplash.com/photo-1760377821917-722e631cd716?auto=format&fit=crop&w=1200&q=60", "Genérica", "perilla electrica plana switch 3 calores", "Estándar", "Perilla eléctrica plana switch 3 calores 30189"),
            ("2425", "Timer nevera Haceb Sankyo 6 horas original 3019899", "refrigeracion", 32000.0, "Consultar Precio", "https://images.unsplash.com/photo-1760036455561-3044404472db?auto=format&fit=crop&w=1200&q=60", "Haceb", "timer nevera haceb sankyo 6 horas original", "Estándar", "Timer nevera Haceb Sankyo 6 horas original 3019899"),
            ("2168", "Timer nevera Parangón 6 horas original", "refrigeracion", 32000.0, "Consultar Precio", "https://images.unsplash.com/photo-1760036455561-3044404472db?auto=format&fit=crop&w=1200&q=60", "Paragon", "timer nevera paragon 6 horas original", "Estándar", "Timer nevera Parangón 6 horas original"),
            ("2436", "Timer nevera Paragon 6 horas genérico", "refrigeracion", 25000.0, "Consultar Precio", "https://images.unsplash.com/photo-1760036455561-3044404472db?auto=format&fit=crop&w=1200&q=60", "Paragon Genérico", "timer nevera paragon 6 horas generico", "Estándar", "Timer nevera Paragon 6 horas genérico"),
            ("2757", "Timer nevera Paragon 4 horas genérico", "refrigeracion", 25000.0, "Consultar Precio", "https://images.unsplash.com/photo-1760036455561-3044404472db?auto=format&fit=crop&w=1200&q=60", "Paragon Genérico", "timer nevera paragon 4 horas generico", "Estándar", "Timer nevera Paragon 4 horas genérico"),
            ("2166", "Timer nevera Mabe TMDJK35RB9 ORIGINAL WG03F05130", "refrigeracion", 35000.0, "Consultar Precio", "https://images.unsplash.com/photo-1760036455561-3044404472db?auto=format&fit=crop&w=1200&q=60", "Mabe", "timer nevera mabe original tmdjk35rb9", "Estándar", "Timer nevera Mabe TMDJK35RB9 ORIGINAL WG03F05130"),
            ("2491", "Timer nevera Mabe GENÉRICO", "refrigeracion", 25000.0, "Consultar Precio", "https://images.unsplash.com/photo-1760036455561-3044404472db?auto=format&fit=crop&w=1200&q=60", "Mabe Genérico", "timer nevera mabe generico universal", "Estándar", "Timer nevera Mabe GENÉRICO"),
            ("0870", "Válvula estufa Haceb aluminio recta 1002770-1002772", "estufas", 65000.0, "Consultar Precio", "https://images.unsplash.com/photo-1764046907576-6786dee69c51?auto=format&fit=crop&w=1200&q=60", "Haceb", "valvula haceb estufa aluminio recta", "Estándar", "Válvula estufa Haceb aluminio recta 1002770-1002772"),
            ("2573", "Válvula estufa Haceb espigo corto aluminio 3016702", "estufas", 65000.0, "Consultar Precio", "https://images.unsplash.com/photo-1764046907576-6786dee69c51?auto=format&fit=crop&w=1200&q=60", "Haceb", "valvula haceb estufa espigo corto", "Estándar", "Válvula estufa Haceb espigo corto aluminio 3016702"),
            ("1894", "Válvula estufa Haceb espigo largo aluminio 3016703", "estufas", 65000.0, "Consultar Precio", "https://images.unsplash.com/photo-1764046907576-6786dee69c51?auto=format&fit=crop&w=1200&q=60", "Haceb", "valvula haceb estufa espigo largo", "Estándar", "Válvula estufa Haceb espigo largo aluminio 3016703"),
            ("0869", "Válvula estufa Haceb aluminio codo 1003103-1008358", "estufas", 65000.0, "Consultar Precio", "https://images.unsplash.com/photo-1764046907576-6786dee69c51?auto=format&fit=crop&w=1200&q=60", "Haceb", "valvula haceb estufa aluminio codo", "Estándar", "Válvula estufa Haceb aluminio codo 1003103-1008358"),
            ("0872", "Válvula estufa Mabe aluminio recta bajita WS01F04604", "estufas", 65000.0, "Consultar Precio", "https://images.unsplash.com/photo-1764046907576-6786dee69c51?auto=format&fit=crop&w=1200&q=60", "Mabe", "valvula mabe estufa aluminio recta bajita", "Estándar", "Válvula estufa Mabe aluminio recta bajita WS01F04604"),
            ("0874", "Válvula estufa Mabe aluminio codo WS01F04973-WS01F04976", "estufas", 65000.0, "Consultar Precio", "https://images.unsplash.com/photo-1764046907576-6786dee69c51?auto=format&fit=crop&w=1200&q=60", "Mabe", "valvula mabe estufa aluminio codo", "Estándar", "Válvula estufa Mabe aluminio codo WS01F04973-WS01F04976"),
            ("", "CAJA MARCHA LCD631 ORIGINAL", "repuestos", 90000.0, "Consultar Precio", "https://images.unsplash.com/photo-1664693641366-83170c06b230?auto=format&fit=crop&w=1200&q=60", "Original", "caja marcha lcd631 original electronica", "Estándar", "CAJA MARCHA LCD631 ORIGINAL"),
            ("2490", "Cortina cuarto frío X METRO", "refrigeracion", 55000.0, "Consultar Precio", "https://images.unsplash.com/photo-1723988429049-0a42e45e8501?auto=format&fit=crop&w=1200&q=60", "Universal", "cortina cuarto frio metro aislamiento", "Estándar", "Cortina plástico cuarto frío por metro"),
            ("", "Bomba de vacío", "herramientas", 1040000.0, "Consultar Precio", "https://images.unsplash.com/photo-1760036455561-3044404472db?auto=format&fit=crop&w=1200&q=60", "General", "bomba vacio herramienta refrigeracion tecnico", "5 CFM|7 CFM|10 CFM|12 CFM", "Bomba de vacío para técnicos de refrigeración")
        ]
        
        cursor.executemany("""
            INSERT INTO products (code, name, category, price, price_text, image_url, brands, search_tags, options, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, products)

        conn.commit()
        print(f"✓ {len(products)} Productos cargados satisfactoriamente.")
        print("✓ Carga completada con éxito.")

    except Exception as e:
        conn.rollback()
        print(f"[ERROR] Falló la carga: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    seed_real_data_direct()
