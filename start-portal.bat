@echo off
title SAP Fiori Solution Portal Server
cd /d "%~dp0"
set "PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH%"
echo Starting SAP Fiori Solution Portal Server...
node server.js --open
pause
