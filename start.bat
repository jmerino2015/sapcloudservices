@echo off
REM ==============================================================================
REM Script de inicio para Servidores Windows / Local
REM SAP Fiori Solution Portal & Clean Core Demo
REM ==============================================================================

echo =================================================================
echo   🚀 Iniciando SAP Fiori Solution Portal (Produccion / Demo)
echo =================================================================

where node >nul 2>nul
if %errorlevel% neq 0 (
    if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" (
        set "PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH%"
    ) else (
        echo [ERROR] Node.js no esta instalado o no se encuentra en el PATH.
        echo Por favor descarga e instala Node.js desde https://nodejs.org
        pause
        exit /b 1
    )
)

set PORT=8080
set HOST=0.0.0.0
set NODE_ENV=production

echo   🌐 Puerto configurado: %PORT%
echo   🌐 Host configurado:   %HOST%
echo   🚀 Abriendo navegador en http://localhost:%PORT% ...
echo -----------------------------------------------------------------

node server.js --open
pause
