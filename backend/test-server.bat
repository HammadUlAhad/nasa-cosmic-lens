@echo off
echo Testing NASA Space Explorer Backend...
echo.

echo Testing Health Endpoint...
powershell -Command "(Invoke-WebRequest -Uri 'http://localhost:5000/health').Content" 2>nul
if %errorlevel% neq 0 (
    echo ❌ Health endpoint failed
    goto end
) else (
    echo ✓ Health endpoint working
)

echo.
echo Testing APOD Endpoint...
powershell -Command "(Invoke-WebRequest -Uri 'http://localhost:5000/api/nasa/apod').Content" 2>nul
if %errorlevel% neq 0 (
    echo ❌ APOD endpoint failed
) else (
    echo ✓ APOD endpoint working
)

echo.
echo Testing Mars Rover Endpoint...
powershell -Command "(Invoke-WebRequest -Uri 'http://localhost:5000/api/nasa/mars-photos/curiosity?sol=1000').Content" 2>nul
if %errorlevel% neq 0 (
    echo ❌ Mars Rover endpoint failed
) else (
    echo ✓ Mars Rover endpoint working
)

:end
echo.
echo Testing complete.
