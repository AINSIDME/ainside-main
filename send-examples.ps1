# Script simple para enviar emails de prueba
$apiKey = "re_RRiMHuQ7_PjSkVUcWHJTF2wGfrQwKu3X1"

$plans = @(
    @{name="Contrato Micro - SP 500 (MES) - Suscripcion Mensual"; amount="99.00"; id="001"; type="micro-sp500"; color="#3b82f6"; title="Contrato Micro - SP 500"; instrument="SP 500 (MES)"},
    @{name="Contrato Micro - SP 500 (MES) - Suscripcion Anual"; amount="831.60"; id="002"; type="micro-sp500"; color="#3b82f6"; title="Contrato Micro - SP 500"; instrument="SP 500 (MES)"},
    @{name="Contrato Micro - Oro (MGC) - Suscripcion Mensual"; amount="99.00"; id="003"; type="micro-gold"; color="#f59e0b"; title="Contrato Micro - Oro"; instrument="Oro (MGC)"},
    @{name="Contrato Micro - Oro (MGC) - Suscripcion Anual"; amount="831.60"; id="004"; type="micro-gold"; color="#f59e0b"; title="Contrato Micro - Oro"; instrument="Oro (MGC)"},
    @{name="Contrato Mini - SP 500 (ES) - Suscripcion Mensual"; amount="999.00"; id="005"; type="mini-sp500"; color="#8b5cf6"; title="Contrato Mini - SP 500"; instrument="SP 500 (ES)"},
    @{name="Contrato Mini - SP 500 (ES) - Suscripcion Anual"; amount="8391.60"; id="006"; type="mini-sp500"; color="#8b5cf6"; title="Contrato Mini - SP 500"; instrument="SP 500 (ES)"},
    @{name="Contrato Mini - Oro (GC) - Suscripcion Mensual"; amount="999.00"; id="007"; type="mini-gold"; color="#d97706"; title="Contrato Mini - Oro"; instrument="Oro (GC)"},
    @{name="Contrato Mini - Oro (GC) - Suscripcion Anual"; amount="8391.60"; id="008"; type="mini-gold"; color="#d97706"; title="Contrato Mini - Oro"; instrument="Oro (GC)"}
)

Write-Host "Enviando emails de prueba..." -ForegroundColor Cyan

foreach ($plan in $plans) {
    Write-Host "Enviando: $($plan.name)..." -ForegroundColor Yellow
    
    $isAnnual = $plan.name -match "Anual"
    $renewalDays = if ($isAnnual) { 365 } else { 30 }
    $renewalDate = (Get-Date).AddDays($renewalDays).ToString("dd 'de' MMMM 'de' yyyy", [System.Globalization.CultureInfo]::CreateSpecificCulture("es-ES"))
    
    $cycle = if ($isAnnual) { "Anual" } else { "Mensual" }
    $benefit = if ($isAnnual) { "Ahorras 30% con el plan anual" } else { "Renovacion mensual automatica" }
    $bgColor = if ($isAnnual) { "#ecfdf5" } else { "#fef3c7" }
    $borderColor = if ($isAnnual) { "#10b981" } else { "#f59e0b" }
    $textColor = if ($isAnnual) { "#047857" } else { "#92400e" }
    
    $emailHTML = @"
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Confirmacion de Compra - AInside</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8fafc;">
  <table role="presentation" width="100%" style="background-color: #f8fafc;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" width="600" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px;">
          
          <tr>
            <td style="background: #f8fafc; padding: 40px; text-align: center; border-bottom: 2px solid #e2e8f0;">
              <img src="https://ainside.me/brand/logo-master.png" alt="AInside Logo" style="width: 220px; margin-bottom: 20px;" />
              <h1 style="margin: 0; color: #059669; font-size: 24px;">Pago Exitoso</h1>
              <p style="margin: 10px 0 0; color: $($plan.color); font-size: 18px; font-weight: 600;">$($plan.title)</p>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #475569; font-size: 16px;">
                Estimado Jonathan Golubok,
              </p>

              <p style="margin: 0 0 20px; color: #475569; font-size: 16px;">
                Gracias por adquirir el plan <strong style="color: $($plan.color);">$($plan.title)</strong>! Tu pago ha sido procesado exitosamente.
              </p>

              <div style="background-color: $bgColor; border-left: 4px solid $borderColor; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; color: $textColor; font-size: 14px;">
                  <strong>$benefit</strong><br/>
                  Proxima renovacion: $renewalDate
                </p>
              </div>

              <div style="background-color: #f1f5f9; border-left: 4px solid #3b82f6; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <h3 style="margin: 0 0 15px; color: #1e293b; font-size: 16px;">Detalles del Pedido</h3>
                <p style="margin: 0 0 8px; color: #475569; font-size: 14px;"><strong>Plan:</strong> $($plan.name)</p>
                <p style="margin: 0 0 8px; color: #475569; font-size: 14px;"><strong>Instrumento:</strong> $($plan.instrument)</p>
                <p style="margin: 0 0 8px; color: #475569; font-size: 14px;"><strong>Monto:</strong> `$$($plan.amount) USD</p>
                <p style="margin: 0 0 8px; color: #475569; font-size: 14px;"><strong>Ciclo:</strong> $cycle</p>
                <p style="margin: 0; color: #475569; font-size: 14px;"><strong>Order ID:</strong> TEST-$($plan.id)</p>
              </div>

              <div style="background-color: #ecfdf5; border: 2px solid #10b981; padding: 25px; margin: 30px 0; border-radius: 8px; text-align: center;">
                <h3 style="margin: 0 0 15px; color: #065f46; font-size: 18px;">Descarga tus Archivos</h3>
                <p style="margin: 0 0 20px; color: #047857; font-size: 14px;">Accede a tus materiales del $($plan.title):</p>
                
                <a href="https://ainside.me/downloads/$($plan.type)/$($plan.type)-plan.pdf" 
                   style="display: inline-block; margin: 10px; padding: 14px 30px; background: $($plan.color); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 600;">
                  Descargar Guia PDF
                </a>
                
                <a href="https://ainside.me/downloads/$($plan.type)/$($plan.type)-files.zip" 
                   style="display: inline-block; margin: 10px; padding: 14px 30px; background: #10b981; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 600;">
                  Descargar Archivos (ZIP)
                </a>
              </div>

              <p style="margin: 20px 0 0; color: #475569; font-size: 16px;">
                Saludos cordiales,<br/>
                <strong style="color: #1e293b;">El Equipo de AInside</strong>
              </p>
            </td>
          </tr>

          <tr>
            <td style="background-color: #f8fafc; padding: 30px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 10px; color: #64748b; font-size: 14px;">
                <strong>AInside.me</strong> - Herramientas Profesionales de Trading Algoritmico
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 11px;">
                2026 AInside. Todos los derechos reservados.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"@

    $body = @{
        from = "AInside <onboarding@resend.dev>"
        to = @("jonathangolubok@gmail.com")
        subject = "EJEMPLO - $($plan.name) - AInside"
        html = $emailHTML
    } | ConvertTo-Json -Depth 10

    try {
        $response = Invoke-RestMethod -Uri "https://api.resend.com/emails" -Method POST -Headers @{
            "Authorization" = "Bearer $apiKey"
            "Content-Type" = "application/json"
        } -Body $body
        
        Write-Host "   OK - Email enviado (ID: $($response.id))" -ForegroundColor Green
        Start-Sleep -Seconds 2
    }
    catch {
        Write-Host "   ERROR: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Completado! Revisa tu email en jonathangolubok@gmail.com" -ForegroundColor Green
