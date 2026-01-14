# Script para firmar digitalmente HWID.exe
# Requiere: Certificado de firma de código (.pfx o .p12)

import subprocess
import os
import sys

def find_signtool():
    """Busca signtool.exe en las ubicaciones comunes del Windows SDK"""
    possible_paths = [
        r"C:\Program Files (x86)\Windows Kits\10\bin\10.0.22621.0\x64\signtool.exe",
        r"C:\Program Files (x86)\Windows Kits\10\bin\10.0.19041.0\x64\signtool.exe",
        r"C:\Program Files (x86)\Windows Kits\10\bin\10.0.18362.0\x64\signtool.exe",
        r"C:\Program Files (x86)\Microsoft SDKs\Windows\v7.1A\Bin\signtool.exe",
    ]
    
    # Buscar en todas las versiones del SDK
    sdk_base = r"C:\Program Files (x86)\Windows Kits\10\bin"
    if os.path.exists(sdk_base):
        for version in os.listdir(sdk_base):
            path = os.path.join(sdk_base, version, "x64", "signtool.exe")
            if os.path.exists(path):
                return path
    
    # Verificar rutas comunes
    for path in possible_paths:
        if os.path.exists(path):
            return path
    
    return None

def sign_exe(exe_path, cert_path, cert_password=None, timestamp_url="http://timestamp.digicert.com"):
    """
    Firma digitalmente un ejecutable .exe
    
    Args:
        exe_path: Ruta al archivo .exe a firmar
        cert_path: Ruta al certificado .pfx o .p12
        cert_password: Contraseña del certificado (opcional)
        timestamp_url: URL del servidor de timestamp
    """
    
    print("=" * 60)
    print("FIRMA DIGITAL DE HWID.exe")
    print("=" * 60)
    
    # Verificar que existe el .exe
    if not os.path.exists(exe_path):
        print(f"\n[ERROR] No se encuentra: {exe_path}")
        return False
    
    # Verificar que existe el certificado
    if not os.path.exists(cert_path):
        print(f"\n[ERROR] No se encuentra el certificado: {cert_path}")
        print("\nNECESITAS UN CERTIFICADO DE FIRMA DE CÓDIGO")
        print("Proveedores recomendados:")
        print("  - DigiCert: ~$400/año (EV Code Signing)")
        print("  - Sectigo/Comodo: ~$200/año (Standard)")
        print("  - GlobalSign: ~$300/año")
        print("  - SSL.com: ~$200/año")
        print("\nAlternativas más baratas:")
        print("  - Certum Code Signing: ~$120/año")
        print("  - K Software: ~$84/año")
        return False
    
    # Buscar signtool.exe
    signtool = find_signtool()
    if not signtool:
        print("\n[ERROR] No se encuentra signtool.exe")
        print("\nNECESITAS INSTALAR:")
        print("  Windows SDK: https://developer.microsoft.com/en-us/windows/downloads/windows-sdk/")
        print("  O Visual Studio con 'Windows SDK' component")
        return False
    
    print(f"\n[1/2] Usando signtool: {signtool}")
    print(f"[2/2] Firmando: {exe_path}")
    
    # Construir comando de firma
    cmd = [
        signtool,
        "sign",
        "/f", cert_path,           # Certificado
        "/t", timestamp_url,       # Timestamp server
        "/fd", "SHA256",           # Hash algorithm
        "/v"                       # Verbose
    ]
    
    # Agregar contraseña si existe
    if cert_password:
        cmd.extend(["/p", cert_password])
    
    # Agregar descripción
    cmd.extend([
        "/d", "AInside HWID License Tool",
        "/du", "https://ainside.com"
    ])
    
    # Agregar el archivo a firmar
    cmd.append(exe_path)
    
    print(f"\nEjecutando firma...")
    
    try:
        result = subprocess.run(cmd, check=True, capture_output=True, text=True)
        print(result.stdout)
        
        print("\n" + "=" * 60)
        print("¡EXITO! Ejecutable firmado")
        print("=" * 60)
        print("\nVERIFICAR FIRMA:")
        print(f"  Click derecho en {os.path.basename(exe_path)} → Propiedades → Pestaña 'Firmas digitales'")
        print("\nBENEFICIOS:")
        print("  ✓ Windows SmartScreen no bloqueará el archivo")
        print("  ✓ Aparece como 'Editor verificado'")
        print("  ✓ Mayor confianza de los usuarios")
        print("  ✓ No aparece advertencia 'Desconocido' al ejecutar")
        
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"\n[ERROR] Falló la firma:")
        print(e.stderr)
        return False

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Firma digitalmente HWID.exe")
    parser.add_argument("--cert", required=True, help="Ruta al certificado .pfx o .p12")
    parser.add_argument("--password", help="Contraseña del certificado")
    parser.add_argument("--exe", default="dist/HWID.exe", help="Ruta al .exe a firmar")
    parser.add_argument("--timestamp", default="http://timestamp.digicert.com", help="URL del timestamp server")
    
    args = parser.parse_args()
    
    if sign_exe(args.exe, args.cert, args.password, args.timestamp):
        print("\n[OK] Proceso completado")
        sys.exit(0)
    else:
        print("\n[ERROR] Proceso fallido")
        sys.exit(1)
