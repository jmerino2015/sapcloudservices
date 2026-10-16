#!/usr/bin/env bash
# ==============================================================================
# Script de inicio para Servidores Linux / macOS / Cloud VM
# SAP Fiori Solution Portal & Clean Core Demo
# ==============================================================================

echo "================================================================="
echo "  🚀 Iniciando SAP Fiori Solution Portal (Producción / Demo)"
echo "================================================================="

# Verificar existencia de Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js no está instalado."
    echo "   Por favor instala Node.js (v18+) para continuar:"
    echo "   Ubuntu/Debian: sudo apt update && sudo apt install -y nodejs"
    exit 1
fi

export PORT="${PORT:-8080}"
export HOST="${HOST:-0.0.0.0}"
export NODE_ENV="production"

echo "  🌐 Puerto configurado: $PORT"
echo "  🌐 Host configurado:   $HOST"
echo "-----------------------------------------------------------------"

# Iniciar servidor
node server.js --open
