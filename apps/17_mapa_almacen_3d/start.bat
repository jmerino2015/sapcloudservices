@echo off
title SAP WMS - Mapa 3D de Almacen (Fiori Horizon)
echo ============================================================
echo   Iniciando SAP WMS - Mapa 3D de Almacen (Gemelo Digital)
echo   Estilo SAP Fiori Horizon con Asistente Joule AI
echo ============================================================
echo.

:: Verificar si node_modules existe
if not exist "node_modules" (
    echo Instalando dependencias necesarias...
    call npm install
)

:: Iniciar servidor y abrir navegador en localhost:3000
echo Abriendo aplicacion en tu navegador...
start http://localhost:3000
node server.js

pause
