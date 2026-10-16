@echo off
title SAP Fiori Launchpad - Publicador Web (Google / Internet)
cd /d "%~dp0"
set "PATH=%LOCALAPPDATA%\Programs\nodejs;%ProgramFiles%\nodejs;%PATH%"

echo =================================================================
echo   🚀 SAP Fiori Solution Portal - Publicador Web Publico
echo =================================================================
echo   Iniciando servidor local en puerto 8080...
start /b cmd /c "node server.js"

echo   Esperando inicializacion del servidor...
timeout /t 3 /nobreak >nul

echo   Generando enlace HTTPS publico seguro con Cloudflare...
echo   (Puedes compartir este enlace o abrirlo en Google Chrome desde cualquier dispositivo)
echo =================================================================

npx -y cloudflared tunnel --url http://127.0.0.1:8080
pause
