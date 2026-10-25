/**
 * Sales Core API Handlers
 * Centralized to avoid duplication in server.js
 */
module.exports = async function(req, res, reqUrl, db) {
  // Return true if this request was handled
  let handled = false;
  // Only handle sales-core routes
  if (!reqUrl.startsWith('/api/sales-core')) return false;

  // Only handle sales-core routes
  if (!reqUrl.startsWith('/api/sales-core')) return false;

  // Set CORS and JSON header (if not already set elsewhere)
  if (req.method !== 'OPTIONS') {
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization'
    });
  }

  // Helper to read JSON body
  const readJsonBody = async (request) => {
    return new Promise((resolve) => {
      let body = '';
      request.on('data', (chunk) => (body += chunk));
      request.on('end', () => {
        try {
          resolve(body ? JSON.parse(body) : {});
        } catch (e) {
          resolve({});
        }
      });
    });
  };

  // KPI endpoint
  if (reqUrl === '/api/sales-core/kpis') {
    const kpis = await db.getSalesCoreKpis();
    return res.end(JSON.stringify({ success: true, data: kpis }));
  }

  // Generic CRUD helper
  const handleCrud = async (entity, getFn, createFn) => {
    if (req.method === 'GET') {
      const result = await getFn();
      return res.end(JSON.stringify(result));
    }
    if (req.method === 'POST') {
      const body = await readJsonBody(req);
      const result = await createFn(body);
      return res.end(JSON.stringify(result));
    }
    // Unsupported method
    res.writeHead(405);
    return res.end(JSON.stringify({ success: false, error: 'Method not allowed' }));
  };

  // Routes
  if (reqUrl === '/api/sales-core/accounts') {
    return await handleCrud('accounts', db.getAccounts, db.createAccount);
  }
  if (reqUrl === '/api/sales-core/contacts') {
    return await handleCrud('contacts', db.getContacts, db.createContact);
  }
  if (reqUrl === '/api/sales-core/leads') {
    return await handleCrud('leads', db.getLeads, db.createLead);
  }
  if (reqUrl === '/api/sales-core/opportunities') {
    return await handleCrud('opportunities', db.getOpportunities, db.createOpportunity);
  }

  // If we reach here, route not matched
  res.writeHead(404);
  return res.end(JSON.stringify({ success: false, error: 'Not found' }));
};
