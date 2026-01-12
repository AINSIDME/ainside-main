# ⚡ PASO A PASO - Instalación Rápida (15 minutos)

Sigue estos pasos EN ORDEN. Marca cada uno al completarlo.

---

## ☑️ PASO 1: Compilar la DLL (5 min)

### 1.1 Abre Visual Studio 2022

```powershell
# Desde la raíz del proyecto:
start dll\AInsideLicenseBridgeCpp\AInsideLicenseBridgeCpp.vcxproj
```

Si no tienes Visual Studio 2022:
- Descarga: https://visualstudio.microsoft.com/downloads/
- Instala: **Community Edition** (gratis)
- Workload: **Desktop development with C++**

### 1.2 Configura el build

En Visual Studio:
1. Arriba, busca el dropdown que dice "Debug" → cámbialo a **Release**
2. Al lado, donde dice "x64" o similar → cámbialo a **Win32**
3. Menu: **Build** → **Build Solution** (o Ctrl+Shift+B)

### 1.3 Verifica que compiló

```powershell
# Debe existir este archivo:
Test-Path "dll\AInsideLicenseBridgeCpp\Release\AInsideLicenseBridgeCpp.dll"
# Debe devolver: True
```

✅ **Marca como completo cuando veas el archivo .dll**

---

## ☑️ PASO 2: Instalar DLL en TradeStation (2 min)

### Opción A - Automático (Recomendado)

```powershell
# Ejecuta el instalador (abre PowerShell como Administrador si pide permisos)
.\scripts\install-tradestation.ps1
```

El script copia automáticamente:
- `AInsideLicenseBridgeCpp.dll` → TradeStation
- `license-public.pem` → TradeStation

### Opción B - Manual

Si el script falla, copia manualmente:

```powershell
# 1. Encuentra tu carpeta de TradeStation
# Normalmente: C:\Program Files (x86)\TradeStation 10.0\Program\

# 2. Copia estos 2 archivos ahí:
Copy-Item "dll\AInsideLicenseBridgeCpp\Release\AInsideLicenseBridgeCpp.dll" "C:\Program Files (x86)\TradeStation 10.0\Program\"
Copy-Item "license-public.pem" "C:\Program Files (x86)\TradeStation 10.0\Program\"
```

✅ **Marca como completo cuando ambos archivos estén en la carpeta de TradeStation**

---

## ☑️ PASO 3: Activar tu licencia (2 min) - UNA SOLA VEZ

```powershell
# Ejecuta el activador
python scripts\HWID.py --activate
```

Te va a pedir:

1. **Order ID**: 
   - Búscalo en tu email de compra
   - Ejemplo: `ord_1234567890abc`
   
2. **Email**:
   - El email que usaste para comprar
   - Ejemplo: `tucorreo@ejemplo.com`

Si todo va bien, verás:
```
✓ Activation successful
deviceSecret stored locally
```

**⚠️ Este paso solo se hace UNA VEZ por PC.**

✅ **Marca como completo cuando veas "Activation successful"**

---

## ☑️ PASO 4: Iniciar servicio local (1 min) - ANTES DE CADA SESIÓN

```powershell
# Inicia el servicio (déjalo corriendo)
python scripts\HWID.py --service
```

Debes ver:
```
[AInside] Local License Service running at http://127.0.0.1:8787 (/status, /health)
```

**💡 IMPORTANTE:** 
- NO CIERRES esta ventana
- Este servicio DEBE estar corriendo mientras operas
- Abre TradeStation en otra ventana

### Test rápido (opcional):

Abre navegador y ve a: `http://127.0.0.1:8787/health`

Debe mostrar: `{"ok":true}`

✅ **Marca como completo cuando el servicio esté corriendo**

---

## ☑️ PASO 5: Importar función en TradeStation (3 min)

### 5.1 Abre TradeStation

### 5.2 Abre EasyLanguage Editor
- Menu: **View** → **EasyLanguage**
- O presiona: **Alt+E**

### 5.3 Crea nueva función
1. **File** → **New** → **Function**
2. Nombre: `AInsideLicenseGuard`

### 5.4 Pega el código
1. Abre el archivo: `tradestation\AInsideLicenseGuard.txt`
2. Selecciona TODO (Ctrl+A)
3. Copia (Ctrl+C)
4. Vuelve a TradeStation
5. Pega en la ventana de la función (Ctrl+V)

### 5.5 Verifica
1. Menu: **Analysis** → **Verify EasyLanguage**
2. Debe decir: **"Verified successfully"**

### 5.6 Guarda
- **File** → **Save** (Ctrl+S)

✅ **Marca como completo cuando la función esté verificada y guardada**

---

## ☑️ PASO 6: Proteger tu estrategia (2 min)

### Opción A - Prueba con estrategia de ejemplo

1. **File** → **New** → **Strategy**
2. Abre: `tradestation\ExampleStrategy.txt`
3. Copia TODO el contenido
4. Pega en la nueva estrategia
5. **File** → **Save** → nombre: `AInside_Test`
6. Aplica a un gráfico cualquiera

### Opción B - Protege tu estrategia existente

Abre tu estrategia y agrega este código **AL PRINCIPIO** (después de tus Inputs/Vars existentes):

```easylanguage
{ ========== AINSIDE LICENSE PROTECTION ========== }
Vars:
    LicenseOK(0),
    BarsSinceCheck(0);

{ Check every 10 bars }
BarsSinceCheck = BarsSinceCheck + 1;
if BarsSinceCheck >= 10 then begin
    LicenseOK = AInsideLicenseGuard(1);  // 1 = muestra debug en log
    BarsSinceCheck = 0;
end;

{ Stop trading if license invalid }
if LicenseOK = 0 then begin
    if MarketPosition <> 0 then begin
        if MarketPosition = 1 then
            Sell("Lic_Exit") this bar close
        else
            BuyToCover("Lic_Exit") this bar close;
    end;
    Value1 = 0;
end
else begin
    { ===== TU CÓDIGO ORIGINAL DEBAJO ===== }
```

Luego, al FINAL de tu código (antes del último `end;`), cierra el bloque:

```easylanguage
end;  { Cierra el else de license check }
```

✅ **Marca como completo cuando tu estrategia esté protegida**

---

## ☑️ PASO 7: PROBAR (2 min)

### 7.1 Aplica estrategia a un gráfico
1. Abre cualquier gráfico en TradeStation
2. Arrastra tu estrategia al gráfico
3. Habilita: **Format Strategies** → **Automated Execution** → ✅

### 7.2 Revisa el Strategy Log
1. Menu: **View** → **Strategy Performance** → **Trade Log**
2. Busca mensajes:
   - ✅ `License: Active` → TODO BIEN
   - ❌ `License: BLOCKED` → hay problema (ve Troubleshooting)

### 7.3 Test de bloqueo (opcional)

1. Ve a la ventana donde corre `python scripts\HWID.py --service`
2. Presiona **Ctrl+C** para detenerlo
3. Espera 30 segundos
4. La estrategia debe mostrar: `License: BLOCKED - Strategy will not trade`
5. Reinicia el servicio: `python scripts\HWID.py --service`
6. Debe volver a: `License: Active`

✅ **Marca como completo cuando veas "License: Active" en el log**

---

## 🎉 ¡COMPLETADO!

Si llegaste aquí, tu sistema está 100% funcional:
- ✅ DLL compilada e instalada
- ✅ Licencia activada
- ✅ Servicio local corriendo
- ✅ Estrategia protegida y funcionando

---

## 🔧 TROUBLESHOOTING RÁPIDO

### "Could not load DLL"
```powershell
# Verifica que la DLL esté ahí:
Test-Path "C:\Program Files (x86)\TradeStation 10.0\Program\AInsideLicenseBridgeCpp.dll"
# Si devuelve False, repite PASO 2
```

### "missing_public_key"
```powershell
# Verifica que el PEM esté ahí:
Test-Path "C:\Program Files (x86)\TradeStation 10.0\Program\license-public.pem"
# Si devuelve False, repite PASO 2
```

### "local_service_down"
```powershell
# Verifica que el servicio esté corriendo:
Invoke-RestMethod http://127.0.0.1:8787/health
# Si falla, repite PASO 4
```

### "not_activated"
```powershell
# Repite la activación:
python scripts\HWID.py --activate
# Usa Order ID y email correctos
```

---

## 📞 SOPORTE

Si algún paso falla:
1. Lee el error completo
2. Busca en Troubleshooting arriba
3. Si persiste: https://ainside.me (formulario contacto)
4. Admin puede ayudar en: https://ainside.me/admin

---

## 💡 RECORDATORIOS IMPORTANTES

**Cada vez que vayas a operar:**
1. Inicia el servicio: `python scripts\HWID.py --service`
2. Déjalo corriendo en segundo plano
3. Abre TradeStation y opera normalmente

**Para auto-iniciar el servicio:**
- Crea un `.bat` con: `python C:\ruta\scripts\HWID.py --service`
- Ponlo en: **shell:startup** (Windows+R → escribe "shell:startup" → Enter)

**Seguridad:**
- NO compartas tu archivo `~/.ainside_tool/auth.json`
- Si cambias de PC (nueva mother/CPU): contacta soporte para transferir licencia
