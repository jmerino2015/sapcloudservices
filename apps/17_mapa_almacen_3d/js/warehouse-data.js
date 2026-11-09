/**
 * SAP WMS 3D Digital Twin - Warehouse Data Management Engine
 * Genera y administra los 1.200 nichos, 2.400 paletas, inventarios y semáforo de vencimiento.
 */

(function (window) {
  'use strict';

  // Catálogo maestro de productos SAP S/4HANA / WMS
  const PRODUCT_CATALOG = [
    { sku: 'SKU-1001', name: 'Leche evaporada 400 g', category: 'Lácteos', unit: 'CJ', defaultTtlDays: 180 },
    { sku: 'SKU-1002', name: 'Harina preparada 25 kg', category: 'Abarrotes', unit: 'SACO', defaultTtlDays: 360 },
    { sku: 'SKU-1003', name: 'Arroz extra 50 kg', category: 'Granos', unit: 'SACO', defaultTtlDays: 540 },
    { sku: 'SKU-1004', name: 'Aceite vegetal 1 L', category: 'Abarrotes', unit: 'CJ', defaultTtlDays: 365 },
    { sku: 'SKU-1005', name: 'Jabón líquido 500 ml', category: 'Limpieza', unit: 'CJ', defaultTtlDays: 720 },
    { sku: 'SKU-1006', name: 'Atún en lata 170 g', category: 'Conservas', unit: 'CJ', defaultTtlDays: 900 },
    { sku: 'SKU-1007', name: 'Yogurt natural 1 L', category: 'Lácteos', unit: 'CJ', defaultTtlDays: 45 },
    { sku: 'SKU-1008', name: 'Detergente en polvo 4 kg', category: 'Limpieza', unit: 'CJ', defaultTtlDays: 730 },
    { sku: 'SKU-1009', name: 'Fideos spaghetti 500 g', category: 'Abarrotes', unit: 'CJ', defaultTtlDays: 360 },
    { sku: 'SKU-1010', name: 'Papel higiénico x24', category: 'Hogar', unit: 'PQ', defaultTtlDays: null },
    { sku: 'SKU-1011', name: 'Mayonesa doy pack 1 kg', category: 'Salsas', unit: 'CJ', defaultTtlDays: 120 },
    { sku: 'SKU-1012', name: 'Salsa de tomate 200 g', category: 'Conservas', unit: 'CJ', defaultTtlDays: 240 },
    { sku: 'SKU-1013', name: 'Café instantáneo 200 g', category: 'Abarrotes', unit: 'CJ', defaultTtlDays: 500 },
    { sku: 'SKU-1014', name: 'Galletas surtidas 300 g', category: 'Snacks', unit: 'CJ', defaultTtlDays: 150 },
    { sku: 'SKU-1015', name: 'Bebida rehidratante 500 ml', category: 'Bebidas', unit: 'CJ', defaultTtlDays: 200 },
    { sku: 'SKU-2001', name: 'Cable UTP Cat6A LSZH (305m)', category: 'Tecnología', unit: 'RL', defaultTtlDays: null },
    { sku: 'SKU-2002', name: 'Switch Industrial Cisco 24p', category: 'Tecnología', unit: 'UN', defaultTtlDays: null },
    { sku: 'SKU-2003', name: 'Terminal Zebra TC57 Android', category: 'Tecnología', unit: 'UN', defaultTtlDays: null }
  ];

  // Configuración de pasillos y geometría estándar
  const AISLE_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const DEFAULT_COLUMNS = 26; // 26 columnas por pasillo
  const DEFAULT_LEVELS = 4;   // 4 niveles de altura
  const TOTAL_NICHES = 1200;

  class WarehouseDataManager {
    constructor() {
      this.aisles = AISLE_LETTERS;
      this.columns = DEFAULT_COLUMNS;
      this.levels = DEFAULT_LEVELS;
      this.today = new Date();
      this.criticoDays = 30;
      this.porVencerDays = 90;
      this.niches = new Map(); // key: 'A-01-1', value: nicheData
      this.occupancyTarget = 0.72; // ~72% ocupación para coincidir exactamente con el video
    }

    /**
     * Calcula el estado de caducidad de un producto
     */
    evaluateItemStatus(item, refDate = this.today) {
      if (!item || !item.fechaVencimiento) {
        return {
          status: 'sin_fecha',
          daysDiff: null,
          statusLabel: 'Sin fecha',
          color: '#03a9f4',
          badgeClass: 'badge-sin-fecha'
        };
      }

      const expDate = new Date(item.fechaVencimiento);
      const diffTime = expDate.getTime() - refDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        return {
          status: 'vencido',
          daysDiff: diffDays,
          statusLabel: `Vencido hace ${Math.abs(diffDays)} días`,
          color: '#e53935',
          badgeClass: 'badge-vencido'
        };
      } else if (diffDays <= this.criticoDays) {
        return {
          status: 'critico',
          daysDiff: diffDays,
          statusLabel: `Crítico (${diffDays} días)`,
          color: '#ff5722',
          badgeClass: 'badge-critico'
        };
      } else if (diffDays <= this.porVencerDays) {
        return {
          status: 'por_vencer',
          daysDiff: diffDays,
          statusLabel: `Por vencer (${diffDays} días)`,
          color: '#ffc107',
          badgeClass: 'badge-por-vencer'
        };
      } else {
        return {
          status: 'vigente',
          daysDiff: diffDays,
          statusLabel: `Vigente (en ${diffDays} días)`,
          color: '#4caf50',
          badgeClass: 'badge-vigente'
        };
      }
    }

    /**
     * Determina el color consolidado del nicho para Three.js
     */
    evaluateNicheStatus(niche) {
      if (!niche.items || niche.items.length === 0) {
        return {
          status: 'vacio',
          statusLabel: 'Vacío',
          color: '#90a4ae',
          colorHex: 0x90a4ae,
          badgeClass: 'badge-vacio',
          opacity: 0.25
        };
      }

      // Prioridad semafórica: Vencido > Crítico > Por Vencer > Sin Fecha > Vigente
      let hasVencido = false;
      let hasCritico = false;
      let hasPorVencer = false;
      let hasSinFecha = false;
      let allVigente = true;

      for (const item of niche.items) {
        const evalRes = this.evaluateItemStatus(item);
        item._eval = evalRes;
        if (evalRes.status === 'vencido') hasVencido = true;
        else if (evalRes.status === 'critico') hasCritico = true;
        else if (evalRes.status === 'por_vencer') hasPorVencer = true;
        else if (evalRes.status === 'sin_fecha') hasSinFecha = true;
        if (evalRes.status !== 'vigente') allVigente = false;
      }

      if (hasVencido) {
        return { status: 'vencido', statusLabel: 'Vencido', color: '#e53935', colorHex: 0xe53935, badgeClass: 'badge-vencido', opacity: 1.0 };
      }
      if (hasCritico) {
        return { status: 'critico', statusLabel: 'Crítico', color: '#ff5722', colorHex: 0xff5722, badgeClass: 'badge-critico', opacity: 1.0 };
      }
      if (hasPorVencer) {
        return { status: 'por_vencer', statusLabel: 'Por vencer', color: '#ffc107', colorHex: 0xffc107, badgeClass: 'badge-por-vencer', opacity: 1.0 };
      }
      if (hasSinFecha) {
        return { status: 'sin_fecha', statusLabel: 'Sin fecha', color: '#03a9f4', colorHex: 0x03a9f4, badgeClass: 'badge-sin-fecha', opacity: 1.0 };
      }
      if (allVigente) {
        return { status: 'vigente', statusLabel: 'Vigente', color: '#4caf50', colorHex: 0x4caf50, badgeClass: 'badge-vigente', opacity: 1.0 };
      }

      return { status: 'vigente', statusLabel: 'Vigente', color: '#4caf50', colorHex: 0x4caf50, badgeClass: 'badge-vigente', opacity: 1.0 };
    }

    /**
     * Genera datos de ejemplo de almacén idénticos a los del video
     */
    generateSampleWarehouse() {
      this.niches.clear();

      // Conteos objetivo del video:
      // Vencido: 58, Crítico: 61, Por vencer: 117, Vigente: 513, Sin fecha: 126 -> Total ocupados: 875 (~72% de 1200)
      // Vacíos: 325 (~28%)
      const targetCounts = {
        vencido: 58,
        critico: 61,
        por_vencer: 117,
        vigente: 513,
        sin_fecha: 126,
        vacio: 325
      };

      const statusPool = [];
      for (const [status, count] of Object.entries(targetCounts)) {
        for (let i = 0; i < count; i++) {
          statusPool.push(status);
        }
      }

      // Barajar aleatoriamente el pool de estados para una distribución realista en el rack
      for (let i = statusPool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [statusPool[i], statusPool[j]] = [statusPool[j], statusPool[i]];
      }

      // Distribución por pasillos (10 pasillos: A hasta J, 30 columnas, 4 niveles = 1200 nichos)
      // En el video se distribuye con columnas 1 a 30 por pasillo o 2 caras
      let poolIdx = 0;
      const aisles = this.aisles;
      const colsPerAisle = 30; // 10 pasillos * 30 columnas * 4 niveles = 1200 nichos
      const levels = 4;

      for (let a = 0; a < aisles.length; a++) {
        const aisle = aisles[a];
        for (let c = 1; c <= colsPerAisle; c++) {
          const colStr = String(c).padStart(2, '0');
          for (let l = 1; l <= levels; l++) {
            const nicheId = `${aisle}-${colStr}-${l}`;
            const targetStatus = poolIdx < statusPool.length ? statusPool[poolIdx++] : 'vacio';

            const niche = {
              id: nicheId,
              pasillo: aisle,
              columna: c,
              columnaStr: colStr,
              nivel: l,
              capacidadPaletas: 2,
              items: []
            };

            if (targetStatus !== 'vacio') {
              // Asignar entre 1 y 2 productos por nicho
              const numItems = Math.random() > 0.75 ? 2 : 1;
              for (let k = 0; k < numItems; k++) {
                const prod = this.getRandomProduct(targetStatus);
                const stock = Math.floor(Math.random() * 400) + 40;
                const lote = 'L' + (Math.floor(Math.random() * 8999) + 1000);
                const expDate = this.generateDateForStatus(targetStatus);

                niche.items.push({
                  sku: prod.sku,
                  nombre: prod.name,
                  categoria: prod.category,
                  unidad: prod.unit,
                  stock: stock,
                  lote: lote,
                  fechaVencimiento: expDate ? expDate.toISOString().split('T')[0] : null
                });
              }
            }

            niche.eval = this.evaluateNicheStatus(niche);
            this.niches.set(nicheId, niche);
          }
        }
      }

      return this.getWarehouseSummary();
    }

    getRandomProduct(targetStatus) {
      if (targetStatus === 'sin_fecha') {
        const techItems = PRODUCT_CATALOG.filter(p => p.defaultTtlDays === null);
        return techItems[Math.floor(Math.random() * techItems.length)];
      }
      const perishables = PRODUCT_CATALOG.filter(p => p.defaultTtlDays !== null);
      return perishables[Math.floor(Math.random() * perishables.length)];
    }

    generateDateForStatus(status) {
      if (status === 'sin_fecha') return null;

      const date = new Date(this.today);
      if (status === 'vencido') {
        // Vencido hace entre 1 y 60 días
        const daysAgo = Math.floor(Math.random() * 59) + 2;
        date.setDate(date.getDate() - daysAgo);
      } else if (status === 'critico') {
        // Vence en <= criticoDays (ej. 1 a 30 días)
        const days = Math.floor(Math.random() * (this.criticoDays - 1)) + 1;
        date.setDate(date.getDate() + days);
      } else if (status === 'por_vencer') {
        // Vence entre criticoDays y porVencerDays (ej. 31 a 90 días)
        const min = this.criticoDays + 1;
        const max = this.porVencerDays;
        const days = Math.floor(Math.random() * (max - min)) + min;
        date.setDate(date.getDate() + days);
      } else if (status === 'vigente') {
        // Vence en más de porVencerDays (ej. 91 a 600 días)
        const days = Math.floor(Math.random() * 500) + this.porVencerDays + 1;
        date.setDate(date.getDate() + days);
      }
      return date;
    }

    /**
     * Recalcula todos los nichos cuando el usuario modifica los umbrales de días
     */
    recalculateAll(criticoDays, porVencerDays) {
      if (criticoDays !== undefined) this.criticoDays = Number(criticoDays);
      if (porVencerDays !== undefined) this.porVencerDays = Number(porVencerDays);

      for (const niche of this.niches.values()) {
        niche.eval = this.evaluateNicheStatus(niche);
      }

      return this.getWarehouseSummary();
    }

    /**
     * Resumen consolidado para los contadores y KPIs de la barra lateral
     */
    getWarehouseSummary() {
      let vencido = 0;
      let critico = 0;
      let porVencer = 0;
      let vigente = 0;
      let sinFecha = 0;
      let vacio = 0;
      let totalPaletas = 0;

      for (const niche of this.niches.values()) {
        const status = niche.eval.status;
        if (status === 'vencido') vencido++;
        else if (status === 'critico') critico++;
        else if (status === 'por_vencer') porVencer++;
        else if (status === 'vigente') vigente++;
        else if (status === 'sin_fecha') sinFecha++;
        else if (status === 'vacio') vacio++;

        if (status !== 'vacio') {
          totalPaletas += (niche.items.length > 0 ? niche.items.length : 1);
        }
      }

      const totalNichos = this.niches.size || TOTAL_NICHES;
      const ocupados = totalNichos - vacio;
      const ocupacionPct = totalNichos > 0 ? Math.round((ocupados / totalNichos) * 100) : 0;

      return {
        totalNichos,
        ocupados,
        vacio,
        ocupacionPct,
        totalPaletas,
        counts: {
          vencido,
          critico,
          por_vencer: porVencer,
          vigente,
          sin_fecha: sinFecha,
          vacio
        },
        criticoDays: this.criticoDays,
        porVencerDays: this.porVencerDays
      };
    }

    /**
     * Búsqueda inteligente por producto, SKU, lote o código de ubicación
     */
    search(query) {
      if (!query || !query.trim()) return [];
      const q = query.trim().toUpperCase();
      const results = [];

      for (const niche of this.niches.values()) {
        let match = false;
        let matchItem = null;

        if (niche.id.toUpperCase().includes(q)) {
          match = true;
        }

        if (!match && niche.items) {
          for (const item of niche.items) {
            if (
              (item.sku && item.sku.toUpperCase().includes(q)) ||
              (item.nombre && item.nombre.toUpperCase().includes(q)) ||
              (item.lote && item.lote.toUpperCase().includes(q)) ||
              (item.categoria && item.categoria.toUpperCase().includes(q))
            ) {
              match = true;
              matchItem = item;
              break;
            }
          }
        }

        if (match) {
          results.push({
            nicheId: niche.id,
            niche: niche,
            matchedItem: matchItem
          });
        }
      }

      return results;
    }
  }

  window.WarehouseDataManager = WarehouseDataManager;
})(window);
