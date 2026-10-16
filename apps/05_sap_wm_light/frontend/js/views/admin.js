/* ============================================================
   View: Admin — Administración del sistema
   ============================================================ */

App.registerView('admin', () => {
  setTimeout(View_admin_init, 0);
  return `
  <div>
    <div class="page-header">
      <div class="page-header-top">
        <button class="back-btn" onclick="App.navigate('home')"><span class="sap-icon sap-icon--nav-back"></span></button>
        <div>
          <div class="page-title">Administración del Sistema</div>
          <div class="page-subtitle">Usuarios, roles, parámetros WM y configuración SAP</div>
        </div>
      </div>
      <div class="tabs" style="margin-bottom:0;margin-top:var(--space-md)">
        <div class="tab-item active" id="tab-btn-users"   onclick="View_admin_tab(this,'tab-users')">
          <span class="sap-icon sap-icon--employee"></span> Usuarios
        </div>
        <div class="tab-item" id="tab-btn-params"  onclick="View_admin_tab(this,'tab-params')">
          <span class="sap-icon sap-icon--action-settings"></span> Parámetros WM
        </div>
        <div class="tab-item" id="tab-btn-audit"   onclick="View_admin_tab(this,'tab-audit')">
          <span class="sap-icon sap-icon--table-view"></span> Log Auditoría
        </div>
        <div class="tab-item" id="tab-btn-sap"     onclick="View_admin_tab(this,'tab-sap')">
          <span class="sap-icon sap-icon--synchronize"></span> Config. SAP
        </div>
      </div>
    </div>

    <!-- ── TAB: USUARIOS ───────────────────────────────────── -->
    <div id="tab-users">
      <div class="kpi-strip" style="margin-bottom:var(--space-lg)">
        <div class="kpi-card" style="--kpi-color:var(--sap-blue)">
          <div class="kpi-label">Total Usuarios</div>
          <div class="kpi-value">5</div>
          <div class="kpi-sub">4 activos · 1 inactivo</div>
        </div>
        <div class="kpi-card" style="--kpi-color:var(--sap-error)">
          <div class="kpi-label">Administradores</div>
          <div class="kpi-value">1</div>
          <div class="kpi-sub">Acceso total al sistema</div>
        </div>
        <div class="kpi-card" style="--kpi-color:var(--sap-warning)">
          <div class="kpi-label">Supervisores</div>
          <div class="kpi-value">1</div>
          <div class="kpi-sub">WH001</div>
        </div>
        <div class="kpi-card" style="--kpi-color:var(--sap-success)">
          <div class="kpi-label">Operadores</div>
          <div class="kpi-value">3</div>
          <div class="kpi-sub">2 activos · 1 inactivo</div>
        </div>
      </div>

      ${Utils.buildTable({
        id: 'admin-users-table',
        toolbar: `
          <span class="table-toolbar-title">Usuarios del sistema</span>
          <span class="table-toolbar-count">5</span>
          <div class="table-search">
            <span class="sap-icon sap-icon--search"></span>
            <input type="text" placeholder="Buscar usuario…" oninput="Utils.filterTable('admin-user-search','admin-users-table')" id="admin-user-search" />
          </div>
          <div class="table-spacer"></div>
          <button class="btn btn-primary btn-sm" onclick="View_admin_newUser()">
            <span class="sap-icon sap-icon--add"></span> Nuevo usuario
          </button>`,
        headers: ['Usuario','Email','Rol','Almacenes','Último acceso','Estado','Acción'],
        rows: [
          [
            '<div style="display:flex;align-items:center;gap:8px"><div style="width:28px;height:28px;border-radius:50%;background:var(--sap-error);color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700">AD</div><strong>Administrador</strong></div>',
            'admin@jmholding.org',
            '<span class="badge badge-error">Administrador</span>',
            'WH001, WH002',
            'Hoy 12:30',
            '<span class="badge badge-success">Activo</span>',
            '<button class="btn btn-ghost btn-sm" onclick="View_admin_editUser(1)">Editar</button>'
          ],
          [
            '<div style="display:flex;align-items:center;gap:8px"><div style="width:28px;height:28px;border-radius:50%;background:var(--sap-warning);color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700">JP</div>Juan Pérez</div>',
            'jperez@empresa.com',
            '<span class="badge badge-warning">Supervisor</span>',
            'WH001',
            'Hoy 09:15',
            '<span class="badge badge-success">Activo</span>',
            '<button class="btn btn-ghost btn-sm" onclick="View_admin_editUser(2)">Editar</button>'
          ],
          [
            '<div style="display:flex;align-items:center;gap:8px"><div style="width:28px;height:28px;border-radius:50%;background:var(--sap-blue);color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700">MG</div>María Gómez</div>',
            'mgomez@empresa.com',
            '<span class="badge badge-info">Operador</span>',
            'WH001',
            'Hoy 08:55',
            '<span class="badge badge-success">Activo</span>',
            '<button class="btn btn-ghost btn-sm" onclick="View_admin_editUser(3)">Editar</button>'
          ],
          [
            '<div style="display:flex;align-items:center;gap:8px"><div style="width:28px;height:28px;border-radius:50%;background:var(--sap-blue);color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700">LR</div>Luis Rodríguez</div>',
            'lrodriguez@empresa.com',
            '<span class="badge badge-info">Operador</span>',
            'WH002',
            'Ayer 17:30',
            '<span class="badge badge-success">Activo</span>',
            '<button class="btn btn-ghost btn-sm" onclick="View_admin_editUser(4)">Editar</button>'
          ],
          [
            '<div style="display:flex;align-items:center;gap:8px"><div style="width:28px;height:28px;border-radius:50%;background:var(--sap-text-3);color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700">AL</div>Ana López</div>',
            'alopez@empresa.com',
            '<span class="badge badge-info">Operador</span>',
            'WH002',
            'Hace 5 días',
            '<span class="badge badge-neutral">Inactivo</span>',
            '<button class="btn btn-ghost btn-sm" onclick="View_admin_editUser(5)">Editar</button>'
          ],
        ],
        empty: 'No hay usuarios registrados'
      })}
    </div>

    <!-- ── TAB: PARÁMETROS WM ──────────────────────────────── -->
    <div id="tab-params" class="hidden">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-lg)">

        <!-- Estrategias -->
        <div class="card">
          <div class="card-header">
            <div class="card-title"><span class="sap-icon sap-icon--transfer" style="color:var(--sap-blue)"></span> Estrategias de Almacenaje</div>
          </div>
          <div class="card-body">
            <div class="form-field mb-md">
              <label class="form-label">Estrategia de Putaway por defecto</label>
              <select class="form-control w-full" id="param-putaway">
                <option selected>FEFO — First Expired, First Out</option>
                <option>FIFO — First In, First Out</option>
                <option>LIFO — Last In, First Out</option>
                <option>Bin vacío más cercano</option>
                <option>Por zona fija de material</option>
              </select>
              <span class="form-hint">Aplica cuando no hay regla específica por material</span>
            </div>
            <div class="form-field mb-md">
              <label class="form-label">Estrategia de Picking por defecto</label>
              <select class="form-control w-full" id="param-picking">
                <option selected>FEFO — First Expired, First Out</option>
                <option>FIFO — First In, First Out</option>
                <option>LIFO — Last In, First Out</option>
              </select>
            </div>
            <div class="form-field">
              <label class="form-label">Generación de TOs</label>
              <select class="form-control w-full">
                <option selected>Automática al confirmar GR</option>
                <option>Manual (supervisión requerida)</option>
                <option>Por lote programado</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Alertas de stock -->
        <div class="card">
          <div class="card-header">
            <div class="card-title"><span class="sap-icon sap-icon--alert" style="color:var(--sap-warning)"></span> Umbrales de Stock</div>
          </div>
          <div class="card-body">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-md);margin-bottom:var(--space-md)">
              <div class="form-field">
                <label class="form-label">Umbral Stock Bajo (%)</label>
                <input class="form-control" type="number" value="20" min="0" max="100" id="param-low" />
                <span class="form-hint">Alerta amarilla</span>
              </div>
              <div class="form-field">
                <label class="form-label">Umbral Stock Crítico (%)</label>
                <input class="form-control" type="number" value="5" min="0" max="100" id="param-critical" />
                <span class="form-hint">Alerta roja</span>
              </div>
            </div>
            <div class="form-field mb-md">
              <label class="form-label">Permitir stock negativo</label>
              <select class="form-control w-full">
                <option selected>No — Bloquear movimiento</option>
                <option>Sí — Permitir con advertencia</option>
              </select>
            </div>
            <div class="form-field">
              <label class="form-label">Requerir confirmación de TOs</label>
              <select class="form-control w-full">
                <option selected>Sí — Confirmar cada TO</option>
                <option>No — Confirmar automáticamente</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Almacenes configurados -->
        <div class="card">
          <div class="card-header">
            <div class="card-title"><span class="sap-icon sap-icon--warehouse" style="color:var(--sap-blue)"></span> Almacenes Activos</div>
            <button class="btn btn-ghost btn-sm" onclick="App.toast('info','Agregar almacén (próximamente)')">
              <span class="sap-icon sap-icon--add"></span>
            </button>
          </div>
          <div class="card-body" style="padding:0">
            ${[
              { id:'WH001', name:'Almacén Principal',   bins:120, occ:68, status:'ACTIVE'  },
              { id:'WH002', name:'Almacén Secundario',  bins:80,  occ:32, status:'ACTIVE'  },
            ].map(w => `
              <div style="padding:var(--space-md);border-bottom:1px solid var(--sap-separator);display:flex;align-items:center;gap:var(--space-md)">
                <div style="width:2.5rem;height:2.5rem;background:var(--sap-blue-light);border-radius:var(--radius-sm);
                            display:flex;align-items:center;justify-content:center;color:var(--sap-blue);font-size:1.125rem">
                  <span class="sap-icon sap-icon--factory"></span>
                </div>
                <div style="flex:1">
                  <div style="font-weight:700;font-size:var(--font-sm)">${w.id} — ${w.name}</div>
                  <div style="font-size:var(--font-xs);color:var(--sap-text-2)">${w.bins} bins · ${w.occ}% ocupado</div>
                  <div class="progress" style="margin-top:4px;height:4px">
                    <div class="progress-bar ${w.occ > 80 ? 'danger' : w.occ > 60 ? 'warning' : 'success'}" style="width:${w.occ}%"></div>
                  </div>
                </div>
                <span class="badge badge-success">Activo</span>
              </div>`).join('')}
          </div>
        </div>

        <!-- Notificaciones -->
        <div class="card">
          <div class="card-header">
            <div class="card-title"><span class="sap-icon sap-icon--bell" style="color:var(--sap-blue)"></span> Notificaciones</div>
          </div>
          <div class="card-body">
            ${[
              { label:'Alertas de stock crítico',       checked:true  },
              { label:'TO pendiente más de 24h',        checked:true  },
              { label:'Error de sincronización SAP',    checked:true  },
              { label:'GR sin confirmar > 8h',          checked:true  },
              { label:'Inventario físico programado',   checked:false },
              { label:'Reporte diario por email',       checked:false },
            ].map(n => `
              <label style="display:flex;align-items:center;gap:var(--space-sm);padding:5px 0;cursor:pointer;font-size:var(--font-sm)">
                <input type="checkbox" ${n.checked ? 'checked' : ''} style="accent-color:var(--sap-blue);width:14px;height:14px" />
                ${n.label}
              </label>`).join('')}
          </div>
        </div>
      </div>

      <div style="display:flex;justify-content:flex-end;margin-top:var(--space-lg);gap:var(--space-sm)">
        <button class="btn btn-ghost" onclick="App.toast('info','Valores restaurados a los predeterminados')">Restaurar defaults</button>
        <button class="btn btn-primary" onclick="App.toast('success','Parámetros guardados correctamente')">
          <span class="sap-icon sap-icon--accept"></span> Guardar cambios
        </button>
      </div>
    </div>

    <!-- ── TAB: LOG AUDITORÍA ──────────────────────────────── -->
    <div id="tab-audit" class="hidden">
      <div class="kpi-strip" style="margin-bottom:var(--space-lg)">
        <div class="kpi-card" style="--kpi-color:var(--sap-blue)">
          <div class="kpi-label">Eventos hoy</div>
          <div class="kpi-value">47</div>
          <div class="kpi-sub">vs 38 ayer</div>
        </div>
        <div class="kpi-card" style="--kpi-color:var(--sap-success)">
          <div class="kpi-label">Operaciones OK</div>
          <div class="kpi-value">45</div>
          <div class="kpi-sub">95.7% tasa de éxito</div>
        </div>
        <div class="kpi-card" style="--kpi-color:var(--sap-error)">
          <div class="kpi-label">Errores</div>
          <div class="kpi-value">2</div>
          <div class="kpi-sub">Requieren revisión</div>
        </div>
        <div class="kpi-card" style="--kpi-color:var(--sap-blue)">
          <div class="kpi-label">Usuarios activos hoy</div>
          <div class="kpi-value">3</div>
          <div class="kpi-sub">de 4 activos</div>
        </div>
      </div>

      ${Utils.buildTable({
        id:'audit-table',
        toolbar:`
          <span class="table-toolbar-title">Log de Auditoría</span>
          <span class="table-toolbar-count">47</span>
          <div class="table-search">
            <span class="sap-icon sap-icon--search"></span>
            <input type="text" placeholder="Buscar acción, usuario…" oninput="Utils.filterTable('audit-search','audit-table')" id="audit-search" />
          </div>
          <div class="table-spacer"></div>
          <button class="btn btn-ghost btn-sm" onclick="App.toast('info','Exportando log...')">
            <span class="sap-icon sap-icon--download"></span> Exportar
          </button>`,
        headers:['Fecha/Hora','Usuario','Rol','Acción','Entidad','Detalle','IP'],
        rows:[
          ['Hoy 12:30','admin','Admin','<span class="badge badge-info">LOGIN</span>','Sistema','Inicio de sesión exitoso','192.168.1.1'],
          ['Hoy 09:32','jperez','Supervisor','<span class="badge badge-success">CONFIRM</span>','GR-2024-001','Confirmó recepción de mercancías — 3 TOs generadas','192.168.1.10'],
          ['Hoy 09:20','mgomez','Operador','<span class="badge badge-success">COMPLETE</span>','TO-2024-003','Completó transfer order — Bin B-01-02','192.168.1.11'],
          ['Hoy 08:55','lrodriguez','Operador','<span class="badge badge-info">CREATE</span>','GI-2024-002','Creó salida de mercancías — WH002','192.168.1.12'],
          ['Hoy 08:00','sistema','Auto','<span class="badge badge-neutral">SYNC</span>','SAP','Sincronización automática de materiales y lotes','127.0.0.1'],
          ['Ayer 17:30','jperez','Supervisor','<span class="badge badge-error">CANCEL</span>','TO-2024-012','Canceló TO por ubicación bloqueada','192.168.1.10'],
          ['Ayer 16:30','admin','Admin','<span class="badge badge-warning">UPDATE</span>','PARAM','Cambió estrategia de putaway a FEFO','192.168.1.1'],
          ['Ayer 14:15','mgomez','Operador','<span class="badge badge-success">CONFIRM</span>','GR-2024-009','Recepción parcial — 2 de 3 líneas confirmadas','192.168.1.11'],
          ['Ayer 08:00','sistema','Auto','<span class="badge badge-neutral">SYNC</span>','SAP','Sincronización automática completada — 7 materiales','127.0.0.1'],
          ['Ayer 07:58','admin','Admin','<span class="badge badge-info">LOGIN</span>','Sistema','Inicio de sesión exitoso','192.168.1.1'],
        ],
        empty:'No hay registros de auditoría'
      })}
    </div>

    <!-- ── TAB: CONFIG SAP ─────────────────────────────────── -->
    <div id="tab-sap" class="hidden">

      <!-- Estado banner -->
      <div id="sap-cfg-status-bar" style="
        border-radius:var(--radius-md);padding:var(--space-md) var(--space-lg);
        margin-bottom:var(--space-lg);display:flex;align-items:center;gap:var(--space-md);
        background:var(--sap-neutral-bg);border:1px solid var(--sap-border)">
        <div style="width:2.5rem;height:2.5rem;border-radius:50%;background:var(--sap-border);
                    display:flex;align-items:center;justify-content:center;font-size:1.25rem;flex-shrink:0">
          <span class="sap-icon sap-icon--synchronize" style="color:var(--sap-text-3)"></span>
        </div>
        <div style="flex:1">
          <div style="font-weight:700">Verificando estado SAP…</div>
          <div id="sap-cfg-detail" class="text-muted text-small">Consultando servidor…</div>
        </div>
        <span id="sap-cfg-badge" class="badge badge-neutral">—</span>
        <button class="btn btn-secondary btn-sm" onclick="View_admin_testSAP()" id="sap-test-btn">
          <span class="sap-icon sap-icon--refresh"></span> Probar conexión
        </button>
      </div>

      <!-- Selector tipo conexión -->
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-md);margin-bottom:var(--space-lg)">
        <div id="conn-type-rfc" onclick="View_admin_selectConnType('rfc')"
             style="border:2px solid var(--sap-blue);background:var(--sap-blue-light);
                    border-radius:var(--radius-md);padding:var(--space-md);cursor:pointer;position:relative">
          <div style="position:absolute;top:10px;right:10px;width:8px;height:8px;background:var(--sap-blue);border-radius:50%"></div>
          <div style="font-size:1.75rem;color:var(--sap-blue);margin-bottom:var(--space-xs)"><span class="sap-icon sap-icon--transfer"></span></div>
          <div style="font-weight:700;color:var(--sap-blue)">SAP RFC / BAPI</div>
          <div style="font-size:var(--font-xs);color:var(--sap-text-2);margin-top:3px">Conexión nativa directa al ABAP</div>
        </div>
        <div id="conn-type-odata" onclick="View_admin_selectConnType('odata')"
             style="border:2px solid var(--sap-border-light);background:var(--sap-bg-2);
                    border-radius:var(--radius-md);padding:var(--space-md);cursor:pointer">
          <div style="font-size:1.75rem;color:var(--sap-text-3);margin-bottom:var(--space-xs)"><span class="sap-icon sap-icon--internet-browser"></span></div>
          <div style="font-weight:700">SAP OData / REST API</div>
          <div style="font-size:var(--font-xs);color:var(--sap-text-2);margin-top:3px">Vía SAP Gateway o BTP</div>
        </div>
        <div id="conn-type-idoc" onclick="View_admin_selectConnType('idoc')"
             style="border:2px solid var(--sap-border-light);background:var(--sap-bg-2);
                    border-radius:var(--radius-md);padding:var(--space-md);cursor:pointer">
          <div style="font-size:1.75rem;color:var(--sap-text-3);margin-bottom:var(--space-xs)"><span class="sap-icon sap-icon--document"></span></div>
          <div style="font-weight:700">SAP IDoc / ALE</div>
          <div style="font-size:var(--font-xs);color:var(--sap-text-2);margin-top:3px">Documentos intermedios ALE</div>
        </div>
      </div>

      <!-- Panel RFC -->
      <div id="panel-rfc">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-md)">

          <div class="card">
            <div class="card-header">
              <div class="card-title"><span class="sap-icon sap-icon--it-system" style="color:var(--sap-blue)"></span> Servidor SAP</div>
            </div>
            <div class="card-body">
              <div class="form-field mb-md">
                <label class="form-label required">Host / IP Application Server</label>
                <div class="input-wrap">
                  <span class="sap-icon sap-icon--internet-browser input-icon"></span>
                  <input class="form-control form-control-icon w-full" id="sap-host" placeholder="sapserver.empresa.com" value="sapserver" />
                </div>
                <span class="form-hint">FQDN o dirección IP del servidor SAP</span>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-md);margin-bottom:var(--space-md)">
                <div class="form-field">
                  <label class="form-label required">System Number</label>
                  <input class="form-control" id="sap-sysnr" value="00" maxlength="2" />
                  <span class="form-hint">sysnr (2 dígitos)</span>
                </div>
                <div class="form-field">
                  <label class="form-label required">Client (Mandante)</label>
                  <input class="form-control" id="sap-client" value="100" maxlength="3" />
                  <span class="form-hint">mandt (3 dígitos)</span>
                </div>
              </div>
              <div class="form-field mb-md">
                <label class="form-label">Message Server (opcional)</label>
                <input class="form-control w-full" placeholder="msserver.empresa.com" />
              </div>
              <div class="form-field">
                <label class="form-label">SAP Router (opcional)</label>
                <input class="form-control w-full" placeholder="/H/router.empresa.com/S/3299/H/" />
              </div>
            </div>
          </div>

          <div style="display:flex;flex-direction:column;gap:var(--space-md)">
            <div class="card">
              <div class="card-header">
                <div class="card-title"><span class="sap-icon sap-icon--key" style="color:var(--sap-blue)"></span> Credenciales RFC</div>
              </div>
              <div class="card-body">
                <div class="form-field mb-md">
                  <label class="form-label required">Usuario RFC</label>
                  <div class="input-wrap">
                    <span class="sap-icon sap-icon--person-placeholder input-icon"></span>
                    <input class="form-control form-control-icon w-full" id="sap-user" value="WM_LIGHT_RFC" />
                  </div>
                  <span class="form-hint">Usuario técnico SAP con permisos WM/IM</span>
                </div>
                <div class="form-field">
                  <label class="form-label required">Contraseña RFC</label>
                  <div class="input-wrap">
                    <span class="sap-icon sap-icon--locked input-icon"></span>
                    <input class="form-control form-control-icon w-full" id="sap-pass" type="password" placeholder="••••••••••••" />
                  </div>
                  <span class="form-hint">Cifrada con AES-256</span>
                </div>
              </div>
            </div>

            <div class="card">
              <div class="card-header">
                <div class="card-title"><span class="sap-icon sap-icon--synchronize" style="color:var(--sap-blue)"></span> Sync Automática</div>
              </div>
              <div class="card-body">
                <div class="form-field mb-md">
                  <label class="form-label">Frecuencia</label>
                  <select class="form-control w-full" id="sap-sync-freq">
                    <option>Cada 6 horas</option>
                    <option>Cada 2 horas</option>
                    <option selected>Cada hora</option>
                    <option>Cada 30 minutos</option>
                    <option>Solo manual</option>
                  </select>
                </div>
                <div class="form-field">
                  <label class="form-label">Objetos a sincronizar</label>
                  <div style="display:flex;flex-direction:column;gap:5px">
                    <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:var(--font-sm)">
                      <input type="checkbox" checked style="accent-color:var(--sap-blue)" /> Materiales (MM60)
                    </label>
                    <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:var(--font-sm)">
                      <input type="checkbox" checked style="accent-color:var(--sap-blue)" /> Lotes
                    </label>
                    <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:var(--font-sm)">
                      <input type="checkbox" style="accent-color:var(--sap-blue)" /> Plantas y Centros
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- BAPIs configuradas -->
        <div class="card mt-md">
          <div class="card-header" style="cursor:pointer" onclick="View_admin_toggleAdvanced()">
            <div class="card-title"><span class="sap-icon sap-icon--action-settings" style="color:var(--sap-text-2)"></span> Funciones RFC Configuradas</div>
            <span class="sap-icon sap-icon--expand" id="adv-toggle-icon" style="color:var(--sap-text-3)"></span>
          </div>
          <div id="adv-options" class="hidden">
            <div class="card-body">
              ${[
                { fm:'BAPI_MATERIAL_GETALL',    uso:'Sync Maestro de Materiales',  status:'ok'   },
                { fm:'BAPI_BATCH_GETLIST',       uso:'Sync Lotes',                  status:'ok'   },
                { fm:'BAPI_GOODSMVT_CREATE',     uso:'Confirmación movimientos',    status:'ok'   },
                { fm:'WM_LIGHT_GET_OPEN_ORDERS', uso:'TOs pendientes en SAP',       status:'warn' },
              ].map(f => `
                <div style="display:flex;align-items:center;padding:var(--space-xs) 0;border-bottom:1px solid var(--sap-separator);gap:var(--space-sm)">
                  <span class="sap-icon ${f.status === 'ok' ? 'sap-icon--accept' : 'sap-icon--alert'}"
                        style="color:${f.status === 'ok' ? 'var(--sap-success)' : 'var(--sap-warning)'}"></span>
                  <code style="font-size:var(--font-xs);background:var(--sap-bg);padding:2px 8px;border-radius:4px;font-family:monospace">${f.fm}</code>
                  <span style="color:var(--sap-text-2);font-size:var(--font-sm)">${f.uso}</span>
                  ${f.status === 'warn' ? '<span class="badge badge-warning" style="margin-left:auto">Sin verificar</span>' : ''}
                </div>`).join('')}
            </div>
          </div>
        </div>

        <!-- Footer acciones -->
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:var(--space-lg);
                    padding:var(--space-md) var(--space-lg);background:var(--sap-bg);
                    border-radius:var(--radius-md);border:1px solid var(--sap-separator)">
          <div style="font-size:var(--font-sm);color:var(--sap-text-2)">
            <span class="sap-icon sap-icon--information"></span>
            Los cambios requieren reinicio del servicio de sincronización
          </div>
          <div style="display:flex;gap:var(--space-sm)">
            <button class="btn btn-secondary" onclick="View_admin_testSAP()">
              <span class="sap-icon sap-icon--transfer"></span> Probar conexión
            </button>
            <button class="btn btn-primary" onclick="View_admin_saveSAP()">
              <span class="sap-icon sap-icon--accept"></span> Guardar y aplicar
            </button>
          </div>
        </div>
      </div>

      <!-- Panel OData (oculto) -->
      <div id="panel-odata" class="hidden">
        <div class="card">
          <div class="card-header"><div class="card-title">Configuración SAP OData / REST API</div></div>
          <div class="card-body">
            <div class="form-row">
              <div class="form-field">
                <label class="form-label required">Base URL del Gateway</label>
                <input class="form-control w-full" placeholder="https://sapgw.empresa.com:8000/sap/opu/odata/sap/" />
              </div>
              <div class="form-field">
                <label class="form-label required">Service Name</label>
                <input class="form-control" placeholder="WM_LIGHT_SRV" value="WM_LIGHT_SRV" />
              </div>
            </div>
            <div style="padding:var(--space-md);background:var(--sap-info-bg);border:1px solid var(--sap-info-border);
                        border-radius:var(--radius-sm);margin-top:var(--space-md);font-size:var(--font-sm)">
              <span class="sap-icon sap-icon--information" style="color:var(--sap-blue)"></span>
              Requiere SAP Gateway activado y servicio <strong>WM_LIGHT_SRV</strong> en T-code <strong>/IWFND/MAINT_SERVICE</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- Panel IDoc (oculto) -->
      <div id="panel-idoc" class="hidden">
        <div class="card">
          <div class="card-header"><div class="card-title">Configuración SAP IDoc / ALE</div></div>
          <div class="card-body">
            <div class="form-row">
              <div class="form-field">
                <label class="form-label required">Partner Number (Logical System)</label>
                <input class="form-control" value="WMLIGHT_LS" />
              </div>
              <div class="form-field">
                <label class="form-label required">Puerto IDoc</label>
                <input class="form-control" type="number" value="4000" />
              </div>
            </div>
            <div style="padding:var(--space-md);background:var(--sap-warning-bg);border:1px solid var(--sap-warning-border);
                        border-radius:var(--radius-sm);font-size:var(--font-sm)">
              <span class="sap-icon sap-icon--alert" style="color:var(--sap-warning)"></span>
              Requiere configuración ALE (T-code WE20/WE21) y tipo de mensaje <strong>WMMBXY</strong>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>`;
});

/* ── FUNCIONES ─────────────────────────────────────────────── */

window.View_admin_init = function() {
  // No-op — datos demo ya están en el HTML
};

window.View_admin_tab = function(el, tabId) {
  document.querySelectorAll('[id^="tab-"]:not([id^="tab-btn-"])').forEach(t => t.classList.add('hidden'));
  document.getElementById(tabId)?.classList.remove('hidden');
  document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  if (tabId === 'tab-sap') View_admin_loadSAPStatus();
};

window.View_admin_loadSAPStatus = async function() {
  const bar    = document.getElementById('sap-cfg-status-bar');
  const badge  = document.getElementById('sap-cfg-badge');
  const detail = document.getElementById('sap-cfg-detail');
  if (!bar) return;
  try {
    const r = await API.SAP.status();
    const icon = bar.querySelector('.sap-icon');
    if (r.connected) {
      bar.style.background   = 'var(--sap-success-bg)';
      bar.style.borderColor  = 'var(--sap-success-border)';
      if (badge) { badge.textContent = 'Conectado'; badge.className = 'badge badge-success'; }
      if (icon)  icon.className = 'sap-icon sap-icon--connected';
      if (detail) detail.textContent = `Latencia: ${r.latency || '—'}ms | Última sync: ${r.lastSync ? Utils.formatDateTime(r.lastSync) : 'N/A'}`;
    } else {
      bar.style.background   = 'var(--sap-error-bg)';
      bar.style.borderColor  = 'var(--sap-error-border)';
      if (badge) { badge.textContent = 'Sin conexión'; badge.className = 'badge badge-error'; }
      if (icon)  icon.className = 'sap-icon sap-icon--disconnected';
      if (detail) detail.innerHTML = `<span style="color:var(--sap-error);font-weight:600">${r.error || 'No se puede conectar con SAP'}</span> — Última sync: ${r.lastSync ? Utils.formatDateTime(r.lastSync) : 'Sin registro'}`;
    }
  } catch(e) {
    if (badge) { badge.textContent = 'Error'; badge.className = 'badge badge-error'; }
    if (detail) detail.textContent = e.message;
  }
};

window.View_admin_testSAP = async function() {
  const btn = document.getElementById('sap-test-btn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="sap-icon sap-icon--synchronize"></span> Probando…'; }
  App.toast('info', 'Probando conexión con SAP…');
  try {
    const r = await API.SAP.status();
    if (r.connected) App.toast('success', `Conexión SAP OK — Latencia: ${r.latency || '—'}ms`);
    else             App.toast('error', `Sin conexión SAP: ${r.error || 'Servidor no disponible'}`);
  } catch(e) {
    App.toast('error', 'Error al probar: ' + e.message);
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = '<span class="sap-icon sap-icon--refresh"></span> Probar conexión'; }
  }
  View_admin_loadSAPStatus();
};

window.View_admin_selectConnType = function(type) {
  ['rfc','odata','idoc'].forEach(t => {
    const card  = document.getElementById(`conn-type-${t}`);
    const panel = document.getElementById(`panel-${t}`);
    const active = t === type;
    if (card) {
      card.style.borderColor = active ? 'var(--sap-blue)' : 'var(--sap-border-light)';
      card.style.background  = active ? 'var(--sap-blue-light)' : 'var(--sap-bg-2)';
    }
    if (panel) panel.classList.toggle('hidden', !active);
  });
};

window.View_admin_toggleAdvanced = function() {
  const panel = document.getElementById('adv-options');
  const icon  = document.getElementById('adv-toggle-icon');
  if (!panel) return;
  const hidden = panel.classList.toggle('hidden');
  if (icon) icon.className = `sap-icon ${hidden ? 'sap-icon--expand' : 'sap-icon--collapse'}`;
};

window.View_admin_saveSAP = function() {
  const host   = document.getElementById('sap-host')?.value;
  const sysnr  = document.getElementById('sap-sysnr')?.value;
  const client = document.getElementById('sap-client')?.value;
  const user   = document.getElementById('sap-user')?.value;
  const pass   = document.getElementById('sap-pass')?.value;
  if (!host || !sysnr || !client || !user) {
    App.toast('error', 'Complete todos los campos requeridos (*)'); return;
  }
  App.Dialog.show({
    title: 'Guardar configuración SAP',
    size: 'sm',
    body: `
      <div style="padding:var(--space-md) 0">
        <p>Se guardará la siguiente configuración:</p>
        <table style="width:100%;margin-top:var(--space-md);font-size:var(--font-sm)">
          <tr><td style="color:var(--sap-text-2);padding:4px 0">Host SAP:</td><td><strong>${host}</strong></td></tr>
          <tr><td style="color:var(--sap-text-2);padding:4px 0">System / Client:</td><td><strong>${sysnr} / ${client}</strong></td></tr>
          <tr><td style="color:var(--sap-text-2);padding:4px 0">Usuario RFC:</td><td><strong>${user}</strong></td></tr>
          <tr><td style="color:var(--sap-text-2);padding:4px 0">Contraseña:</td><td>${pass ? '••••••••' : '<span style="color:var(--sap-error)">No ingresada</span>'}</td></tr>
        </table>
        <div style="margin-top:var(--space-md);padding:var(--space-sm);background:var(--sap-warning-bg);
                    border-radius:var(--radius-sm);font-size:var(--font-xs);color:var(--sap-warning)">
          <span class="sap-icon sap-icon--alert"></span>
          El servicio de sync se reiniciará al guardar.
        </div>
      </div>`,
    actions: [
      { label: 'Guardar y aplicar', type: 'primary', action: () => {
          App.toast('success', 'Configuración SAP guardada — reiniciando servicio…');
          setTimeout(() => View_admin_loadSAPStatus(), 2000);
        }
      },
      { label: 'Cancelar', type: 'ghost' }
    ]
  });
};

window.View_admin_newUser = function() {
  App.Dialog.show({
    title: 'Nuevo Usuario',
    size: 'sm',
    body: `
      <div class="form-field mb-md">
        <label class="form-label required">Nombre completo</label>
        <input class="form-control w-full" placeholder="Nombre y apellido" />
      </div>
      <div class="form-field mb-md">
        <label class="form-label required">Email / Usuario</label>
        <input class="form-control w-full" type="email" placeholder="usuario@empresa.com" />
      </div>
      <div class="form-field mb-md">
        <label class="form-label required">Rol</label>
        <select class="form-control w-full">
          <option value="admin">Administrador</option>
          <option value="supervisor">Supervisor</option>
          <option value="operator" selected>Operador</option>
        </select>
      </div>
      <div class="form-field mb-md">
        <label class="form-label required">Almacén(es)</label>
        <select class="form-control w-full" multiple style="height:70px">
          <option>WH001 — Almacén Principal</option>
          <option>WH002 — Almacén Secundario</option>
        </select>
      </div>
      <div class="form-field">
        <label class="form-label required">Contraseña inicial</label>
        <input class="form-control w-full" type="password" placeholder="Mínimo 8 caracteres" />
      </div>`,
    actions: [
      { label: 'Crear usuario', type: 'primary', action: () => App.toast('success', 'Usuario creado correctamente') },
      { label: 'Cancelar', type: 'ghost' }
    ]
  });
};

window.View_admin_editUser = function(id) {
  const users = {
    1: { name:'Administrador',   email:'admin@jmholding.org',       role:'admin',      wh:'WH001, WH002' },
    2: { name:'Juan Pérez',      email:'jperez@empresa.com',    role:'supervisor', wh:'WH001'        },
    3: { name:'María Gómez',     email:'mgomez@empresa.com',    role:'operator',   wh:'WH001'        },
    4: { name:'Luis Rodríguez',  email:'lrodriguez@empresa.com',role:'operator',   wh:'WH002'        },
    5: { name:'Ana López',       email:'alopez@empresa.com',    role:'operator',   wh:'WH002'        },
  };
  const u = users[id];
  if (!u) return;
  App.Dialog.show({
    title: `Editar usuario — ${u.name}`,
    size: 'sm',
    body: `
      <div class="form-field mb-md">
        <label class="form-label required">Nombre completo</label>
        <input class="form-control w-full" value="${u.name}" />
      </div>
      <div class="form-field mb-md">
        <label class="form-label required">Email</label>
        <input class="form-control w-full" type="email" value="${u.email}" />
      </div>
      <div class="form-field mb-md">
        <label class="form-label">Rol</label>
        <select class="form-control w-full">
          <option ${u.role==='admin'?'selected':''}>Administrador</option>
          <option ${u.role==='supervisor'?'selected':''}>Supervisor</option>
          <option ${u.role==='operator'?'selected':''}>Operador</option>
        </select>
      </div>
      <div class="form-field mb-md">
        <label class="form-label">Almacén(es)</label>
        <input class="form-control w-full" value="${u.wh}" disabled />
      </div>
      <div class="form-field">
        <label class="form-label">Nueva contraseña (dejar vacío para no cambiar)</label>
        <input class="form-control w-full" type="password" placeholder="••••••••" />
      </div>`,
    actions: [
      { label: 'Guardar cambios', type: 'primary', action: () => App.toast('success', `Usuario ${u.name} actualizado`) },
      { label: id !== 1 ? 'Desactivar usuario' : 'No se puede desactivar', type: 'danger',
        action: () => { if(id!==1) App.toast('warning', `Usuario ${u.name} desactivado`); else App.toast('error','No se puede desactivar el administrador'); } },
      { label: 'Cancelar', type: 'ghost' }
    ]
  });
};
