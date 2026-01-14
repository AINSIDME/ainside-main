# ========================================
# GUIA: FIRMAR HWID.exe DIGITALMENTE
# ========================================

## ¿POR QUE FIRMAR EL EJECUTABLE?

Windows SmartScreen bloquea ejecutables sin firma digital mostrando:
  "Windows protegió su PC"
  "Editor desconocido"
  
Con firma digital:
  ✓ Aparece tu nombre/empresa como "Editor verificado"
  ✓ No hay advertencias de SmartScreen (después de 1-2 semanas)
  ✓ Mayor confianza de los usuarios
  ✓ Instaladores más profesionales

## PASO 1: OBTENER CERTIFICADO DE FIRMA DE CÓDIGO

### Opción A: Certificado EV (Extended Validation) - RECOMENDADO
Precio: ~$400/año
Ventajas:
  - Reputación inmediata con SmartScreen (sin periodo de espera)
  - Máxima confianza
  - Se almacena en USB Token físico

Proveedores:
  - DigiCert EV Code Signing: $469/año
    https://www.digicert.com/signing/code-signing-certificates
  - GlobalSign EV: $449/año
    https://www.globalsign.com/en/code-signing-certificate/ev-code-signing

### Opción B: Certificado Standard
Precio: ~$100-200/año
Ventajas:
  - Más económico
  - Suficiente para aplicaciones internas

Desventajas:
  - Necesita "reputación" (1-2 semanas con descargas)
  - SmartScreen puede mostrar advertencia inicial

Proveedores:
  - Certum Code Signing: $119/año
    https://www.certum.eu/en/cert_offer_code_signing/
  - K Software: $84/año
    https://www.ksoftware.net/code-signing-certificates/
  - Sectigo/Comodo: $199/año
    https://sectigo.com/ssl-certificates-tls/code-signing

### Opción C: Auto-firmado (SOLO PARA PRUEBAS)
Precio: GRATIS
Ventajas:
  - No cuesta nada
  - Sirve para pruebas internas

Desventajas:
  - Windows SIEMPRE lo bloqueará
  - NO sirve para distribución pública
  - Solo útil para desarrollo

## PASO 2: INSTALAR WINDOWS SDK (para signtool.exe)

Descarga: https://developer.microsoft.com/en-us/windows/downloads/windows-sdk/

Durante instalación:
  ✓ Marcar: "Windows SDK Signing Tools for Desktop Apps"
  ✗ Desmarcar: Todo lo demás (opcional)

Alternativa: Instalar Visual Studio con componente "Windows SDK"

## PASO 3: PREPARAR CERTIFICADO

Tu proveedor te enviará:
  - archivo .pfx o .p12 (certificado + clave privada)
  - contraseña del certificado

Guardar en ubicación segura:
  C:\Certificados\ainside-code-signing.pfx

## PASO 4: FIRMAR EL EJECUTABLE

### Opción A: Usar el script automático

```powershell
python scripts\sign-hwid-exe.py --cert "C:\Certificados\ainside-code-signing.pfx" --password "TU_PASSWORD"
```

### Opción B: Firmar manualmente con signtool

```powershell
# Buscar signtool.exe
$signtool = "C:\Program Files (x86)\Windows Kits\10\bin\10.0.22621.0\x64\signtool.exe"

# Firmar
& $signtool sign `
  /f "C:\Certificados\ainside-code-signing.pfx" `
  /p "TU_PASSWORD" `
  /t "http://timestamp.digicert.com" `
  /fd SHA256 `
  /d "AInside HWID License Tool" `
  /du "https://ainside.com" `
  dist\HWID.exe

# Verificar firma
& $signtool verify /pa dist\HWID.exe
```

## PASO 5: VERIFICAR LA FIRMA

En Windows:
  1. Click derecho en HWID.exe
  2. Propiedades
  3. Pestaña "Firmas digitales"
  4. Debe aparecer tu nombre/empresa
  5. "Esta firma digital es válida"

En PowerShell:
```powershell
Get-AuthenticodeSignature dist\HWID.exe
```

Resultado esperado:
  Status        : Valid
  SignerCertificate : CN=Tu Empresa

## PASO 6: DISTRIBUIR

Una vez firmado:
  1. Actualizar paquete ZIP con HWID.exe firmado
  2. Subir a tu servidor
  3. Los usuarios NO verán advertencias de SmartScreen

## SMARTSCREEN FILTER - CONSTRUIR REPUTACIÓN

Incluso con certificado Standard, al principio SmartScreen puede mostrar:
  "Windows Defender SmartScreen impidió el inicio de una aplicación no reconocida"

Para construir reputación:
  1. Conseguir 100+ descargas legítimas
  2. Esperar 1-2 semanas
  3. Evitar reportes de malware
  4. Mantener firma válida

Con certificado EV: reputación inmediata

## AUTO-FIRMA (SOLO DESARROLLO)

Si no quieres comprar certificado y es solo para pruebas:

```powershell
# Crear certificado auto-firmado
$cert = New-SelfSignedCertificate `
  -Subject "CN=AInside Development" `
  -Type CodeSigning `
  -CertStoreLocation Cert:\CurrentUser\My

# Exportar a PFX
$pwd = ConvertTo-SecureString -String "test123" -Force -AsPlainText
Export-PfxCertificate -Cert $cert -FilePath "ainside-dev.pfx" -Password $pwd

# Firmar
signtool sign /f ainside-dev.pfx /p test123 /fd SHA256 dist\HWID.exe
```

⚠️ IMPORTANTE: Esto NO eliminará las advertencias de Windows en PCs de terceros.

## COSTOS RESUMIDOS

| Tipo              | Precio/año | Reputación    | Recomendado |
|-------------------|------------|---------------|-------------|
| EV Code Signing   | $400-500   | Inmediata     | ✓ Sí       |
| Standard          | $100-200   | 1-2 semanas   | ✓ Aceptable|
| Auto-firmado      | GRATIS     | Nunca         | ✗ No       |

## RECOMENDACIÓN FINAL

Para distribución comercial:
  → Compra Sectigo/Certum Standard ($100-200/año)
  → Firma todos tus ejecutables
  → Espera 2 semanas para reputación
  → Renueva antes de expirar

Para máxima profesionalidad:
  → Compra DigiCert EV ($400/año)
  → Reputación inmediata
  → USB Token incluido

## SOPORTE

Si tienes el certificado pero no funciona:
  python scripts\sign-hwid-exe.py --cert "TU_CERTIFICADO.pfx" --password "TU_PASSWORD"

El script te mostrará exactamente qué falta.

## ARCHIVOS RELACIONADOS

- scripts/build-hwid-exe.py    → Compila HWID.py a .exe
- scripts/sign-hwid-exe.py     → Firma el .exe con certificado
- dist/HWID.exe                → Ejecutable final (62 MB)

## NOTA IMPORTANTE

El .exe de 62 MB es NORMAL. Incluye:
  - Intérprete Python completo
  - Todas las librerías (cryptography, httpx, etc)
  - Todo empaquetado en un solo archivo portable

Alternativas para reducir tamaño:
  - Usar UPX compression (no recomendado, algunos antivirus lo detectan)
  - No incluir algunas librerías (requiere modificar código)
  - 62 MB es aceptable para distribución moderna
