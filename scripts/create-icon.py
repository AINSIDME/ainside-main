# Convertir logo existente a ICO
from PIL import Image
import os

# Usar el logo master existente
input_png = "public/brand/logo-master.png"
output_ico = "dist/ainside-icon.ico"

if not os.path.exists(input_png):
    print(f"[ERROR] No se encuentra: {input_png}")
    exit(1)

print("Convirtiendo logo AInside a formato .ico...")
img = Image.open(input_png)

# Convertir a RGBA si no lo es
if img.mode != 'RGBA':
    img = img.convert('RGBA')

# Crear múltiples tamaños para el icono
sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]

# Guardar como .ico con múltiples tamaños
img.save(output_ico, format='ICO', sizes=sizes)

print(f"✓ Icono creado: {output_ico}")
print(f"  Fuente: {input_png}")
print(f"  Tamaños: {sizes}")
