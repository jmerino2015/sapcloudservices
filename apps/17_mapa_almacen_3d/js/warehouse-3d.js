/**
 * SAP WMS 3D Digital Twin - Three.js Warehouse 3D Engine
 * Renderiza el gemelo digital completo con estanterías industriales, pasillos A-J,
 * zona de stage (12m), puertas de recepción (R1-R3) y despacho (D1-D3),
 * nichos interactivos, raycasting, transiciones de cámara y semáforo de vencimiento.
 */

(function (window) {
  'use strict';

  // Configuración de dimensiones físicas de la nave y racks (en metros)
  const WAREHOUSE_CONFIG = {
    aisles: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
    colsPerAisle: 30, // 30 columnas por pasillo
    levels: 4,        // 4 niveles de altura
    aisleSpacing: 5.5, // Distancia entre pasillos (ancho de pasillo para montacargas)
    rackDepth: 1.2,    // Fondo de estantería
    bayWidth: 1.4,     // Ancho de bahía de nicho
    levelHeight: 1.7,  // Altura por nivel
    warehouseWidth: 65.4,
    warehouseLength: 43.0,
    warehouseHeight: 10.2,
    stageDepth: 12.0
  };

  class Warehouse3DViewer {
    constructor(containerElement, dataManager, onNicheSelectedCallback) {
      this.container = containerElement;
      this.dataManager = dataManager;
      this.onNicheSelected = onNicheSelectedCallback;

      this.scene = null;
      this.camera = null;
      this.renderer = null;
      this.controls = null;
      this.raycaster = new THREE.Raycaster();
      this.mouse = new THREE.Vector2(-999, -999);

      this.nicheMeshes = new Map(); // key: nicheId, value: THREE.Mesh
      this.aisleGroup = new THREE.Group();
      this.decorGroup = new THREE.Group();
      this.labelsGroup = new THREE.Group();
      this.interactiveMeshes = [];

      this.hoveredMesh = null;
      this.selectedMesh = null;
      this.selectionBox = null;
      this.tooltipElement = null;

      this.currentMode = 'general'; // 'general', 'planta', 'stage', 'pasillo'
      this.currentAisleIndex = 5;   // Pasillo F por defecto en modo pasillo
      this.activeFilters = {
        statusFilter: 'all', // 'all', 'alerts_only', 'vencido', 'critico', etc.
        aisleFilter: 'all',
        levelFilter: 'all',
        searchQuery: ''
      };

      this.cameraAnimation = {
        active: false,
        startTime: 0,
        duration: 1000,
        startPos: new THREE.Vector3(),
        targetPos: new THREE.Vector3(),
        startLookAt: new THREE.Vector3(),
        targetLookAt: new THREE.Vector3()
      };

      this.currentLookAt = new THREE.Vector3(0, 3, -5);
      this.isDestroyed = false;

      this.init();
    }

    init() {
      // 1. Escena
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0xf5f7fb); // Fiori Horizon Morning por defecto

      // 2. Cámara
      const aspect = this.container.clientWidth / this.container.clientHeight;
      this.camera = new THREE.PerspectiveCamera(45, aspect, 0.5, 300);
      this.camera.position.set(0, 32, 44);

      // 3. Renderer WebGL
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.container.appendChild(this.renderer.domElement);

      // 4. Controles Orbit
      if (window.THREE.OrbitControls) {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.08;
        this.controls.maxPolarAngle = Math.PI / 2 - 0.05; // No pasar por debajo del suelo
        this.controls.minDistance = 2;
        this.controls.maxDistance = 140;
        this.controls.target.copy(this.currentLookAt);
      }

      // 5. Iluminación
      this.setupLights();

      // 6. Suelo y nave de almacén
      this.buildWarehouseStructure();

      // 7. Estanterías, pasillos y nichos
      this.buildRacksAndPallets();

      // 8. Tooltip flotante y halo de selección
      this.setupTooltipAndSelectionBox();

      // 9. Event Listeners
      this.setupEvents();

      // 10. Loop de render
      this.animate();
    }

    setupLights() {
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
      this.scene.add(ambientLight);

      const mainLight = new THREE.DirectionalLight(0xffffff, 0.9);
      mainLight.position.set(20, 50, 25);
      mainLight.castShadow = true;
      mainLight.shadow.mapSize.width = 2048;
      mainLight.shadow.mapSize.height = 2048;
      mainLight.shadow.camera.near = 0.5;
      mainLight.shadow.camera.far = 150;
      const d = 40;
      mainLight.shadow.camera.left = -d;
      mainLight.shadow.camera.right = d;
      mainLight.shadow.camera.top = d;
      mainLight.shadow.camera.bottom = -d;
      this.scene.add(mainLight);

      const fillLight = new THREE.DirectionalLight(0xddeeff, 0.4);
      fillLight.position.set(-25, 30, -25);
      this.scene.add(fillLight);
    }

    buildWarehouseStructure() {
      const { warehouseWidth, warehouseLength, stageDepth } = WAREHOUSE_CONFIG;

      // Suelo principal del almacén con textura sutil de concreto pulido
      const floorGeo = new THREE.PlaneGeometry(warehouseWidth + 6, warehouseLength + 10);
      const floorMat = new THREE.MeshStandardMaterial({
        color: 0xe8ecf1,
        roughness: 0.8,
        metalness: 0.1
      });
      const floor = new THREE.Mesh(floorGeo, floorMat);
      floor.rotation.x = -Math.PI / 2;
      floor.position.set(0, -0.01, -3);
      floor.receiveShadow = true;
      this.scene.add(floor);

      // Rejilla de piso sutil
      const grid = new THREE.GridHelper(warehouseWidth + 4, 30, 0xccd5e0, 0xdfe5ec);
      grid.position.set(0, 0.005, -3);
      this.scene.add(grid);

      // ZONA DE STAGE (12 m) - Área amarilla / franjas de seguridad frontales
      const stageLength = warehouseWidth - 2;
      const stageGeo = new THREE.PlaneGeometry(stageLength, stageDepth);
      const stageMat = new THREE.MeshStandardMaterial({
        color: 0xfff3cd,
        roughness: 0.7,
        metalness: 0.05
      });
      const stageMesh = new THREE.Mesh(stageGeo, stageMat);
      stageMesh.rotation.x = -Math.PI / 2;
      stageMesh.position.set(0, 0.01, 14.5);
      stageMesh.receiveShadow = true;
      this.decorGroup.add(stageMesh);

      // Franja de contorno de seguridad amarilla/negra para el stage
      const borderGeo = new THREE.BoxGeometry(stageLength, 0.04, 0.3);
      const borderMat = new THREE.MeshBasicMaterial({ color: 0xffc107 });
      const borderFront = new THREE.Mesh(borderGeo, borderMat);
      borderFront.position.set(0, 0.02, 14.5 + stageDepth / 2);
      this.decorGroup.add(borderFront);

      const borderBack = new THREE.Mesh(borderGeo, borderMat);
      borderBack.position.set(0, 0.02, 14.5 - stageDepth / 2);
      this.decorGroup.add(borderBack);

      // Rótulo 3D en el piso: "ZONA DE STAGE - 12 m"
      const stageLabel = this.createFloorTextSprite('ZONA DE STAGE - 12 m', '#856404', 1.8);
      stageLabel.position.set(0, 0.03, 14.5);
      this.decorGroup.add(stageLabel);

      // Muelles y puertas: RECEPCIÓN (R1, R2, R3) a la izquierda y DESPACHO (D1, D2, D3) a la derecha
      this.buildDockDoors();

      this.scene.add(this.decorGroup);
    }

    buildDockDoors() {
      // Muelles de Recepción (Izquierda)
      const rDoors = [
        { id: 'R1', x: -22, label: 'R1' },
        { id: 'R2', x: -15, label: 'R2' },
        { id: 'R3', x: -8, label: 'R3' }
      ];

      // Cartel grande "RECEPCIÓN"
      const recepcionSign = this.createBillboardSign('RECEPCIÓN', '#1565C0', '#ffffff', 6.5, 1.8);
      recepcionSign.position.set(-15, 3.8, 20.8);
      this.decorGroup.add(recepcionSign);

      rDoors.forEach(d => {
        const door = this.createDockDoor(d.id, d.label, 0x1976D2);
        door.position.set(d.x, 0, 20.8);
        this.decorGroup.add(door);
      });

      // Muelles de Despacho (Derecha)
      const dDoors = [
        { id: 'D1', x: 8, label: 'D1' },
        { id: 'D2', x: 15, label: 'D2' },
        { id: 'D3', x: 22, label: 'D3' }
      ];

      // Cartel grande "DESPACHO"
      const despachoSign = this.createBillboardSign('DESPACHO', '#5E35B1', '#ffffff', 6.5, 1.8);
      despachoSign.position.set(15, 3.8, 20.8);
      this.decorGroup.add(despachoSign);

      dDoors.forEach(d => {
        const door = this.createDockDoor(d.id, d.label, 0x673AB7);
        door.position.set(d.x, 0, 20.8);
        this.decorGroup.add(door);
      });
    }

    createDockDoor(id, label, colorHex) {
      const group = new THREE.Group();

      // Marco de puerta industrial
      const frameGeo = new THREE.BoxGeometry(3.6, 3.2, 0.4);
      const frameMat = new THREE.MeshStandardMaterial({ color: 0x37474f, roughness: 0.6 });
      const frame = new THREE.Mesh(frameGeo, frameMat);
      frame.position.y = 1.6;
      group.add(frame);

      // Puerta seccional enrollable
      const shutterGeo = new THREE.BoxGeometry(3.2, 2.8, 0.1);
      const shutterMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.4 });
      const shutter = new THREE.Mesh(shutterGeo, shutterMat);
      shutter.position.set(0, 1.4, 0.16);
      group.add(shutter);

      // Badge con código R1/D1
      const badge = this.createBillboardSign(label, '#ffffff', colorHex === 0x1976D2 ? '#1565C0' : '#5E35B1', 1.6, 0.8);
      badge.position.set(0, 2.5, 0.3);
      group.add(badge);

      return group;
    }

    buildRacksAndPallets() {
      this.scene.remove(this.aisleGroup);
      this.scene.remove(this.labelsGroup);
      this.aisleGroup = new THREE.Group();
      this.labelsGroup = new THREE.Group();
      this.interactiveMeshes = [];
      this.nicheMeshes.clear();

      const { aisles, colsPerAisle, levels, aisleSpacing, bayWidth, levelHeight } = WAREHOUSE_CONFIG;
      const totalAisles = aisles.length;
      const startX = -((totalAisles - 1) * aisleSpacing) / 2;
      const startZ = 7; // Frontal de estanterías

      // Materiales estándar para estructuras de racks industriales
      const uprightMat = new THREE.MeshStandardMaterial({ color: 0x1565C0, roughness: 0.5 }); // Azul industrial
      const beamMat = new THREE.MeshStandardMaterial({ color: 0xE65100, roughness: 0.4 });    // Naranja seguridad
      const palletWoodMat = new THREE.MeshStandardMaterial({ color: 0xa17240, roughness: 0.9 }); // Madera paleta

      // Geometrías compartidas para máximo rendimiento WebGL
      const uprightGeo = new THREE.BoxGeometry(0.08, levels * levelHeight + 0.4, 1.0);
      const beamGeo = new THREE.BoxGeometry(bayWidth, 0.08, 0.08);
      const palletGeo = new THREE.BoxGeometry(bayWidth * 0.85, 0.12, 0.95);
      const boxGeo = new THREE.BoxGeometry(bayWidth * 0.82, levelHeight * 0.65, 0.9);

      for (let a = 0; a < totalAisles; a++) {
        const aisleLetter = aisles[a];
        const aisleX = startX + a * aisleSpacing;

        // 1. Letrero de cabecera de Pasillo (Identico al video: cartel negro con letras blancas "PASILLO X")
        const aisleSign = this.createAisleSign(`PASILLO ${aisleLetter}`);
        aisleSign.position.set(aisleX, 1.2, startZ + 1.8);
        this.labelsGroup.add(aisleSign);

        // Pasillo con estanterías a ambos lados (izquierda y derecha del pasillo)
        // Para simplificar y dar el aspecto exacto del video:
        // Las estanterías van paralelas al eje Z hacia atrás (-Z)
        const rackLeftX = aisleX - 1.2;
        const rackRightX = aisleX + 1.2;

        // Distribución de nichos en las columnas a lo largo del pasillo
        const colsToRender = Math.min(colsPerAisle, 26); // 26 columnas por pasillo tal como en el video
        for (let c = 1; c <= colsToRender; c++) {
          const colZ = startZ - (c - 1) * (bayWidth + 0.05);
          const colStr = String(c).padStart(2, '0');

          // Decidir si este nicho se coloca en rack izquierdo o derecho para alternar profundidad visual
          const posX = (c % 2 === 0) ? rackRightX : rackLeftX;

          // Postes verticales del rack
          if (c === 1 || c === colsToRender || c % 3 === 0) {
            const upright = new THREE.Mesh(uprightGeo, uprightMat);
            upright.position.set(posX, (levels * levelHeight) / 2, colZ);
            upright.castShadow = true;
            this.aisleGroup.add(upright);
          }

          for (let l = 1; l <= levels; l++) {
            const posY = (l - 1) * levelHeight + 0.15;
            const nicheId = `${aisleLetter}-${colStr}-${l}`;

            // Larguero / viga naranja horizontal de soporte
            const beamFront = new THREE.Mesh(beamGeo, beamMat);
            beamFront.position.set(posX, posY, colZ + 0.45);
            this.aisleGroup.add(beamFront);

            const beamBack = new THREE.Mesh(beamGeo, beamMat);
            beamBack.position.set(posX, posY, colZ - 0.45);
            this.aisleGroup.add(beamBack);

            // Obtener o inicializar datos del nicho
            let nicheData = this.dataManager.niches.get(nicheId);
            if (!nicheData) {
              nicheData = {
                id: nicheId,
                pasillo: aisleLetter,
                columna: c,
                columnaStr: colStr,
                nivel: l,
                capacidadPaletas: 2,
                items: []
              };
              nicheData.eval = this.dataManager.evaluateNicheStatus(nicheData);
              this.dataManager.niches.set(nicheId, nicheData);
            }

            // Crear malla del nicho / paleta
            const evalRes = nicheData.eval || this.dataManager.evaluateNicheStatus(nicheData);
            const nicheGroup = new THREE.Group();
            nicheGroup.position.set(posX, posY, colZ);

            if (evalRes.status !== 'vacio') {
              // Paleta de madera
              const pallet = new THREE.Mesh(palletGeo, palletWoodMat);
              pallet.position.y = 0.06;
              pallet.castShadow = true;
              nicheGroup.add(pallet);

              // Carga / Mercadería coloreada según semáforo de vencimiento
              const boxMat = new THREE.MeshStandardMaterial({
                color: evalRes.colorHex,
                roughness: 0.35,
                metalness: 0.1
              });
              const box = new THREE.Mesh(boxGeo, boxMat);
              box.position.y = 0.12 + (levelHeight * 0.65) / 2;
              box.castShadow = true;
              box.receiveShadow = true;
              box.userData = {
                nicheId: nicheId,
                nicheData: nicheData,
                originalColor: evalRes.colorHex,
                status: evalRes.status
              };

              nicheGroup.add(box);
              this.interactiveMeshes.push(box);
              this.nicheMeshes.set(nicheId, box);
            } else {
              // Nicho vacío: marco visual sutil disponible
              const emptyGeo = new THREE.BoxGeometry(bayWidth * 0.8, levelHeight * 0.7, 0.85);
              const emptyMat = new THREE.MeshBasicMaterial({
                color: 0x90a4ae,
                wireframe: true,
                transparent: true,
                opacity: 0.18
              });
              const emptyMesh = new THREE.Mesh(emptyGeo, emptyMat);
              emptyMesh.position.y = (levelHeight * 0.7) / 2;
              emptyMesh.userData = {
                nicheId: nicheId,
                nicheData: nicheData,
                originalColor: 0x90a4ae,
                status: 'vacio'
              };

              nicheGroup.add(emptyMesh);
              this.interactiveMeshes.push(emptyMesh);
              this.nicheMeshes.set(nicheId, emptyMesh);
            }

            this.aisleGroup.add(nicheGroup);
          }
        }
      }

      this.scene.add(this.aisleGroup);
      this.scene.add(this.labelsGroup);
    }

    createAisleSign(text) {
      // Cartel grande de entrada a pasillo estilo visual exacto del video
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 160;
      const ctx = canvas.getContext('2d');

      // Fondo oscuro con bordes redondeados
      ctx.fillStyle = '#1e242b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Borde suave
      ctx.strokeStyle = '#3a4756';
      ctx.lineWidth = 8;
      ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);

      // Texto grande centrado
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 56px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);

      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.LinearFilter;
      const mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
      const geo = new THREE.PlaneGeometry(3.2, 1.0);
      const mesh = new THREE.Mesh(geo, mat);
      return mesh;
    }

    createBillboardSign(text, bgColor, textColor, width, height) {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 140;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = textColor;
      ctx.font = 'bold 64px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);

      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.LinearFilter;
      const mat = new THREE.MeshBasicMaterial({ map: texture });
      const geo = new THREE.PlaneGeometry(width, height);
      return new THREE.Mesh(geo, mat);
    }

    createFloorTextSprite(text, color, size) {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = color;
      ctx.font = 'bold 54px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);

      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.LinearFilter;
      const mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
      const geo = new THREE.PlaneGeometry(size * 7, size);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = -Math.PI / 2;
      return mesh;
    }

    setupTooltipAndSelectionBox() {
      // Tooltip HTML flotante idéntico al del video
      this.tooltipElement = document.createElement('div');
      this.tooltipElement.className = 'wms-3d-tooltip';
      this.tooltipElement.style.display = 'none';
      this.container.appendChild(this.tooltipElement);

      // Marco 3D de selección para resaltar el nicho pulsado
      const boxGeo = new THREE.BoxGeometry(1.2, 1.2, 1.0);
      const edges = new THREE.EdgesGeometry(boxGeo);
      const lineMat = new THREE.LineBasicMaterial({ color: 0x0056b3, linewidth: 3 });
      this.selectionBox = new THREE.LineSegments(edges, lineMat);
      this.selectionBox.visible = false;
      this.scene.add(this.selectionBox);
    }

    setupEvents() {
      const dom = this.renderer.domElement;

      // Mouse Move para Raycasting Hover
      dom.addEventListener('mousemove', (e) => {
        const rect = dom.getBoundingClientRect();
        this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        // Posicionar tooltip en pantalla
        if (this.tooltipElement && this.tooltipElement.style.display !== 'none') {
          this.tooltipElement.style.left = `${e.clientX + 16}px`;
          this.tooltipElement.style.top = `${e.clientY + 16}px`;
        }
      });

      // Click para Selección de Nicho
      dom.addEventListener('click', (e) => {
        this.handleRaycastClick(e);
      });

      // Mouse Leave oculta tooltip
      dom.addEventListener('mouseleave', () => {
        this.mouse.x = -999;
        this.mouse.y = -999;
        if (this.tooltipElement) this.tooltipElement.style.display = 'none';
        if (this.hoveredMesh) {
          this.resetMeshHighlight(this.hoveredMesh);
          this.hoveredMesh = null;
        }
      });

      // Resize observer
      window.addEventListener('resize', () => {
        if (!this.container || this.isDestroyed) return;
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
      });
    }

    handleRaycastClick(e) {
      if (this.cameraAnimation.active) return;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const visibleMeshes = this.interactiveMeshes.filter(m => m.visible);
      const intersects = this.raycaster.intersectObjects(visibleMeshes, false);

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object;
        this.selectNiche(hitMesh.userData.nicheId);
      }
    }

    /**
     * Selecciona un nicho por ID, anima la cámara hacia él y dispara callback
     */
    selectNiche(nicheId) {
      const mesh = this.nicheMeshes.get(nicheId);
      if (!mesh) return;

      const nicheData = mesh.userData.nicheData;
      this.selectedMesh = mesh;

      // Posicionar caja de selección
      const worldPos = new THREE.Vector3();
      mesh.getWorldPosition(worldPos);
      this.selectionBox.position.copy(worldPos);
      this.selectionBox.visible = true;

      // Animar foco de cámara suavemente hacia el nicho
      const camTargetPos = worldPos.clone().add(new THREE.Vector3(2.5, 2.0, 3.5));
      this.transitionCamera(camTargetPos, worldPos, 900);

      // Disparar evento a la UI Fiori
      if (this.onNicheSelected) {
        this.onNicheSelected(nicheData);
      }
    }

    /**
     * Cambia la vista de cámara según los botones del encabezado
     * Modos: 'general', 'planta', 'stage', 'pasillo'
     */
    setCameraView(mode, aisleLetter = 'F') {
      this.currentMode = mode;
      const { aisleSpacing } = WAREHOUSE_CONFIG;

      if (mode === 'general') {
        // Vista isométrica/perspectiva general
        this.transitionCamera(
          new THREE.Vector3(0, 32, 44),
          new THREE.Vector3(0, 4, -4),
          1000
        );
      } else if (mode === 'planta') {
        // Vista cenital 2D/3D desde arriba
        this.transitionCamera(
          new THREE.Vector3(0, 68, -4),
          new THREE.Vector3(0, 0, -4.1),
          1100
        );
      } else if (mode === 'stage') {
        // Vista enfocada en la zona de Stage y puertas R1-R3, D1-D3
        this.transitionCamera(
          new THREE.Vector3(0, 14, 29),
          new THREE.Vector3(0, 2, 13),
          1000
        );
      } else if (mode === 'pasillo') {
        // Modo primera persona entrando al pasillo seleccionado
        const aisleIdx = WAREHOUSE_CONFIG.aisles.indexOf(aisleLetter.toUpperCase());
        const targetIdx = aisleIdx !== -1 ? aisleIdx : 5;
        this.currentAisleIndex = targetIdx;
        const targetAisle = WAREHOUSE_CONFIG.aisles[targetIdx];

        const startX = -((WAREHOUSE_CONFIG.aisles.length - 1) * aisleSpacing) / 2;
        const aisleX = startX + targetIdx * aisleSpacing;

        this.transitionCamera(
          new THREE.Vector3(aisleX, 1.8, 11),
          new THREE.Vector3(aisleX, 2.0, -15),
          1200
        );
      }
    }

    /**
     * Navegación al siguiente / anterior pasillo en modo 'pasillo'
     */
    navigateAisle(direction) {
      if (this.currentMode !== 'pasillo') {
        this.setCameraView('pasillo');
        return;
      }

      const total = WAREHOUSE_CONFIG.aisles.length;
      if (direction === 'next') {
        this.currentAisleIndex = (this.currentAisleIndex + 1) % total;
      } else {
        this.currentAisleIndex = (this.currentAisleIndex - 1 + total) % total;
      }

      const aisle = WAREHOUSE_CONFIG.aisles[this.currentAisleIndex];
      this.setCameraView('pasillo', aisle);
      return aisle;
    }

    transitionCamera(targetPos, targetLookAt, duration = 1000) {
      this.cameraAnimation.active = true;
      this.cameraAnimation.startTime = performance.now();
      this.cameraAnimation.duration = duration;
      this.cameraAnimation.startPos.copy(this.camera.position);
      this.cameraAnimation.targetPos.copy(targetPos);
      this.cameraAnimation.startLookAt.copy(this.currentLookAt);
      this.cameraAnimation.targetLookAt.copy(targetLookAt);

      if (this.controls) this.controls.enabled = false;
    }

    updateCameraAnimation() {
      if (!this.cameraAnimation.active) return;

      const now = performance.now();
      const elapsed = now - this.cameraAnimation.startTime;
      const progress = Math.min(elapsed / this.cameraAnimation.duration, 1.0);

      // Curva easeInOutCubic para movimiento ultra suave
      const ease = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      this.camera.position.lerpVectors(
        this.cameraAnimation.startPos,
        this.cameraAnimation.targetPos,
        ease
      );

      this.currentLookAt.lerpVectors(
        this.cameraAnimation.startLookAt,
        this.cameraAnimation.targetLookAt,
        ease
      );

      this.camera.lookAt(this.currentLookAt);

      if (progress >= 1.0) {
        this.cameraAnimation.active = false;
        if (this.controls) {
          this.controls.target.copy(this.currentLookAt);
          this.controls.enabled = true;
        }
      }
    }

    /**
     * Aplica filtros visuales (por estado de vencimiento, pasillo, nivel o búsqueda)
     */
    applyFilters(filters) {
      this.activeFilters = { ...this.activeFilters, ...filters };
      const { statusFilter, aisleFilter, levelFilter, searchQuery } = this.activeFilters;

      const q = (searchQuery || '').trim().toUpperCase();

      for (const mesh of this.interactiveMeshes) {
        const { nicheId, nicheData, status, originalColor } = mesh.userData;
        const [aisle, col, level] = nicheId.split('-');

        let matches = true;

        // 1. Filtro de Estado
        if (statusFilter === 'alerts_only') {
          matches = (status === 'vencido' || status === 'critico' || status === 'por_vencer');
        } else if (statusFilter !== 'all') {
          matches = (status === statusFilter);
        }

        // 2. Filtro de Pasillo
        if (matches && aisleFilter !== 'all') {
          matches = (aisle === aisleFilter);
        }

        // 3. Filtro de Nivel
        if (matches && levelFilter !== 'all') {
          matches = (level === levelFilter);
        }

        // 4. Búsqueda por texto
        if (matches && q) {
          let textMatch = nicheId.toUpperCase().includes(q);
          if (!textMatch && nicheData && nicheData.items) {
            textMatch = nicheData.items.some(it =>
              (it.sku && it.sku.toUpperCase().includes(q)) ||
              (it.nombre && it.nombre.toUpperCase().includes(q)) ||
              (it.lote && it.lote.toUpperCase().includes(q))
            );
          }
          matches = textMatch;
        }

        // Aplicar atenuación / transparencia a los nichos que no coinciden
        if (matches) {
          mesh.visible = true;
          if (mesh.material.transparent !== undefined && status !== 'vacio') {
            mesh.material.transparent = false;
            mesh.material.opacity = 1.0;
          }
          if (q) {
            // Si coincide con búsqueda, resaltar con brillo dorado
            mesh.material.color.setHex(0xffd700);
          } else {
            mesh.material.color.setHex(originalColor);
          }
        } else {
          if (q || statusFilter !== 'all' || aisleFilter !== 'all' || levelFilter !== 'all') {
            mesh.visible = true;
            mesh.material.transparent = true;
            mesh.material.opacity = 0.08; // Atenuado dramático
          } else {
            mesh.visible = true;
            mesh.material.transparent = (status === 'vacio');
            mesh.material.opacity = (status === 'vacio') ? 0.18 : 1.0;
            mesh.material.color.setHex(originalColor);
          }
        }
      }
    }

    /**
     * Actualiza los colores de los nichos cuando se recalculan los días de alerta
     */
    updateNicheColors() {
      for (const mesh of this.interactiveMeshes) {
        const { nicheId } = mesh.userData;
        const nicheData = this.dataManager.niches.get(nicheId);
        if (nicheData) {
          const evalRes = nicheData.eval || this.dataManager.evaluateNicheStatus(nicheData);
          mesh.userData.nicheData = nicheData;
          mesh.userData.status = evalRes.status;
          mesh.userData.originalColor = evalRes.colorHex;

          if (mesh.material) {
            mesh.material.color.setHex(evalRes.colorHex);
          }
        }
      }
      this.applyFilters({});
    }

    highlightMesh(mesh) {
      if (mesh.material && mesh.material.emissive) {
        mesh.material.emissive.setHex(0x333333);
      }
    }

    resetMeshHighlight(mesh) {
      if (mesh.material && mesh.material.emissive) {
        mesh.material.emissive.setHex(0x000000);
      }
    }

    updateRaycastHover() {
      if (this.cameraAnimation.active) return;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const visibleMeshes = this.interactiveMeshes.filter(m => m.visible && m.material.opacity > 0.2);
      const intersects = this.raycaster.intersectObjects(visibleMeshes, false);

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object;

        if (this.hoveredMesh !== hitMesh) {
          if (this.hoveredMesh) this.resetMeshHighlight(this.hoveredMesh);
          this.hoveredMesh = hitMesh;
          this.highlightMesh(hitMesh);
        }

        // Mostrar y llenar tooltip con el formato exacto del video:
        // "C-01-2 · Harina rubia 10 kg · Vigente"
        const { nicheId, nicheData, status } = hitMesh.userData;
        if (this.tooltipElement && nicheData) {
          const firstItem = (nicheData.items && nicheData.items.length > 0) ? nicheData.items[0] : null;
          const prodTitle = firstItem ? `${firstItem.nombre}` : 'Sin material';
          const evalRes = nicheData.eval || { statusLabel: 'Vacío' };

          this.tooltipElement.innerHTML = `
            <span class="tooltip-id">${nicheId}</span>
            <span class="tooltip-sep">·</span>
            <span class="tooltip-prod">${prodTitle}</span>
            <span class="tooltip-sep">·</span>
            <span class="tooltip-status status-${status}">${evalRes.statusLabel}</span>
          `;
          this.tooltipElement.style.display = 'block';
        }
      } else {
        if (this.hoveredMesh) {
          this.resetMeshHighlight(this.hoveredMesh);
          this.hoveredMesh = null;
        }
        if (this.tooltipElement) {
          this.tooltipElement.style.display = 'none';
        }
      }
    }

    /**
     * Cambia el tema de fondo 3D (Morning Horizon / Evening Horizon)
     */
    applyTheme(theme) {
      const isDark = (theme === 'dark' || theme === 'evening' || theme === 'sap_horizon_dark');
      if (isDark) {
        this.scene.background.setHex(0x182029); // Fiori Evening Horizon
      } else {
        this.scene.background.setHex(0xf5f7fb); // Fiori Morning Horizon
      }
    }

    animate() {
      if (this.isDestroyed) return;

      requestAnimationFrame(() => this.animate());

      // Actualizar animación suave de cámara
      this.updateCameraAnimation();

      // Actualizar orbit controls
      if (this.controls && this.controls.enabled) {
        this.controls.update();
      }

      // Actualizar raycasting hover
      this.updateRaycastHover();

      // Render
      this.renderer.render(this.scene, this.camera);
    }

    destroy() {
      this.isDestroyed = true;
      if (this.renderer && this.renderer.domElement) {
        this.renderer.domElement.remove();
      }
    }
  }

  window.Warehouse3DViewer = Warehouse3DViewer;
})(window);
