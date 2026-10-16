@echo off
title Subir Proyecto a GitHub
cd /d "%~dp0"
echo =================================================================
echo   🚀 Subiendo Portal SAP Fiori a GitHub: sapcloudservices
echo =================================================================
git push -u origin main
echo =================================================================
echo   ✅ Proceso finalizado.
echo =================================================================
pause
