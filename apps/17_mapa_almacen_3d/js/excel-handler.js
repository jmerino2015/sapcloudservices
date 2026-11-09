/**
 * SAP WMS 3D Digital Twin - Excel Import & Export Manager (SheetJS integration)
 */

(function (window) {
  'use strict';

  class ExcelWarehouseHandler {
    constructor(dataManager, onDataLoadedCallback) {
      this.dataManager = dataManager;
      this.onDataLoaded = onDataLoadedCallback;
    }

    /**
     * Procesa un archivo Excel o CSV subido por el usuario
     */
    handleFileUpload(file) {
      return new Promise((resolve, reject) => {
        if (!window.XLSX) {
          reject(new Error('La librería SheetJS (XLSX) no está cargada.'));
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target.result);
            const workbook = window.XLSX.read(data, { type: 'array', cellDates: true });
            
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = window.XLSX.utils.sheet_to_json(worksheet, { defval: '' });

            if (!jsonData || jsonData.length === 0) {
              throw new Error('El archivo Excel está vacío o no contiene filas de datos.');
            }

            this.processParsedRows(jsonData);
            resolve({
              totalRows: jsonData.length,
              summary: this.dataManager.getWarehouseSummary()
            });

            if (this.onDataLoaded) {
              this.onDataLoaded(this.dataManager.getWarehouseSummary());
            }
          } catch (err) {
            reject(err);
          }
        };

        reader.onerror = (err) => reject(err);
        reader.readAsArrayBuffer(file);
      });
    }

    /**
     * Mapea las filas de Excel al mapa de nichos del almacén
     */
    processParsedRows(rows) {
      this.dataManager.niches.clear();

      // Primero, crear estructura base vacía de nichos (10 pasillos x 30 cols x 4 niveles)
      const aisles = this.dataManager.aisles;
      const cols = 30;
      const levels = 4;

      for (const a of aisles) {
        for (let c = 1; c <= cols; c++) {
          const colStr = String(c).padStart(2, '0');
          for (let l = 1; l <= levels; l++) {
            const id = `${a}-${colStr}-${l}`;
            this.dataManager.niches.set(id, {
              id: id,
              pasillo: a,
              columna: c,
              columnaStr: colStr,
              nivel: l,
              capacidadPaletas: 2,
              items: []
            });
          }
        }
      }

      // Procesar filas del archivo
      for (const row of rows) {
        // Soporte para variaciones de nombres de columnas en español e inglés
        const ubicacionRaw = (row['Ubicacion'] || row['Ubicación'] || row['Location'] || row['Nicho'] || '').toString().trim().toUpperCase();
        let pasillo = (row['Pasillo'] || row['Aisle'] || '').toString().trim().toUpperCase();
        let columna = parseInt(row['Columna'] || row['Column'] || 0, 10);
        let nivel = parseInt(row['Nivel'] || row['Level'] || row['Piso'] || 0, 10);

        let nicheId = '';
        if (ubicacionRaw && ubicacionRaw.includes('-')) {
          const parts = ubicacionRaw.split('-');
          pasillo = parts[0];
          columna = parseInt(parts[1], 10);
          nivel = parseInt(parts[2], 10);
          nicheId = `${pasillo}-${String(columna).padStart(2, '0')}-${nivel}`;
        } else if (pasillo && columna && nivel) {
          nicheId = `${pasillo}-${String(columna).padStart(2, '0')}-${nivel}`;
        }

        if (!nicheId) continue;

        let niche = this.dataManager.niches.get(nicheId);
        if (!niche) {
          niche = {
            id: nicheId,
            pasillo: pasillo,
            columna: columna,
            columnaStr: String(columna).padStart(2, '0'),
            nivel: nivel,
            capacidadPaletas: 2,
            items: []
          };
          this.dataManager.niches.set(nicheId, niche);
        }

        const sku = (row['SKU'] || row['Material'] || row['Codigo'] || '').toString().trim();
        const descripcion = (row['Descripcion'] || row['Descripción'] || row['Nombre'] || row['Product'] || '').toString().trim();
        
        if (sku || descripcion) {
          let fechaVenc = row['FechaVencimiento'] || row['Fecha_Vencimiento'] || row['Vencimiento'] || row['ExpiryDate'] || null;
          let fechaStr = null;

          if (fechaVenc instanceof Date) {
            fechaStr = fechaVenc.toISOString().split('T')[0];
          } else if (typeof fechaVenc === 'string' && fechaVenc.trim()) {
            fechaStr = fechaVenc.trim();
          }

          niche.items.push({
            sku: sku || 'SKU-GEN',
            nombre: descripcion || 'Material sin descripción',
            categoria: (row['Categoria'] || row['Categoría'] || 'General').toString().trim(),
            unidad: (row['Unidad'] || row['UM'] || 'UN').toString().trim(),
            stock: parseFloat(row['Stock'] || row['Cantidad'] || 1),
            lote: (row['Lote'] || row['Batch'] || 'L0001').toString().trim(),
            fechaVencimiento: fechaStr
          });
        }
      }

      // Evaluar estados de todos los nichos
      for (const niche of this.dataManager.niches.values()) {
        niche.eval = this.dataManager.evaluateNicheStatus(niche);
      }
    }

    /**
     * Descarga una plantilla de Excel estándar con datos de demostración
     */
    downloadExcelTemplate() {
      if (!window.XLSX) {
        alert('Cargando motor de Excel...');
        return;
      }

      const rows = [];
      // Agregar encabezados y 25 filas de ejemplo
      const sampleItems = [
        { u: 'A-01-1', p: 'A', c: 1, n: 1, sku: 'SKU-1001', desc: 'Leche evaporada 400 g', cat: 'Lácteos', stock: 120, um: 'CJ', lote: 'L9012', venc: '2026-11-15' },
        { u: 'A-01-2', p: 'A', c: 1, n: 2, sku: 'SKU-1002', desc: 'Harina preparada 25 kg', cat: 'Abarrotes', stock: 50, um: 'SACO', lote: 'L8810', venc: '2027-02-20' },
        { u: 'A-02-1', p: 'A', c: 2, n: 1, sku: 'SKU-1004', desc: 'Aceite vegetal 1 L', cat: 'Abarrotes', stock: 240, um: 'CJ', lote: 'L7741', venc: '2026-10-10' }, // Vencido
        { u: 'B-04-3', p: 'B', c: 4, n: 3, sku: 'SKU-1007', desc: 'Yogurt natural 1 L', cat: 'Lácteos', stock: 80, um: 'CJ', lote: 'L6540', venc: '2026-11-05' }, // Crítico
        { u: 'C-08-2', p: 'C', c: 8, n: 2, sku: 'SKU-1005', desc: 'Jabón líquido 500 ml', cat: 'Limpieza', stock: 150, um: 'CJ', lote: 'L4320', venc: '2026-12-28' }, // Por vencer
        { u: 'D-12-4', p: 'D', c: 12, n: 4, sku: 'SKU-2001', desc: 'Cable UTP Cat6A (305m)', cat: 'Tecnología', stock: 15, um: 'RL', lote: 'L1002', venc: '' }, // Sin fecha
        { u: 'E-03-1', p: 'E', c: 3, n: 1, sku: 'SKU-1003', desc: 'Arroz extra 50 kg', cat: 'Granos', stock: 45, um: 'SACO', lote: 'L5590', venc: '2027-08-30' },
        { u: 'F-15-2', p: 'F', c: 15, n: 2, sku: 'SKU-1006', desc: 'Atún en lata 170 g', cat: 'Conservas', stock: 320, um: 'CJ', lote: 'L2201', venc: '2027-12-31' },
        { u: 'H-01-3', p: 'H', c: 1, n: 3, sku: 'SKU-1005', desc: 'Jabón líquido 500 ml', cat: 'Limpieza', stock: 400, um: 'CJ', lote: 'L3312', venc: '2026-11-20' },
        { u: 'J-08-5', p: 'J', c: 8, n: 4, sku: 'SKU-1002', desc: 'Harina preparada 25 kg', cat: 'Abarrotes', stock: 216, um: 'SACO', lote: 'L2524', venc: '2027-09-29' }
      ];

      for (const item of sampleItems) {
        rows.push({
          'Ubicacion': item.u,
          'Pasillo': item.p,
          'Columna': item.c,
          'Nivel': item.n,
          'SKU': item.sku,
          'Descripcion': item.desc,
          'Categoria': item.cat,
          'Stock': item.stock,
          'Unidad': item.um,
          'Lote': item.lote,
          'FechaVencimiento': item.venc
        });
      }

      const worksheet = window.XLSX.utils.json_to_sheet(rows);
      
      // Ancho automático de columnas
      worksheet['!cols'] = [
        { wch: 12 }, // Ubicacion
        { wch: 8 },  // Pasillo
        { wch: 9 },  // Columna
        { wch: 8 },  // Nivel
        { wch: 14 }, // SKU
        { wch: 30 }, // Descripcion
        { wch: 15 }, // Categoria
        { wch: 10 }, // Stock
        { wch: 8 },  // Unidad
        { wch: 12 }, // Lote
        { wch: 16 }  // FechaVencimiento
      ];

      const workbook = window.XLSX.utils.book_new();
      window.XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventario_Almacen');
      window.XLSX.writeFile(workbook, 'Plantilla_Inventario_Almacen_3D.xlsx');
    }
  }

  window.ExcelWarehouseHandler = ExcelWarehouseHandler;
})(window);
