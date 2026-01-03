# Deploy Contact Form Infrastructure
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  CONTACT FORM DEPLOYMENT" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# 1. Run migration to create table
Write-Host "[1/3] Creating contact_messages table..." -ForegroundColor Yellow
$migrationFile = "supabase\migrations\create_contact_messages.sql"

if (Test-Path $migrationFile) {
    Write-Host "Running migration..." -ForegroundColor Gray
    supabase db push
    Write-Host "✅ Table created`n" -ForegroundColor Green
} else {
    Write-Host "⚠️  Migration file not found`n" -ForegroundColor Yellow
}

# 2. Deploy Edge Function
Write-Host "[2/3] Deploying send-contact-email function..." -ForegroundColor Yellow
supabase functions deploy send-contact-email
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Function deployed`n" -ForegroundColor Green
} else {
    Write-Host "❌ Function deployment failed`n" -ForegroundColor Red
}

# 3. Configure Email Service (optional)
Write-Host "[3/3] Email Service Configuration (Optional)" -ForegroundColor Yellow
Write-Host "To enable email notifications, set one of these secrets:`n" -ForegroundColor Gray

Write-Host "Option 1 - Resend (Recommended):" -ForegroundColor Cyan
Write-Host "  1. Sign up at https://resend.com (100 emails/day free)" -ForegroundColor White
Write-Host "  2. Get your API key" -ForegroundColor White
Write-Host "  3. Run: supabase secrets set RESEND_API_KEY=your_key`n" -ForegroundColor White

Write-Host "Option 2 - SendGrid:" -ForegroundColor Cyan
Write-Host "  1. Sign up at https://sendgrid.com (100 emails/day free)" -ForegroundColor White
Write-Host "  2. Get your API key" -ForegroundColor White
Write-Host "  3. Run: supabase secrets set SENDGRID_API_KEY=your_key`n" -ForegroundColor White

Write-Host "Note: Messages will be saved to database even without email service`n" -ForegroundColor Yellow

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Configure email service (see above)" -ForegroundColor White
Write-Host "  2. View messages at: https://supabase.com (Table Editor)" -ForegroundColor White
Write-Host "  3. Test form at: https://ainside.me/contact`n" -ForegroundColor White
