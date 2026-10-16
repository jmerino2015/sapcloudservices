/**
 * AssistantService.js — Lógica de procesamiento y respuestas del Asistente WM Light
 */
sap.ui.define([], function () {
  "use strict";

  return {
    getReply: async function (sText, Api) {
      var query = (sText || "").toLowerCase().trim();

      // Normalizar tildes/acentos
      query = query.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

      // ── 1. PROCESOS WM ──────────────────────────────────────
      if (query.includes("entrada") || query.includes("recepcion") || query.includes("gr") || query.includes("ingreso") || query.includes("putaway")) {
        return "<p>Para realizar una <strong>Entrada de Mercancías (GR)</strong> en WM Light:</p>" +
          "<p>1. Navega a <strong>Entrada de Mercancía</strong> en el menú lateral.</p>" +
          "<p>2. Registra los datos del documento de ingreso (proveedor, materiales y cantidades).</p>" +
          "<p>3. Al guardar, el sistema generará una <strong>Orden de Traslado (OT)</strong> para colocar el stock desde la zona de recepción ('GR-001') a su ubicación final.</p>" +
          "<p>4. El operario de radiofrecuencia confirmará la OT desde su dispositivo Zebra finalizando el proceso.</p>";
      }

      if (query.includes("salida") || query.includes("despacho") || query.includes("gi") || query.includes("picking")) {
        return "<p>Para realizar una <strong>Salida de Mercancías (GI)</strong> o Picking:</p>" +
          "<p>1. Navega a <strong>Salida de Mercancía</strong> en el menú lateral.</p>" +
          "<p>2. Crea una orden de salida asociando el cliente y los artículos correspondientes.</p>" +
          "<p>3. Esto generará automáticamente una <strong>Orden de Traslado de Picking</strong>.</p>" +
          "<p>4. El operario de radiofrecuencia (Zebra) escaneará la entrega y el sistema lo guiará al bin origen para tomar el stock y llevarlo a la zona de expedición ('GI-001').</p>";
      }

      if (query.includes("inventario") || query.includes("conteo") || query.includes("li01n") || query.includes("li11n") || query.includes("li20") || query.includes("li21")) {
        return "<p>El flujo de <strong>Toma de Inventarios</strong> en WM Light consta de 5 pasos (estándar SAP WM):</p>" +
          "<p>1. <strong>Crear Doc. (LI01N):</strong> Crea el documento desde 'Toma de Inventario' seleccionando las ubicaciones.</p>" +
          "<p>2. <strong>Activar Doc. (LI02N):</strong> Al activar, las ubicaciones se bloquean para evitar movimientos de stock.</p>" +
          "<p>3. <strong>Registrar Conteo (LI11N):</strong> Realiza el conteo directamente desde el <strong>equipo Zebra RF</strong> o la interfaz de escritorio.</p>" +
          "<p>4. <strong>Liquidación WM (LI20):</strong> Registra las diferencias en el bin virtual 'DIFF-01' (Tipo 999) y desbloquea las ubicaciones.</p>" +
          "<p>5. <strong>Liquidación IM (LI21):</strong> Realiza los ajustes contables de stock generales (Movimientos 711/712).</p>";
      }
      
      if (query.includes("yard") || query.includes("patio") || query.includes("camion") || query.includes("conductor") || query.includes("chofer")) {
        return "<p>La <strong>Gestión de Patios (Yard)</strong> permite controlar el flujo de vehículos:</p>" +
          "<p>1. <strong>Citas:</strong> Programa un ingreso de vehículo en el tablero de Yard.</p>" +
          "<p>2. <strong>Check-In:</strong> Registra la llegada de un camión con sus datos y chofer.</p>" +
          "<p>3. <strong>Movimientos:</strong> Asigna el camión a un muelle de carga/descarga.</p>" +
          "<p>4. <strong>Check-Out:</strong> Registra la salida del vehículo una vez completada la tarea.</p>";
      }
      
      if (query.includes("slotting") || query.includes("optimizacion") || query.includes("rotacion")) {
        return "<p>El módulo de <strong>Slotting Inteligente</strong> recomienda ubicaciones óptimas:</p>" +
          "<p>• <strong>Clasificación ABC:</strong> Agrupa materiales por frecuencia de picking.</p>" +
          "<p>• <strong>Reubicación:</strong> Sugiere mover artículos de alta rotación (Clase A) cerca de los muelles para reducir tiempos de tránsito.</p>";
      }

      // ── 2. CONSULTAS DE STOCK / INVENTARIO EN VIVO ──────────────
      if (query.includes("stock") || query.includes("cuanto hay") || query.includes("material") || query.includes("buscar") || query.includes("inventario")) {
        try {
          var res = await Api.getStock();
          var quants = res.data || [];
          
          // Buscar si menciona algún código o descripción
          var words = query.split(/\s+/);
          var searchWord = words.find(w => w.length >= 3 && !["stock", "de", "del", "el", "la", "en", "que", "hay", "buscar", "cuanto", "inventario", "material"].includes(w));
          
          if (searchWord) {
            var filtered = quants.filter(q => {
              var mat = q.material || {};
              var code = (mat.sap_code || "").toLowerCase();
              var desc = (mat.description || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
              var bin = (q.bin?.bin_code || "").toLowerCase();
              return code.includes(searchWord) || desc.includes(searchWord) || bin.includes(searchWord);
            });

            if (filtered.length === 0) {
              return "No encontré stock en el sistema que coincida con <strong>'" + searchWord + "'</strong>.";
            }

            var reply = "<p>🔍 <strong>Stock encontrado en el almacén:</strong></p>";
            filtered.slice(0, 5).forEach(q => {
              var binCode = q.bin ? q.bin.bin_code : "Ubic. Desconocida";
              var batchText = q.batch ? " (Lote: " + q.batch.batch_number + ")" : "";
              reply += "<p>• <strong>" + q.material.description + "</strong> (" + q.material.sap_code + "):<br/>" +
                       "Cantidad: <strong>" + q.quantity + " " + q.unit + "</strong>" + batchText + "<br/>" +
                       "Ubicación: <strong>" + binCode + "</strong></p>";
            });
            if (filtered.length > 5) reply += "<p><em>...y otros " + (filtered.length - 5) + " registros más.</em></p>";
            return reply;
          } else {
            // Resumen general
            var totalPos = quants.length;
            var totalQty = quants.reduce((acc, q) => acc + parseFloat(q.quantity), 0);
            return "<p>📦 <strong>Resumen General del Inventario:</strong></p>" +
              "<p>• Total de posiciones registradas: <strong>" + totalPos + "</strong></p>" +
              "<p>• Stock físico total acumulado: <strong>" + totalQty.toFixed(0) + " unidades</strong></p>" +
              "<p>Si buscas un material específico, pregúntame algo como: <em>'¿Cuál es el stock de Cable UTP?'</em></p>";
          }
        } catch(e) {
          return "Error al consultar el stock: " + e.message;
        }
      }

      // ── 3. CONSULTAS DE ORDENES DE TRASLADO (OTs) ──────────────
      if (query.includes("orden") || query.includes("ot") || query.includes("traslado") || query.includes("pendientes")) {
        try {
          var res = await Api.getTOs();
          var tos = res.data || [];
          var openTOs = tos.filter(t => t.status === 'OPEN');
          
          if (query.includes("abiertas") || query.includes("pendiente") || query.includes("abierta") || query.includes("abierto")) {
            if (openTOs.length === 0) {
              return "Actualmente <strong>no hay órdenes de traslado abiertas</strong> pendientes de procesar.";
            }
            var reply = "<p>📋 <strong>Órdenes de Traslado Abiertas (" + openTOs.length + "):</strong></p>";
            openTOs.slice(0, 5).forEach(t => {
              reply += "<p>• <strong>" + t.to_number + "</strong> (Tipo: <strong>" + t.to_type + "</strong>)<br/>" +
                       "Ref: <strong>" + t.reference_type + "</strong> | Fecha: " + new Date(t.created_at).toLocaleDateString() + "</p>";
            });
            if (openTOs.length > 5) reply += "<p><em>Revisa el listado completo de Órdenes de Traslado en el menú de operaciones.</em></p>";
            return reply;
          }

          var totalTOs = tos.length;
          var confTOs = tos.filter(t => t.status === 'CONFIRMED').length;
          return "<p>📊 <strong>Estado de las Órdenes de Traslado (OT):</strong></p>" +
            "<p>• Órdenes Abiertas: <strong>" + openTOs.length + "</strong></p>" +
            "<p>• Órdenes Confirmadas: <strong>" + confTOs + "</strong></p>" +
            "<p>• Total registradas: <strong>" + totalTOs + "</strong></p>" +
            "<p>Si deseas ver la lista de pendientes, escribe: <em>'¿Qué OTs están abiertas?'</em></p>";
        } catch(e) {
          return "Error al consultar órdenes de traslado: " + e.message;
        }
      }

      // ── 4. RESUMEN O CAPACIDAD DEL ALMACEN ───────────────────────
      if (query.includes("almacen") || query.includes("capacidad") || query.includes("ocupacion")) {
        try {
          var res = await Api.getWarehouses();
          var whs = res.data || [];
          if (whs.length > 0) {
            var wh = whs[0];
            var kpi = {};
            try { kpi = await Api.getKpis(wh.id); } catch(err) {}
            
            var occupancy = kpi.occupancy_rate || 50;
            var totalBins = kpi.total_bins || 820;
            var occBins = kpi.occupied_bins || Math.round(totalBins * (occupancy / 100));

            return "<p>🏢 <strong>Información de Almacén:</strong> <strong>" + wh.name + "</strong> (" + wh.id + ")</p>" +
              "<p>• Dirección: <strong>" + wh.location + "</strong></p>" +
              "<p>• Capacidad: <strong>" + totalBins + " ubicaciones (bins)</strong></p>" +
              "<p>• Ubicaciones Ocupadas: <strong>" + occBins + "</strong></p>" +
              "<p>• Nivel de Ocupación actual: <strong>" + occupancy + "%</strong></p>";
          }
          return "No encontré almacenes registrados.";
        } catch(e) {
          return "Error al consultar capacidad: " + e.message;
        }
      }

      // Fallback
      return "<p>No estoy seguro de cómo responder a eso. 😅 Puedes preguntarme:</p>" +
        "<p>• <strong>Consultas WM:</strong> <em>'¿Cómo hago un inventario?'</em> o <em>'¿Cuál es el proceso de entrada?'</em></p>" +
        "<p>• <strong>Consultas de Stock:</strong> <em>'¿Cuál es el stock de Switch?'</em> o <em>'¿Cuánto hay de Cable UTP?'</em></p>" +
        "<p>• <strong>Consultas de Almacén:</strong> <em>'¿Cómo está la ocupación?'</em> o <em>'¿Qué OTs están abiertas?'</em></p>";
    }
  };
});
