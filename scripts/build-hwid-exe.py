# Script para convertir HWID.py a ejecutable .exe
# Requiere: pip install pyinstaller

import subprocess
import os
import sys

def build_exe():
    print("=" * 60)
    print("CREANDO EJECUTABLE HWID.exe")
    print("=" * 60)
    
    # Verificar que existe HWID.py
    if not os.path.exists("scripts/HWID.py"):
        print("\n[ERROR] No se encuentra scripts/HWID.py")
        return False
    
    # Comando PyInstaller
    cmd = [
        "pyinstaller",
        "--onefile",                    # Un solo archivo .exe
        "--name=HWID",                  # Nombre del ejecutable
        "--console",                    # Ventana de consola
        "--icon=dist/ainside-icon.ico", # Icono AInside
        "--clean",                      # Limpiar cache
        "--noconfirm",                  # No pedir confirmación
        "scripts/HWID.py"
    ]
    
    print("\n[1/3] Compilando con PyInstaller...")
    print(f"Comando: {' '.join(cmd)}\n")
    
    try:
        result = subprocess.run(cmd, check=True, capture_output=True, text=True)
        print(result.stdout)
        
        print("\n[2/3] Verificando ejecutable...")
        exe_path = "dist/HWID.exe"
        
        if os.path.exists(exe_path):
            size_mb = os.path.getsize(exe_path) / (1024 * 1024)
            print(f"✓ HWID.exe creado correctamente")
            print(f"  Tamaño: {size_mb:.2f} MB")
            print(f"  Ubicación: {os.path.abspath(exe_path)}")
            
            print("\n" + "=" * 60)
            print("¡EXITO! Ejecutable creado")
            print("=" * 60)
            print("\nUSO:")
            print("  HWID.exe                 → Muestra el HWID del PC")
            print("  HWID.exe --service       → Inicia servicio en localhost:8787")
            print("\nDISTRIBUCION:")
            print("  - Incluir HWID.exe en el paquete ZIP")
            print("  - Ya NO necesita Python instalado")
            print("  - Funciona en cualquier Windows")
            print("  - Incluye la clave pública dentro del .exe")
            
            return True
        else:
            print("\n[ERROR] No se generó el ejecutable")
            return False
            
    except subprocess.CalledProcessError as e:
        print(f"\n[ERROR] Falló la compilación:")
        print(e.stderr)
        return False
    except Exception as e:
        print(f"\n[ERROR] {str(e)}")
        return False

if __name__ == "__main__":
    # Verificar PyInstaller
    try:
        import PyInstaller
    except ImportError:
        print("[ERROR] PyInstaller no está instalado")
        print("\nInstalar con:")
        print("  pip install pyinstaller")
        sys.exit(1)
    
    # Cambiar al directorio del proyecto
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_dir = os.path.dirname(script_dir)
    os.chdir(project_dir)
    
    # Compilar
    if build_exe():
        print("\n[OK] Proceso completado")
        sys.exit(0)
    else:
        print("\n[ERROR] Proceso fallido")
        sys.exit(1)
