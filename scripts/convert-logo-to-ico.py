# Convertir logo PNG a ICO para usar como icono del .exe
from PIL import Image
import os

# Ruta de entrada (el usuario proporcionó la imagen)
input_png = "ainside-logo.png"
output_ico = "dist/ainside-icon.ico"

# Verificar si existe el PNG
if not os.path.exists(input_png):
    print(f"[INFO] Guardando el logo primero...")
    # El usuario debe guardar la imagen como ainside-logo.png
    print("Por favor guarda el logo como: ainside-logo.png")
    exit(1)

# Abrir y redimensionar
print("Convirtiendo logo a formato .ico...")
img = Image.open(input_png)

# Crear múltiples tamaños para el icono (Windows usa diferentes tamaños)
sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
img_resized = []

for size in sizes:
    img_temp = img.resize(size, Image.Resampling.LANCZOS)
    img_resized.append(img_temp)

# Guardar como .ico con múltiples tamaños
img_resized[0].save(output_ico, format='ICO', sizes=[s for s in sizes])

print(f"✓ Icono creado: {output_ico}")
print(f"  Tamaños incluidos: {sizes}")
