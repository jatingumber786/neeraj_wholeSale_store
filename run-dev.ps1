# Script to run both backend and frontend concurrently
$env:PATH = "C:\Users\gumbe\scoop\apps\nodejs-lts\current;" + $env:PATH

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Starting Wholesale E-Commerce System (MERN + Sheets)" -ForegroundColor Green
Write-Host " Prepared for: Jatin Gumber" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# Start Backend in new PowerShell window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:PATH = 'C:\Users\gumbe\scoop\apps\nodejs-lts\current;' + `$env:PATH; cd '$PSScriptRoot\backend'; npm run dev"

# Wait 2 seconds
Start-Sleep -Seconds 2

# Start Frontend in new PowerShell window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:PATH = 'C:\Users\gumbe\scoop\apps\nodejs-lts\current;' + `$env:PATH; cd '$PSScriptRoot\frontend'; npm run dev"

Write-Host "✓ Backend server launching at: http://localhost:5000" -ForegroundColor Green
Write-Host "✓ Frontend UI launching at:     http://localhost:5173" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
