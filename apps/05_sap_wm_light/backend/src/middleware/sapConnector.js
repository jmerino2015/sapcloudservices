/* ============================================================
   SAP OData Connector (sapConnector.js)
   Integración con SAP ERP vía OData REST — sin binarios nativos
   Compatible con SAP S/4HANA, SAP ECC con NetWeaver Gateway
   ============================================================ */
'use strict';
const axios = require('axios');

class SAPConnector {
  constructor() {
    this.baseURL  = process.env.SAP_ODATA_URL  || 'http://sapserver:8000/sap/opu/odata/sap';
    this.user     = process.env.SAP_USER        || 'WM_LIGHT';
    this.password = process.env.SAP_PASSWD      || '';
    this.client   = process.env.SAP_CLIENT      || '100';
    this.timeout  = 30000;

    this._http = axios.create({
      baseURL: this.baseURL,
      auth: { username: this.user, password: this.password },
      timeout: this.timeout,
      headers: {
        'sap-client': this.client,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
  }

  /* ── Test connection ────────────────────────────────────── */
  async ping() {
    try {
      await this._http.get('/ZPURCHASE_SRV/$metadata', { timeout: 5000 });
      return { connected: true, latency: Date.now() };
    } catch(err) {
      return { connected: false, error: err.message };
    }
  }

  /* ── Get CSRF Token (required for write operations) ─────── */
  async _getCsrfToken() {
    const res = await this._http.get('/', { headers: { 'X-CSRF-Token': 'Fetch' } });
    return res.headers['x-csrf-token'];
  }

  /* ── Fetch Materials from SAP ───────────────────────────── */
  async getMaterials({ plant = '', materialType = '', maxRows = 500 } = {}) {
    try {
      // SAP OData service for Material Master (adjust to your SAP landscape)
      // Standard: /API_PRODUCT_SRV/A_Product or /ZMATERIAL_SRV/MaterialSet
      const res = await this._http.get('/API_PRODUCT_SRV/A_Product', {
        params: {
          $format: 'json',
          $top: maxRows,
          $filter: materialType ? `ProductType eq '${materialType}'` : undefined,
          $select: 'Product,ProductDescription,ProductType,BaseUnit,GrossWeight,WeightUnit,BatchManagementRequirement',
        }
      });
      const items = res.data?.d?.results || res.data?.value || [];
      return items.map(m => ({
        sap_code:      m.Product,
        description:   m.ProductDescription || m.Product,
        material_type: m.ProductType,
        base_unit:     m.BaseUnit,
        gross_weight:  parseFloat(m.GrossWeight) || null,
        weight_unit:   m.WeightUnit,
        batch_managed: m.BatchManagementRequirement === 'X',
      }));
    } catch(err) {
      console.error('[SAP] getMaterials error:', err.message);
      // Fallback: return mock data if SAP not reachable
      return _mockMaterials();
    }
  }

  /* ── Fetch Batches from SAP ─────────────────────────────── */
  async getBatches({ materialCode = '', maxRows = 1000 } = {}) {
    try {
      // Standard batch API: /API_BATCH_SRV/A_Batch
      const params = {
        $format: 'json',
        $top: maxRows,
        $select: 'Material,Batch,ManufactureDate,ShelfLifeExpirationDate,BatchStatus',
      };
      if (materialCode) params.$filter = `Material eq '${materialCode}'`;

      const res = await this._http.get('/API_BATCH_SRV/A_Batch', { params });
      const items = res.data?.d?.results || res.data?.value || [];
      return items.map(b => ({
        sap_code:       b.Material,
        batch_number:   b.Batch,
        manufacture_date: b.ManufactureDate ? b.ManufactureDate.slice(0,10) : null,
        expiry_date:    b.ShelfLifeExpirationDate ? b.ShelfLifeExpirationDate.slice(0,10) : null,
        status:         b.BatchStatus === '1' ? 'ACTIVE' : 'BLOCKED',
      }));
    } catch(err) {
      console.error('[SAP] getBatches error:', err.message);
      return _mockBatches();
    }
  }

  /* ── Post stock movement to SAP (GR/GI confirmation) ────── */
  async postGoodsMovement({ movementType, material, plant, storageLocation, quantity, unit, batch }) {
    try {
      const token = await this._getCsrfToken();
      const res = await this._http.post('/API_MATERIAL_DOCUMENT_SRV/A_MaterialDocumentHeader', {
        GoodsMovementType: movementType,  // e.g. '101' for GR, '601' for GI
        Material: material,
        Plant: plant,
        StorageLocation: storageLocation,
        Quantity: String(quantity),
        QuantityUnit: unit,
        Batch: batch || '',
        PostingDate: new Date().toISOString().slice(0,10),
      }, { headers: { 'X-CSRF-Token': token } });
      return { success: true, sapDocument: res.data?.d?.MaterialDocument };
    } catch(err) {
      console.error('[SAP] postGoodsMovement error:', err.message);
      return { success: false, error: err.message };
    }
  }
}

/* ── Mock data (used when SAP is not reachable) ─────────── */
function _mockMaterials() {
  return [
    { sap_code:'4500001', description:'Cable UTP Cat6 305m', material_type:'ROH', base_unit:'BOB', batch_managed:true },
    { sap_code:'4500002', description:'Switch 24 puertos PoE', material_type:'FERT', base_unit:'EA', batch_managed:false },
    { sap_code:'4500003', description:'Rack 42U 800mm', material_type:'HALB', base_unit:'EA', batch_managed:false },
    { sap_code:'4500004', description:'Patch Panel 24p Cat6', material_type:'ROH', base_unit:'EA', batch_managed:false },
    { sap_code:'4500005', description:'UPS 1500VA Line-Interactiva', material_type:'FERT', base_unit:'EA', batch_managed:true },
  ];
}

function _mockBatches() {
  return [
    { sap_code:'4500001', batch_number:'BT2024001', manufacture_date:'2023-06-01', expiry_date:'2026-06-01', status:'ACTIVE' },
    { sap_code:'4500005', batch_number:'BT2024045', manufacture_date:'2023-09-15', expiry_date:'2026-09-15', status:'ACTIVE' },
  ];
}

// Singleton
const connector = new SAPConnector();
module.exports = connector;
