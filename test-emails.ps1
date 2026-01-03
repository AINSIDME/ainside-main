# Script para enviar emails de prueba de todos los planes

$apiKey = "re_RRiMHuQ7_PjSkVUcWHJTF2wGfrQwKu3X1"
$url = "https://api.resend.com/emails"

# Array de planes para probar
$plans = @(
    @{
        name = "Contrato Micro - S&P 500 (MES) - Suscripción Mensual"
        amount = "99.00"
        subject = "Test: Micro S&P 500 Mensual"
    },
    @{
        name = "Contrato Micro - S&P 500 (MES) - Suscripción Anual"
        amount = "831.60"
        subject = "Test: Micro S&P 500 Anual"
    },
    @{
        name = "Contrato Micro - Oro (MGC) - Suscripción Mensual"
        amount = "99.00"
        subject = "Test: Micro Oro Mensual"
    },
    @{
        name = "Contrato Micro - Oro (MGC) - Suscripción Anual"
        amount = "831.60"
        subject = "Test: Micro Oro Anual"
    },
    @{
        name = "Contrato Mini - S&P 500 (ES) - Suscripción Mensual"
        amount = "999.00"
        subject = "Test: Mini S&P 500 Mensual"
    },
    @{
        name = "Contrato Mini - S&P 500 (ES) - Suscripción Anual"
        amount = "8391.60"
        subject = "Test: Mini S&P 500 Anual"
    },
    @{
        name = "Contrato Mini - Oro (GC) - Suscripción Mensual"
        amount = "999.00"
        subject = "Test: Mini Oro Mensual"
    },
    @{
        name = "Contrato Mini - Oro (GC) - Suscripción Anual"
        amount = "8391.60"
        subject = "Test: Mini Oro Anual"
    }
)

Write-Host "Enviando $($plans.Count) emails de prueba a jonathangolubok@gmail.com..." -ForegroundColor Cyan
Write-Host ""

# Llamar a la función de Supabase para cada plan
foreach ($plan in $plans) {
    Write-Host "Enviando: $($plan.subject)..." -ForegroundColor Yellow
    
    $body = @{
        email = "jonathangolubok@gmail.com"
        name = "Jonathan Golubok"
        planName = $plan.name
        amount = $plan.amount
        currency = "USD"
        orderId = "TEST-$(Get-Random -Minimum 100000 -Maximum 999999)"
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "https://odlxhgatqyodxdessxts.supabase.co/functions/v1/test-product-email" `
            -Method POST `
            -Headers @{
                "Content-Type" = "application/json"
                "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kbHhoZ2F0cXlvZHhkZXNzeHRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUwNDI0NTcsImV4cCI6MjA1MDYxODQ1N30.jFUOrzl6L5gk0B2LcYH17l5GvzZeBwCz8rV1kDo8zsc"
            } `
            -Body $body
        
        Write-Host "   Enviado exitosamente" -ForegroundColor Green
        Start-Sleep -Seconds 2
    }
    catch {
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Proceso completado. Revisa tu bandeja de entrada en jonathangolubok@gmail.com" -ForegroundColor Green
