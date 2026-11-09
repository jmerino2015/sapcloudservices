/**
 * SAP WMS 3D Digital Twin - SAP Joule AI Assistant
 * Interfaz de lenguaje natural y copiloto inteligente para consultas de inventario 3D
 */

(function (window) {
  'use strict';

  class JouleWarehouseAssistant {
    constructor(dataManager, viewer3d, uiController) {
      this.dataManager = dataManager;
      this.viewer3d = viewer3d;
      this.uiController = uiController;
      this.isOpen = false;
      this.chatHistory = [];

      this.initUI();
    }

    initUI() {
      // Crear contenedor modal/drawer de Joule
      const drawer = document.createElement('div');
      drawer.id = 'sap-joule-drawer';
      drawer.className = 'sap-joule-drawer';
      drawer.innerHTML = `
        <div class="joule-header">
          <div class="joule-title-block">
            <div class="joule-icon-sparkle">✦</div>
            <div class="joule-title-text">
              <span class="joule-brand">SAP Joule</span>
              <span class="joule-subtitle">Copiloto WMS & Almacén 3D</span>
            </div>
          </div>
          <button class="joule-close-btn" id="joule-close-btn" title="Cerrar Joule">✕</button>
        </div>

        <div class="joule-messages" id="joule-messages">
          <div class="joule-msg bot">
            <div class="joule-msg-avatar">✦</div>
            <div class="joule-msg-bubble">
              Hola, soy <strong>SAP Joule</strong>. Estoy conectado al gemelo digital 3D de este almacén.
              <br><br>
              Puedo ayudarte a inspeccionar lotes vencidos, buscar SKUs, calcular ocupación o dirigir la cámara a cualquier pasillo.
            </div>
          </div>
        </div>

        <div class="joule-quick-chips">
          <button class="joule-chip" data-query="alertas">🚨 Lotes vencidos y críticos</button>
          <button class="joule-chip" data-query="ocupacion">📊 Ocupación de nichos</button>
          <button class="joule-chip" data-query="buscar-aceite">📍 Localizar Aceite (SKU-1004)</button>
          <button class="joule-chip" data-query="pasillo-f">🚶 Recorrer Pasillo F</button>
          <button class="joule-chip" data-query="puertas">🚪 Zona de Recepción & Despacho</button>
        </div>

        <div class="joule-input-area">
          <input type="text" id="joule-input" class="joule-input" placeholder="Pregúntale a Joule sobre el almacén..." />
          <button id="joule-send-btn" class="joule-send-btn" title="Enviar">➤</button>
        </div>
      `;

      document.body.appendChild(drawer);

      // FAB flotante de Joule
      const fab = document.createElement('button');
      fab.id = 'sap-joule-fab';
      fab.className = 'sap-joule-fab';
      fab.title = 'Abrir SAP Joule Copilot';
      fab.innerHTML = `<span class="fab-sparkle">✦</span><span class="fab-text">Joule</span>`;
      document.body.appendChild(fab);

      // Eventos
      fab.addEventListener('click', () => this.toggle());
      document.getElementById('joule-close-btn').addEventListener('click', () => this.close());

      const input = document.getElementById('joule-input');
      const sendBtn = document.getElementById('joule-send-btn');

      sendBtn.addEventListener('click', () => {
        const text = input.value.trim();
        if (text) {
          this.processUserQuery(text);
          input.value = '';
        }
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const text = input.value.trim();
          if (text) {
            this.processUserQuery(text);
            input.value = '';
          }
        }
      });

      // Chips de acción rápida
      drawer.querySelectorAll('.joule-chip').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const q = e.currentTarget.getAttribute('data-query');
          this.handleChipClick(q);
        });
      });
    }

    toggle() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }

    open() {
      this.isOpen = true;
      const drawer = document.getElementById('sap-joule-drawer');
      if (drawer) drawer.classList.add('open');
      const input = document.getElementById('joule-input');
      if (input) input.focus();
    }

    close() {
      this.isOpen = false;
      const drawer = document.getElementById('sap-joule-drawer');
      if (drawer) drawer.classList.remove('open');
    }

    handleChipClick(action) {
      if (action === 'alertas') {
        this.processUserQuery('¿Cuántos productos están vencidos o críticos?');
      } else if (action === 'ocupacion') {
        this.processUserQuery('¿Cuál es la ocupación del almacén?');
      } else if (action === 'buscar-aceite') {
        this.processUserQuery('Buscar Aceite vegetal SKU-1004');
      } else if (action === 'pasillo-f') {
        this.processUserQuery('Entrar al Pasillo F');
      } else if (action === 'puertas') {
        this.processUserQuery('Mostrar muelles de recepción y despacho');
      }
    }

    addMessage(role, htmlText) {
      const container = document.getElementById('joule-messages');
      if (!container) return;

      const msgDiv = document.createElement('div');
      msgDiv.className = `joule-msg ${role}`;

      if (role === 'bot') {
        msgDiv.innerHTML = `
          <div class="joule-msg-avatar">✦</div>
          <div class="joule-msg-bubble">${htmlText}</div>
        `;
      } else {
        msgDiv.innerHTML = `
          <div class="joule-msg-bubble">${htmlText}</div>
        `;
      }

      container.appendChild(msgDiv);
      container.scrollTop = container.scrollHeight;
    }

    processUserQuery(query) {
      this.addMessage('user', query);
      const q = query.toLowerCase();

      setTimeout(() => {
        const summary = this.dataManager.getWarehouseSummary();

        // 1. Consulta de Alertas / Vencimientos
        if (q.includes('vencid') || q.includes('critico') || q.includes('alerta') || q.includes('caduc')) {
          const v = summary.counts.vencido;
          const c = summary.counts.critico;
          const pv = summary.counts.por_vencer;

          this.addMessage('bot', `
            He analizado el inventario:
            <ul>
              <li><strong style="color:#e53935;">${v} nichos con producto vencido</strong> (atención inmediata requerida).</li>
              <li><strong style="color:#ff5722;">${c} nichos en estado crítico</strong> (vencen en &le; ${summary.criticoDays} días).</li>
              <li><strong style="color:#ffc107;">${pv} nichos por vencer</strong> (vencen en &le; ${summary.porVencerDays} días).</li>
            </ul>
            He activado el filtro <strong>"Solo Alertas"</strong> en el gemelo 3D para aislar los lotes comprometidos.
          `);

          // Activar filtro en 3D
          if (this.uiController) {
            this.uiController.setFilterState('alerts_only');
          }
          return;
        }

        // 2. Consulta de Ocupación / Capacidad
        if (q.includes('ocupaci') || q.includes('capacidad') || q.includes('disponib') || q.includes('espacio')) {
          this.addMessage('bot', `
            El almacén cuenta con <strong>${summary.totalNichos.toLocaleString()} nichos de estantería</strong> y <strong>${summary.totalPaletas.toLocaleString()} paletas almacenadas</strong>:
            <br><br>
            • <strong>Ocupación:</strong> ${summary.ocupados.toLocaleString()} nichos ocupados (<strong>${summary.ocupacionPct}%</strong>).<br>
            • <strong>Disponibles:</strong> ${summary.vacio.toLocaleString()} nichos libres aptos para recepción (28%).
          `);
          return;
        }

        // 3. Consulta de Pasillo
        if (q.includes('pasillo')) {
          const match = q.match(/pasillo\s*([a-j])/i);
          const letter = match ? match[1].toUpperCase() : 'F';
          this.viewer3d.setCameraView('pasillo', letter);
          this.addMessage('bot', `
            Dirigiendo cámara al <strong>Pasillo ${letter}</strong> en modo primera persona. Puedes inspeccionar las estanterías de ambos lados.
          `);
          return;
        }

        // 4. Puertas / Stage
        if (q.includes('puerta') || q.includes('muelle') || q.includes('stage') || q.includes('recep') || q.includes('despacho')) {
          this.viewer3d.setCameraView('stage');
          this.addMessage('bot', `
            Enfocando la <strong>Zona de Stage (12 m)</strong>, muelles de Recepción <strong>(R1, R2, R3)</strong> y Despacho <strong>(D1, D2, D3)</strong>.
          `);
          return;
        }

        // 5. Búsqueda de material o SKU
        const searchResults = this.dataManager.search(query.replace(/buscar|localizar|donde esta|dónde está/gi, '').trim());
        if (searchResults.length > 0) {
          const first = searchResults[0];
          const niche = first.niche;
          const item = first.matchedItem || (niche.items && niche.items[0]);

          this.viewer3d.selectNiche(niche.id);

          this.addMessage('bot', `
            Encontré <strong>${searchResults.length} coincidencia(s)</strong>.
            <br><br>
            Ubicación principal: <strong>Nicho ${niche.id}</strong> (Pasillo ${niche.pasillo}, Columna ${niche.columna}, Nivel ${niche.nivel}).
            <br>
            Material: <em>${item ? item.nombre : ''}</em> [${item ? item.sku : ''}] · Lote: <strong>${item ? item.lote : ''}</strong>.
            <br><br>
            Cámara 3D posicionada sobre la ubicación seleccionada.
          `);
          return;
        }

        // Respuesta genérica inteligente
        this.addMessage('bot', `
          Entendido. Puedo asistirte en:
          <ul>
            <li>Semáforo de vencimientos (Vencidos, Críticos, Por vencer)</li>
            <li>Búsqueda de materiales (por SKU, lote, nombre o ubicación ej. 'H-01-3')</li>
            <li>Navegación de cámaras 3D (General, Planta, Stage o Pasillo)</li>
            <li>Carga de archivos Excel con inventarios reales de SAP</li>
          </ul>
        `);
      }, 350);
    }
  }

  window.JouleWarehouseAssistant = JouleWarehouseAssistant;
})(window);
