// ==========================================================================
// Lúmina Real Estate - Enterprise Administrator Suite & Link Routing Logic
// ==========================================================================

class RealEstateApp {
  constructor() {
    this.data = this.loadData();
    this.currentMode = 'admin'; // 'admin' | 'public_client' | 'public_owner'
    this.adminTab = 'dashboard'; // 'dashboard' | 'links' | 'properties' | 'leads' | 'finances'
    this.clientGreeting = '';
    this.ownerGreeting = '';
    this.propertyTarget = null;
    this.selectedProperty = null;

    this.filters = {
      search: '',
      category: 'all',
      operation: 'all'
    };

    this.init();
  }

  loadData() {
    const saved = localStorage.getItem('lumina_re_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error al cargar localStorage:", e);
      }
    }
    return JSON.parse(JSON.stringify(INITIAL_DATA));
  }

  saveData() {
    localStorage.setItem('lumina_re_data', JSON.stringify(this.data));
  }

  init() {
    this.resolveRouting();
    this.render();
    this.bindEvents();
  }

  resolveRouting() {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    const cliente = params.get('cliente');
    const propietario = params.get('propietario');
    const prop = params.get('prop');

    if (view === 'propietario' || propietario) {
      this.currentMode = 'public_owner';
      this.ownerGreeting = propietario ? decodeURIComponent(propietario) : '';
    } else if (view === 'catalogo' || view === 'cliente' || cliente || prop) {
      this.currentMode = 'public_client';
      this.clientGreeting = cliente ? decodeURIComponent(cliente) : '';
      this.propertyTarget = prop ? decodeURIComponent(prop) : null;
    } else {
      this.currentMode = 'admin';
    }
  }

  render() {
    const container = document.getElementById('appContainer');
    if (!container) return;

    if (this.currentMode === 'admin') {
      this.renderAdminSuite(container);
    } else if (this.currentMode === 'public_owner') {
      this.renderPublicOwnerPortal(container);
    } else if (this.currentMode === 'public_client') {
      this.renderPublicClientPortal(container);
    }
  }

  // ==========================================================================
  // MODO 1: SUITE DE ADMINISTRACIÓN EXCLUSIVA (CRM / BACKOFFICE)
  // ==========================================================================
  renderAdminSuite(container) {
    const totalInventoryValue = this.data.properties.reduce((sum, p) => sum + (p.operation === 'Venta' ? p.price : 0), 0);
    const availableProps = this.data.properties.filter(p => p.status === 'Disponible').length;

    container.innerHTML = `
      <div class="admin-layout">
        <!-- Sidebar Corporativa -->
        <aside class="admin-sidebar">
          <div class="sidebar-header">
            <div class="admin-badge-icon">L</div>
            <div class="sidebar-brand">
              <h2>LÚMINA</h2>
              <span>Panel Administrativo</span>
            </div>
          </div>

          <div class="sidebar-menu">
            <div class="menu-label">Gestión Principal</div>
            <button class="nav-item ${this.adminTab === 'dashboard' ? 'active' : ''}" onclick="app.setAdminTab('dashboard')">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
              <span>Dashboard & KPIs</span>
            </button>

            <button class="nav-item ${this.adminTab === 'links' ? 'active' : ''}" onclick="app.setAdminTab('links')">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
              <span>Generador de Enlaces</span>
            </button>

            <button class="nav-item ${this.adminTab === 'properties' ? 'active' : ''}" onclick="app.setAdminTab('properties')">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
              <span>Inventario Inmuebles (${this.data.properties.length})</span>
            </button>

            <button class="nav-item ${this.adminTab === 'leads' ? 'active' : ''}" onclick="app.setAdminTab('leads')">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
              <span>Prospectos y Leads (${this.data.leads.length})</span>
            </button>

            <div class="menu-label">Enlaces Rápidos al Exterior</div>
            <button class="nav-item" onclick="app.openExternalPreview('cliente')">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
              <span>Ver Catálogo Clientes</span>
            </button>

            <button class="nav-item" onclick="app.openExternalPreview('propietario')">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
              <span>Ver Portal Propietarios</span>
            </button>
          </div>

          <div class="sidebar-footer">
            <img src="${this.data.agents[0].photo}" class="admin-avatar" alt="Admin">
            <div class="admin-info">
              <strong>${this.data.agents[0].name}</strong>
              <span>Administrador General</span>
            </div>
          </div>
        </aside>

        <!-- Contenido Principal -->
        <main class="admin-main">
          <header class="admin-topbar">
            <div class="topbar-title">
              <h1>${this.getAdminTabTitle()}</h1>
              <p>${this.getAdminTabSubtitle()}</p>
            </div>
            <div style="display:flex; gap:12px;">
              <button class="btn btn-outline" onclick="app.setAdminTab('links')">
                🔗 Generar Enlace WhatsApp
              </button>
              <button class="btn btn-gold" onclick="app.openNewPropertyModal()">
                + Publicar Inmueble
              </button>
            </div>
          </header>

          <div class="admin-container" id="adminContentArea">
            <!-- Renderizado según Tab -->
          </div>
        </main>
      </div>
    `;

    this.renderAdminTabContent();
  }

  getAdminTabTitle() {
    switch (this.adminTab) {
      case 'dashboard': return 'Dashboard de Control Operativo';
      case 'links': return 'Generador de Enlaces para WhatsApp';
      case 'properties': return 'Gestión de Inventario de Propiedades';
      case 'leads': return 'Directorio de Prospectos y Clientes';
      default: return 'Panel de Administración';
    }
  }

  getAdminTabSubtitle() {
    switch (this.adminTab) {
      case 'dashboard': return 'Métricas en tiempo real, cartera activa y rendimiento comercial';
      case 'links': return 'Cree URLs dinámicas y mensajes de WhatsApp profesionales para propietarios y compradores';
      case 'properties': return 'Control de disponibilidad, precios, descripciones y fichas técnicas';
      case 'leads': return 'Seguimiento de compradores interesados y propietarios en consignación';
      default: return '';
    }
  }

  setAdminTab(tabName) {
    this.adminTab = tabName;
    this.renderAdminSuite(document.getElementById('appContainer'));
  }

  renderAdminTabContent() {
    const area = document.getElementById('adminContentArea');
    if (!area) return;

    if (this.adminTab === 'dashboard') {
      this.renderAdminDashboard(area);
    } else if (this.adminTab === 'links') {
      this.renderAdminLinks(area);
    } else if (this.adminTab === 'properties') {
      this.renderAdminProperties(area);
    } else if (this.adminTab === 'leads') {
      this.renderAdminLeads(area);
    }
  }

  // Tab: Dashboard
  renderAdminDashboard(container) {
    const totalVenta = this.data.properties.filter(p => p.operation === 'Venta').reduce((acc, p) => acc + p.price, 0);
    const disponibles = this.data.properties.filter(p => p.status === 'Disponible').length;
    const reservadas = this.data.properties.filter(p => p.status === 'Reservada').length;

    container.innerHTML = `
      <!-- KPIs -->
      <div class="metrics-row">
        <div class="metric-card">
          <div class="metric-icon-box bg-gold">
            <svg width="26" height="26" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/></svg>
          </div>
          <div>
            <div class="metric-value">$${(totalVenta / 1000000).toFixed(2)}M USD</div>
            <div class="metric-title">Valor Total de Inventario</div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon-box bg-navy">
            <svg width="26" height="26" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/></svg>
          </div>
          <div>
            <div class="metric-value">${disponibles} Inmuebles</div>
            <div class="metric-title">Propiedades Disponibles</div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon-box bg-emerald">
            <svg width="26" height="26" fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg>
          </div>
          <div>
            <div class="metric-value">${this.data.leads.length} Leads</div>
            <div class="metric-title">Prospectos en Seguimiento</div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon-box bg-blue">
            <svg width="26" height="26" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/></svg>
          </div>
          <div>
            <div class="metric-value">${reservadas} Proceso</div>
            <div class="metric-title">Operaciones en Cierre</div>
          </div>
        </div>
      </div>

      <!-- Acceso Rápido al Generador -->
      <div style="background: linear-gradient(135deg, #0F172A, #1E293B); border-radius: var(--radius-lg); padding: 2rem; color: white; margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1.5rem;">
        <div style="max-width: 650px;">
          <span class="tag-badge" style="background: rgba(200, 157, 53, 0.25);">🔗 Conexión Externa con Clientes y Propietarios</span>
          <h3 style="font-size: 1.5rem; color: white; margin: 0.5rem 0;">Genere Enlaces Exclusivos para WhatsApp</h3>
          <p style="color: #94A3B8; font-size: 0.92rem;">
            Envíe a los propietarios una presentación institucional para captar su inmueble, o comparta a los clientes el catálogo interactivo con fichas de propiedades de lujo.
          </p>
        </div>
        <button class="btn btn-gold" style="padding: 0.9rem 1.8rem; font-size: 1rem;" onclick="app.setAdminTab('links')">
          Abrir Generador de Enlaces →
        </button>
      </div>

      <!-- Tabla Resumen de Propiedades Recientes -->
      <div class="table-card">
        <div class="table-header">
          <h3>Propiedades Recientes en Portafolio</h3>
          <button class="btn btn-outline" style="font-size: 0.82rem; padding: 0.4rem 0.8rem;" onclick="app.setAdminTab('properties')">Ver Inventario Completo</button>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Inmueble</th>
              <th>Operación</th>
              <th>Precio</th>
              <th>Estado</th>
              <th>Acción Rápida</th>
            </tr>
          </thead>
          <tbody>
            ${this.data.properties.slice(0, 4).map(p => `
              <tr>
                <td><strong>${p.id}</strong></td>
                <td>
                  <div style="font-weight: 700; color: var(--navy-blue);">${p.title}</div>
                  <div style="font-size: 0.8rem; color: var(--text-muted);">${p.location}</div>
                </td>
                <td><span style="font-size:0.8rem; font-weight:700; color:var(--accent-gold);">${p.operation}</span></td>
                <td><strong>$${p.price.toLocaleString()} ${p.currency}</strong></td>
                <td>
                  <span class="badge-status ${p.status === 'Disponible' ? 'status-disponible' : (p.status === 'Reservada' ? 'status-reservada' : 'status-vendida')}">
                    ${p.status}
                  </span>
                </td>
                <td>
                  <button class="btn btn-outline" style="padding: 0.3rem 0.6rem; font-size: 0.78rem;" onclick="app.generateClientLinkForProp('${p.id}')">
                    🔗 Link WhatsApp
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // Tab: Generador de Enlaces Duales
  renderAdminLinks(container) {
    container.innerHTML = `
      <div class="links-section">
        <!-- 1. Enlace para Propietarios -->
        <div class="link-card owner-type">
          <div class="link-card-header">
            <div class="badge-number" style="background: var(--accent-gold); color: #080D1A;">1</div>
            <div>
              <h3 style="font-size: 1.3rem; color: var(--navy-blue);">Enlace para Propietario (Captación)</h3>
              <p style="font-size: 0.85rem; color: var(--text-muted);">Para captar y convencer al dueño del inmueble</p>
            </div>
          </div>

          <p style="font-size: 0.88rem; color: #475569; margin-bottom: 1.2rem; line-height: 1.5;">
            Este enlace muestra la propuesta de valor: <strong>Quiénes somos</strong>, los <strong>4 pilares del servicio</strong>, métricas de éxito y el <strong>formulario para consignar y valuar su propiedad</strong>.
          </p>

          <div class="filter-group" style="margin-bottom: 0.8rem;">
            <label>Nombre del Propietario (Personalizado):</label>
            <input type="text" id="adminOwnerName" class="form-control" placeholder="Ej. Lic. Fernando Morales" oninput="app.refreshGeneratedLinks()">
          </div>

          <div class="link-url-box" id="adminOwnerUrlBox">
            Generando enlace...
          </div>

          <div style="display: flex; gap: 10px; margin-top: auto;">
            <button class="btn btn-outline" style="flex: 1;" onclick="app.copyFromId('adminOwnerUrlBox')">
              📋 Copiar Enlace
            </button>
            <button class="btn btn-whatsapp" style="flex: 1;" onclick="app.dispatchOwnerWhatsApp()">
              📱 Enviar por WhatsApp
            </button>
          </div>
        </div>

        <!-- 2. Enlace para Clientes Compradores -->
        <div class="link-card client-type">
          <div class="link-card-header">
            <div class="badge-number" style="background: var(--navy-blue);">2</div>
            <div>
              <h3 style="font-size: 1.3rem; color: var(--navy-blue);">Enlace para Cliente (Catálogo / Ficha)</h3>
              <p style="font-size: 0.85rem; color: var(--text-muted);">Para que el comprador vea y seleccione propiedades</p>
            </div>
          </div>

          <p style="font-size: 0.88rem; color: #475569; margin-bottom: 1.2rem; line-height: 1.5;">
            Este enlace abre el <strong>catálogo interactivo de propiedades</strong> (o una ficha específica) con galería de fotos, amenidades, calculadora de financiamiento y botón para solicitar visita.
          </p>

          <div class="filter-group" style="margin-bottom: 0.8rem;">
            <label>Nombre del Cliente (Personalizado):</label>
            <input type="text" id="adminClientName" class="form-control" placeholder="Ej. Dra. Sofía Benítez" oninput="app.refreshGeneratedLinks()">
          </div>

          <div class="filter-group" style="margin-bottom: 0.8rem;">
            <label>Propiedad Específica a Compartir:</label>
            <select id="adminClientPropSelect" class="form-control" onchange="app.refreshGeneratedLinks()">
              <option value="">-- Todo el Catálogo General --</option>
              ${this.data.properties.map(p => `
                <option value="${p.id}">${p.id} - ${p.title} ($${p.price.toLocaleString()} ${p.currency})</option>
              `).join('')}
            </select>
          </div>

          <div class="link-url-box" id="adminClientUrlBox">
            Generando enlace...
          </div>

          <div style="display: flex; gap: 10px; margin-top: auto;">
            <button class="btn btn-outline" style="flex: 1;" onclick="app.copyFromId('adminClientUrlBox')">
              📋 Copiar Enlace
            </button>
            <button class="btn btn-whatsapp" style="flex: 1;" onclick="app.dispatchClientWhatsApp()">
              📱 Enviar por WhatsApp
            </button>
          </div>
        </div>
      </div>
    `;

    this.refreshGeneratedLinks();
  }

  refreshGeneratedLinks() {
    const ownerName = document.getElementById('adminOwnerName')?.value.trim();
    const clientName = document.getElementById('adminClientName')?.value.trim();
    const clientProp = document.getElementById('adminClientPropSelect')?.value;

    const base = window.location.origin + window.location.pathname;

    // Propietario Link
    let ownerUrl = `${base}?view=propietario`;
    if (ownerName) ownerUrl += `&propietario=${encodeURIComponent(ownerName)}`;
    const ownerBox = document.getElementById('adminOwnerUrlBox');
    if (ownerBox) ownerBox.textContent = ownerUrl;

    // Cliente Link
    let clientUrl = `${base}?view=catalogo`;
    if (clientName) clientUrl += `&cliente=${encodeURIComponent(clientName)}`;
    if (clientProp) clientUrl += `&prop=${encodeURIComponent(clientProp)}`;
    const clientBox = document.getElementById('adminClientUrlBox');
    if (clientBox) clientBox.textContent = clientUrl;
  }

  dispatchOwnerWhatsApp() {
    const ownerName = document.getElementById('adminOwnerName')?.value.trim() || 'Estimado/a Propietario/a';
    const link = document.getElementById('adminOwnerUrlBox')?.textContent;

    const msg = `Hola ${ownerName}, un gusto saludarle de parte de ${this.data.company.name}. Para la comercialización segura y al mejor valor de su propiedad, le comparto nuestra propuesta de servicios, casos de éxito y proceso de valuación:\n\n👉 ${link}\n\nQuedo a su entera disposición.`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  }

  dispatchClientWhatsApp() {
    const clientName = document.getElementById('adminClientName')?.value.trim() || 'Estimado/a Cliente';
    const clientProp = document.getElementById('adminClientPropSelect')?.value;
    const link = document.getElementById('adminClientUrlBox')?.textContent;

    let msg = `Hola ${clientName}, un gusto saludarle de parte de ${this.data.company.name}. Le comparto nuestro catálogo exclusivo de propiedades seleccionadas para que pueda explorar sus opciones favoritas y agendar visitas:\n\n👉 ${link}\n\nCon gusto le asisto con cualquier duda.`;

    if (clientProp) {
      const p = this.data.properties.find(item => item.id === clientProp);
      msg = `Hola ${clientName}, le comparto la ficha completa, galería fotográfica y detalles de la propiedad *${p.title}* (${p.id}):\n\n👉 ${link}\n\nQuedo a la orden para coordinar su recorrido presencial.`;
    }

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  }

  generateClientLinkForProp(propId) {
    this.setAdminTab('links');
    setTimeout(() => {
      const select = document.getElementById('adminClientPropSelect');
      if (select) {
        select.value = propId;
        this.refreshGeneratedLinks();
      }
    }, 100);
  }

  // Tab: Inventario de Propiedades
  renderAdminProperties(container) {
    container.innerHTML = `
      <div class="table-card">
        <div class="table-header">
          <div>
            <h3>Inventario Total (${this.data.properties.length} Inmuebles)</h3>
          </div>
          <button class="btn btn-gold" onclick="app.openNewPropertyModal()">+ Nueva Propiedad</button>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Inmueble</th>
              <th>Tipo</th>
              <th>Operación</th>
              <th>Precio</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${this.data.properties.map(p => `
              <tr>
                <td><strong>${p.id}</strong></td>
                <td>
                  <div style="font-weight: 700; color: var(--navy-blue);">${p.title}</div>
                  <div style="font-size: 0.8rem; color: var(--text-muted);">${p.location} • ${p.area} m²</div>
                </td>
                <td>${p.category}</td>
                <td><strong>${p.operation}</strong></td>
                <td><strong>$${p.price.toLocaleString()} ${p.currency}</strong></td>
                <td>
                  <select class="form-control" style="padding: 0.35rem 0.6rem; font-size: 0.85rem;" onchange="app.changePropertyStatus('${p.id}', this.value)">
                    <option value="Disponible" ${p.status === 'Disponible' ? 'selected' : ''}>Disponible</option>
                    <option value="Reservada" ${p.status === 'Reservada' ? 'selected' : ''}>Reservada</option>
                    <option value="Vendida" ${p.status === 'Vendida' ? 'selected' : ''}>Vendida</option>
                  </select>
                </td>
                <td>
                  <div style="display:flex; gap:6px;">
                    <button class="btn btn-outline" style="padding:0.3rem 0.6rem; font-size:0.8rem;" onclick="app.openPropertyModal('${p.id}')">Ver</button>
                    <button class="btn btn-outline" style="padding:0.3rem 0.6rem; font-size:0.8rem;" onclick="app.generateClientLinkForProp('${p.id}')">Link</button>
                    <button class="btn btn-outline" style="padding:0.3rem 0.6rem; font-size:0.8rem; color:var(--danger);" onclick="app.deleteProperty('${p.id}')">✕</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // Tab: Leads y Prospectos
  renderAdminLeads(container) {
    container.innerHTML = `
      <div class="table-card">
        <div class="table-header">
          <div>
            <h3>Pipeline de Prospectos (${this.data.leads.length} Leads)</h3>
          </div>
          <button class="btn btn-gold" onclick="app.openNewLeadModal()">+ Registrar Prospecto</button>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Contacto</th>
              <th>Tipo</th>
              <th>Interés / Inmueble</th>
              <th>Presupuesto / Notas</th>
              <th>Estado</th>
              <th>Acción WhatsApp</th>
            </tr>
          </thead>
          <tbody>
            ${this.data.leads.map(lead => `
              <tr>
                <td><strong>${lead.name}</strong></td>
                <td>
                  <div>${lead.phone}</div>
                  <div style="font-size: 0.8rem; color: var(--text-muted);">${lead.email || '-'}</div>
                </td>
                <td><span class="tag-badge" style="background:#E2E8F0; color:#0F172A; font-size:0.75rem; padding:0.2rem 0.6rem;">${lead.type}</span></td>
                <td><strong>${lead.propertyInterest}</strong></td>
                <td>${lead.budget || '-'}</td>
                <td><span class="badge-status status-disponible">${lead.status}</span></td>
                <td>
                  <button class="btn btn-whatsapp" style="padding:0.35rem 0.75rem; font-size:0.8rem;" onclick="window.open('https://api.whatsapp.com/send?phone=${lead.phone.replace(/[^0-9]/g, '')}', '_blank')">
                    📱 Contactar
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // ==========================================================================
  // MODO 2: PORTAL PÚBLICO PARA CLIENTES (Generado por Link de WhatsApp)
  // ==========================================================================
  renderPublicClientPortal(container) {
    const greeting = this.clientGreeting 
      ? `<div class="tag-badge">👋 Selección Exclusiva para ${this.clientGreeting}</div>` 
      : `<div class="tag-badge">Colección de Inmuebles Verificados 2026</div>`;

    container.innerHTML = `
      <div class="public-portal">
        <header class="public-header">
          <div style="display:flex; align-items:center; gap:16px;">
            <button class="btn btn-outline" style="padding:0.45rem 0.9rem; font-size:0.85rem;" onclick="app.navigateBack()">
              ← Volver
            </button>
            <div style="display:flex; align-items:center; gap:10px; cursor:pointer;" onclick="app.navigateHome()">
              <div class="admin-badge-icon" style="width:36px; height:36px; font-size:1.1rem;">L</div>
              <div>
                <h2 style="font-size:1.2rem; color:var(--navy-blue); line-height:1;">LÚMINA</h2>
                <span style="font-size:0.7rem; color:var(--accent-gold); text-transform:uppercase; letter-spacing:0.1em; font-weight:700;">Real Estate</span>
              </div>
            </div>
          </div>

          <div style="display:flex; align-items:center; gap:12px;">
            <button class="btn btn-whatsapp" onclick="app.contactWhatsAppGeneral('Hola, estoy revisando el catálogo de propiedades y me gustaría recibir asesoría personalizada.')">
              📱 Asesor en Línea
            </button>
          </div>
        </header>

        <section class="hero-public">
          <div class="hero-public-content">
            ${greeting}
            <h2>Residencias & Inmuebles de Alto Valor</h2>
            <p>Explore nuestro inventario selecto de propiedades con seguridad jurídica, arquitectura de vanguardia y plusvalía garantizada.</p>
          </div>
        </section>

        <!-- Filtros Rápidos -->
        <div style="max-width:1300px; margin:-2rem auto 2.5rem; padding:0 1.5rem; position:relative; z-index:20;">
          <div style="background:white; border-radius:var(--radius-lg); padding:1.2rem 1.5rem; box-shadow:var(--shadow-md); border:1px solid var(--border-subtle); display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:1rem; align-items:end;">
            <div class="filter-group">
              <label>🔍 Buscar</label>
              <input type="text" id="clientSearch" class="form-control" placeholder="Zona, título, recámaras..." value="${this.filters.search}">
            </div>
            <div class="filter-group">
              <label>Tipo de Inmueble</label>
              <select id="clientCategory" class="form-control">
                <option value="all">Todas las categorías</option>
                <option value="Villa Residencial">Villa Residencial</option>
                <option value="Penthouse">Penthouse</option>
                <option value="Casa">Casa</option>
                <option value="Apartamento">Apartamento</option>
                <option value="Terreno">Terreno</option>
              </select>
            </div>
            <div class="filter-group">
              <label>Operación</label>
              <select id="clientOperation" class="form-control">
                <option value="all">Venta y Alquiler</option>
                <option value="Venta">Venta</option>
                <option value="Alquiler">Alquiler</option>
              </select>
            </div>
            <div style="display:flex; gap:8px;">
              <button class="btn btn-gold" style="flex:1;" onclick="app.applyPublicFilters()">Filtrar</button>
              <button class="btn btn-outline" style="padding:0.6rem 0.8rem;" onclick="app.resetPublicFilters()" title="Limpiar Filtros">↺</button>
            </div>
          </div>
        </div>

        <!-- Grid de Propiedades -->
        <section class="property-grid-public" id="publicClientGrid">
          <!-- Inyectado por JS -->
        </section>
      </div>
    `;

    document.getElementById('clientCategory').value = this.filters.category;
    document.getElementById('clientOperation').value = this.filters.operation;

    this.renderPublicPropertyList();

    // Si venía una propiedad específica en el link, abrir su modal
    if (this.propertyTarget) {
      setTimeout(() => this.openPropertyModal(this.propertyTarget), 400);
    }
  }

  renderPublicPropertyList() {
    const grid = document.getElementById('publicClientGrid');
    if (!grid) return;

    const filtered = this.data.properties.filter(p => {
      const matchSearch = !this.filters.search || 
        p.title.toLowerCase().includes(this.filters.search.toLowerCase()) || 
        p.location.toLowerCase().includes(this.filters.search.toLowerCase()) ||
        p.category.toLowerCase().includes(this.filters.search.toLowerCase());

      const matchCategory = this.filters.category === 'all' || p.category === this.filters.category;
      const matchOperation = this.filters.operation === 'all' || p.operation === this.filters.operation;

      return matchSearch && matchCategory && matchOperation;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 4rem; background: white; border-radius: var(--radius-lg);">
          <h3>No se encontraron propiedades</h3>
          <p style="color:var(--text-muted); margin:0.5rem 0 1.5rem;">Intente ajustando los filtros de búsqueda.</p>
          <button class="btn btn-gold" onclick="app.resetPublicFilters()">Ver todo el catálogo</button>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(p => `
      <article class="prop-card-public">
        <div class="card-img-box">
          <img src="${p.images[0]}" alt="${p.title}">
          <span style="position:absolute; top:12px; left:12px; background:var(--navy-blue); color:white; padding:0.3rem 0.8rem; border-radius:var(--radius-full); font-size:0.75rem; font-weight:700;">
            ${p.operation}
          </span>
          <span style="position:absolute; top:12px; right:12px; background:${p.status === 'Disponible' ? 'rgba(16,185,129,0.9)' : 'rgba(245,158,11,0.9)'}; color:white; padding:0.3rem 0.75rem; border-radius:var(--radius-full); font-size:0.75rem; font-weight:600;">
            ${p.status}
          </span>
        </div>
        <div class="card-details">
          <span style="color:var(--accent-gold); font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:0.3rem;">
            ${p.category} • Ref: ${p.id}
          </span>
          <h4 style="font-size:1.25rem; color:var(--navy-blue); margin-bottom:0.4rem;">${p.title}</h4>
          <div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1rem;">📍 ${p.location}</div>

          <div style="display:flex; justify-content:space-between; border-top:1px solid var(--border-subtle); border-bottom:1px solid var(--border-subtle); padding:0.75rem 0; margin-bottom:1.2rem; font-size:0.85rem; font-weight:600;">
            ${p.bedrooms > 0 ? `<span>🛏️ ${p.bedrooms} Rec</span>` : ''}
            ${p.bathrooms > 0 ? `<span>🚿 ${p.bathrooms} Baños</span>` : ''}
            <span>📐 ${p.area} m²</span>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:auto;">
            <div>
              <div style="font-size:0.7rem; color:var(--text-muted); text-transform:uppercase;">Precio</div>
              <div style="font-size:1.35rem; font-weight:800; color:var(--navy-blue);">$${p.price.toLocaleString()} ${p.currency}</div>
            </div>
            <button class="btn btn-primary" onclick="app.openPropertyModal('${p.id}')">
              Ver Ficha
            </button>
          </div>
        </div>
      </article>
    `).join('');
  }

  // ==========================================================================
  // MODO 3: PORTAL PÚBLICO PARA PROPIETARIOS (Generado por Link de WhatsApp)
  // ==========================================================================
  renderPublicOwnerPortal(container) {
    const greeting = this.ownerGreeting 
      ? `<div class="tag-badge">💼 Propuesta de Valor Exclusiva para ${this.ownerGreeting}</div>` 
      : `<div class="tag-badge">Servicio Premium de Consignación & Venta Inmobiliaria</div>`;

    container.innerHTML = `
      <div class="public-portal">
        <header class="public-header">
          <div style="display:flex; align-items:center; gap:16px;">
            <button class="btn btn-outline" style="padding:0.45rem 0.9rem; font-size:0.85rem;" onclick="app.navigateBack()">
              ← Volver
            </button>
            <div style="display:flex; align-items:center; gap:10px; cursor:pointer;" onclick="app.navigateHome()">
              <div class="admin-badge-icon" style="width:36px; height:36px; font-size:1.1rem;">L</div>
              <div>
                <h2 style="font-size:1.2rem; color:var(--navy-blue); line-height:1;">LÚMINA</h2>
                <span style="font-size:0.7rem; color:var(--accent-gold); text-transform:uppercase; letter-spacing:0.1em; font-weight:700;">Real Estate</span>
              </div>
            </div>
          </div>

          <div style="display:flex; align-items:center; gap:12px;">
            <button class="btn btn-whatsapp" onclick="app.contactWhatsAppGeneral('Hola, soy propietario y me gustaría coordinar una reunión para la comercialización de mi propiedad.')">
              📱 Hablar con un Director
            </button>
          </div>
        </header>

        <section class="hero-public owner-bg">
          <div class="hero-public-content">
            ${greeting}
            <h2>Comercialice su Propiedad al Máximo Valor de Mercado</h2>
            <p>En Lúmina Real Estate transformamos su inmueble en una oportunidad de inversión altamente cotizada con marketing digital de élite y blindaje legal integral.</p>
          </div>
        </section>

        <!-- Quiénes somos y Métricas -->
        <div style="max-width:1100px; margin:-2.5rem auto 3rem; padding:0 1.5rem; position:relative; z-index:20;">
          <div style="background:white; border-radius:var(--radius-lg); padding:2.5rem; box-shadow:var(--shadow-md); border:1px solid var(--border-subtle);">
            
            <div class="metrics-row" style="margin-bottom:2rem;">
              ${this.data.company.about.stats.map(s => `
                <div style="text-align:center;">
                  <div style="font-size:2.2rem; font-weight:800; color:var(--accent-gold); font-family:'Playfair Display',serif;">${s.value}</div>
                  <div style="font-size:0.85rem; color:var(--text-muted); font-weight:600;">${s.label}</div>
                </div>
              `).join('')}
            </div>

            <div style="text-align:center; max-width:750px; margin:0 auto 2.5rem;">
              <h3 style="font-size:1.8rem; color:var(--navy-blue); margin-bottom:0.8rem;">¿Quiénes Somos?</h3>
              <p style="color:var(--text-muted); font-size:1rem; line-height:1.7;">
                ${this.data.company.about.story}
              </p>
            </div>

            <h3 style="text-align:center; font-size:1.8rem; color:var(--navy-blue); margin-bottom:1.5rem;">¿Por qué Adquirir Nuestro Servicio Inmobiliario?</h3>
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:1.5rem;">
              ${this.data.company.about.advantages.map(adv => `
                <div style="background:#F8FAFC; border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:1.5rem;">
                  <h4 style="font-size:1.15rem; color:var(--navy-blue); margin-bottom:0.5rem;">${adv.title}</h4>
                  <p style="color:var(--text-muted); font-size:0.88rem; line-height:1.6;">${adv.desc}</p>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Formulario de Consignación -->
        <section style="max-width:850px; margin:0 auto 4rem; padding:0 1.5rem;">
          <div style="background:white; border-radius:var(--radius-lg); padding:2.5rem; border:1px solid var(--border-subtle); box-shadow:var(--shadow-md);">
            <div style="text-align:center; margin-bottom:1.8rem;">
              <h3 style="font-size:1.8rem; color:var(--navy-blue);">Solicitar Valuación & Consignación</h3>
              <p style="color:var(--text-muted); font-size:0.9rem;">Complete el formulario y un asesor senior le contactará de inmediato.</p>
            </div>

            <form onsubmit="app.handlePublicOwnerSubmit(event)">
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
                <div class="filter-group">
                  <label>Nombre Completo *</label>
                  <input type="text" id="ownerFormName" required class="form-control" value="${this.ownerGreeting || ''}" placeholder="Ej. Lic. Morales">
                </div>
                <div class="filter-group">
                  <label>WhatsApp / Teléfono *</label>
                  <input type="tel" id="ownerFormPhone" required class="form-control" placeholder="+52 55 1234 5678">
                </div>
              </div>

              <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
                <div class="filter-group">
                  <label>Tipo de Inmueble *</label>
                  <select id="ownerFormType" class="form-control" required>
                    <option value="Casa / Residencia">Casa / Residencia</option>
                    <option value="Penthouse / Apartamento">Penthouse / Apartamento</option>
                    <option value="Terreno">Terreno</option>
                    <option value="Comercial">Comercial</option>
                  </select>
                </div>
                <div class="filter-group">
                  <label>Operación *</label>
                  <select id="ownerFormOp" class="form-control" required>
                    <option value="Venta">Deseo Vender</option>
                    <option value="Alquiler">Deseo Rentar</option>
                  </select>
                </div>
              </div>

              <div class="filter-group" style="margin-bottom:1.5rem;">
                <label>Ubicación y Detalles del Inmueble *</label>
                <textarea id="ownerFormNotes" rows="3" required class="form-control" placeholder="Zona, m², precio estimado..."></textarea>
              </div>

              <div style="display:flex; gap:12px;">
                <button type="button" class="btn btn-outline" style="flex:1;" onclick="app.navigateBack()">← Cancelar / Regresar</button>
                <button type="submit" class="btn btn-gold" style="flex:2; padding:0.9rem; font-size:1rem;">
                  Enviar Información para Valuación Gratuita
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    `;
  }

  // ==========================================================================
  // Modal de Ficha de Propiedad con Botón de Regresar
  // ==========================================================================
  openPropertyModal(propId) {
    const p = this.data.properties.find(item => item.id === propId);
    if (!p) return;

    this.selectedProperty = p;
    const modal = document.getElementById('propertyModal');
    const content = document.getElementById('modalPropertyContent');

    content.innerHTML = `
      <div style="position:relative;">
        <img id="modalMainImg" style="width:100%; height:360px; object-fit:cover;" src="${p.images[0]}" alt="${p.title}">
        <div style="display:flex; gap:8px; padding:10px 1.5rem; background:#080D1A; overflow-x:auto;">
          ${p.images.map((img, idx) => `
            <img src="${img}" style="width:75px; height:50px; border-radius:4px; object-fit:cover; cursor:pointer; opacity:${idx === 0 ? '1' : '0.6'}; border:2px solid ${idx === 0 ? 'var(--accent-gold)' : 'transparent'};" onclick="app.switchModalImg('${img}', this)">
          `).join('')}
        </div>
      </div>

      <div class="modal-content-inner">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:10px; margin-bottom:1rem;">
          <div>
            <span style="color:var(--accent-gold); font-size:0.75rem; font-weight:700; text-transform:uppercase;">${p.category} • Ref: ${p.id}</span>
            <h2 style="font-size:1.8rem; margin:0.3rem 0; color:var(--navy-blue);">${p.title}</h2>
            <div style="color:var(--text-muted); font-size:0.88rem;">📍 ${p.addressDetails || p.location}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase;">Precio ${p.operation}</div>
            <div style="font-size:1.8rem; font-weight:800; color:var(--accent-gold);">$${p.price.toLocaleString()} ${p.currency}</div>
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; border-top:1px solid var(--border-subtle); border-bottom:1px solid var(--border-subtle); padding:0.9rem 0; margin:1.2rem 0; font-size:0.9rem; font-weight:600;">
          ${p.bedrooms > 0 ? `<span>🛏️ ${p.bedrooms} Recámaras</span>` : ''}
          ${p.bathrooms > 0 ? `<span>🚿 ${p.bathrooms} Baños</span>` : ''}
          ${p.parking > 0 ? `<span>🚗 ${p.parking} Autos</span>` : ''}
          <span>📐 ${p.area} m² Construcción</span>
        </div>

        <div style="margin-bottom:1.5rem;">
          <h4 style="font-size:1.15rem; color:var(--navy-blue); margin-bottom:0.5rem;">Descripción</h4>
          <p style="color:var(--text-muted); line-height:1.7; font-size:0.92rem;">${p.description}</p>
        </div>

        <div style="margin-bottom:1.8rem;">
          <h4 style="font-size:1.15rem; color:var(--navy-blue); margin-bottom:0.6rem;">Amenidades</h4>
          <div style="display:flex; flex-wrap:wrap; gap:8px;">
            ${p.amenities.map(a => `
              <span style="background:#F1F5F9; border:1px solid var(--border-subtle); padding:0.35rem 0.8rem; border-radius:var(--radius-full); font-size:0.82rem; font-weight:600; color:var(--navy-blue);">
                ✓ ${a}
              </span>
            `).join('')}
          </div>
        </div>

        <!-- Botones de Acción -->
        <div style="display:flex; gap:12px; flex-wrap:wrap;">
          <button class="btn btn-outline" style="padding:0.85rem 1.4rem;" onclick="app.closeModal()">
            ← Volver al Catálogo
          </button>
          <button class="btn btn-whatsapp" style="flex:1; padding:0.85rem;" onclick="app.contactWhatsAppProperty('${p.id}')">
            📱 Agendar Visita / Consultar WhatsApp
          </button>
          <button class="btn btn-outline" onclick="app.copyPropertyPublicLink('${p.id}')">
            🔗 Copiar Enlace
          </button>
        </div>
      </div>
    `;

    modal.classList.add('active');
  }

  // Métodos de Navegación y Retorno
  navigateBack() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.navigateHome();
    }
  }

  navigateHome() {
    window.location.href = window.location.pathname;
  }

  switchModalImg(src, imgEl) {
    document.getElementById('modalMainImg').src = src;
    imgEl.parentElement.querySelectorAll('img').forEach(i => {
      i.style.opacity = '0.6';
      i.style.borderColor = 'transparent';
    });
    imgEl.style.opacity = '1';
    imgEl.style.borderColor = 'var(--accent-gold)';
  }

  closeModal() {
    document.getElementById('propertyModal').classList.remove('active');
    document.getElementById('newPropertyModal').classList.remove('active');
    document.getElementById('newLeadModal').classList.remove('active');
  }

  // ==========================================================================
  // Acciones y Handlers
  // ==========================================================================
  openNewPropertyModal() {
    document.getElementById('propertyForm').reset();
    document.getElementById('newPropertyModal').classList.add('active');
  }

  openNewLeadModal() {
    document.getElementById('newLeadModal').classList.add('active');
  }

  openExternalPreview(type) {
    const base = window.location.origin + window.location.pathname;
    const url = type === 'propietario' ? `${base}?view=propietario` : `${base}?view=catalogo`;
    window.open(url, '_blank');
  }

  applyPublicFilters() {
    this.filters.search = document.getElementById('clientSearch').value;
    this.filters.category = document.getElementById('clientCategory').value;
    this.filters.operation = document.getElementById('clientOperation').value;
    this.renderPublicPropertyList();
  }

  resetPublicFilters() {
    this.filters = { search: '', category: 'all', operation: 'all' };
    this.renderPublicClientPortal(document.getElementById('appContainer'));
  }

  handlePropertySubmit(e) {
    e.preventDefault();
    const title = document.getElementById('propTitle').value;
    const operation = document.getElementById('propOperation').value;
    const category = document.getElementById('propCategory').value;
    const price = parseFloat(document.getElementById('propPrice').value);
    const currency = document.getElementById('propCurrency').value;
    const location = document.getElementById('propLocation').value;
    const bedrooms = parseInt(document.getElementById('propBedrooms').value) || 0;
    const bathrooms = parseFloat(document.getElementById('propBathrooms').value) || 0;
    const parking = parseInt(document.getElementById('propParking').value) || 0;
    const area = parseFloat(document.getElementById('propArea').value) || 0;
    const image = document.getElementById('propImage').value || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';
    const amenitiesText = document.getElementById('propAmenities').value;
    const description = document.getElementById('propDesc').value;

    const newId = `PROP-${100 + this.data.properties.length + 1}`;

    const newProp = {
      id: newId,
      title,
      category,
      operation,
      price,
      currency,
      location,
      bedrooms,
      bathrooms,
      parking,
      area,
      status: 'Disponible',
      featured: true,
      description,
      images: [image],
      amenities: amenitiesText ? amenitiesText.split(',').map(a => a.trim()) : ["Seguridad 24/7", "Excelente Ubicación"],
      agentId: 1
    };

    this.data.properties.unshift(newProp);
    this.saveData();
    this.closeModal();
    this.showToast(`¡Propiedad ${newId} publicada con éxito!`);
    this.renderAdminTabContent();
  }

  handleNewLeadSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('leadName').value;
    const phone = document.getElementById('leadPhone').value;
    const type = document.getElementById('leadType').value;
    const email = document.getElementById('leadEmail').value;
    const interest = document.getElementById('leadInterest').value;
    const budget = document.getElementById('leadBudget').value;

    const newLead = {
      id: this.data.leads.length + 1,
      name,
      phone,
      email,
      type,
      propertyInterest: interest || 'General',
      budget: budget || '-',
      status: 'Nuevo Contacto',
      date: new Date().toISOString().split('T')[0]
    };

    this.data.leads.unshift(newLead);
    this.saveData();
    this.closeModal();
    this.showToast('Prospecto guardado exitosamente');
    this.renderAdminTabContent();
  }

  handlePublicOwnerSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('ownerFormName').value;
    const phone = document.getElementById('ownerFormPhone').value;
    const type = document.getElementById('ownerFormType').value;
    const op = document.getElementById('ownerFormOp').value;
    const notes = document.getElementById('ownerFormNotes').value;

    const newLead = {
      id: this.data.leads.length + 1,
      name,
      phone,
      type: 'Propietario',
      propertyInterest: `Consignación: ${type} (${op})`,
      budget: notes,
      status: 'Registro Web',
      date: new Date().toISOString().split('T')[0]
    };

    this.data.leads.unshift(newLead);
    this.saveData();
    this.showToast('¡Gracias! Su información ha sido enviada.');
    e.target.reset();

    setTimeout(() => {
      const text = `Hola, registré mi propiedad para consignación:\nNombre: ${name}\nTeléfono: ${phone}\nTipo: ${type}\nDetalles: ${notes}`;
      window.open(`https://api.whatsapp.com/send?phone=${this.data.company.whatsapp}&text=${encodeURIComponent(text)}`, '_blank');
    }, 400);
  }

  changePropertyStatus(propId, status) {
    const p = this.data.properties.find(item => item.id === propId);
    if (p) {
      p.status = status;
      this.saveData();
      this.showToast(`Estado de ${propId} cambiado a: ${status}`);
    }
  }

  deleteProperty(propId) {
    if (confirm(`¿Está seguro de eliminar la propiedad ${propId}?`)) {
      this.data.properties = this.data.properties.filter(p => p.id !== propId);
      this.saveData();
      this.showToast(`Propiedad ${propId} eliminada.`);
      this.renderAdminTabContent();
    }
  }

  contactWhatsAppProperty(propId) {
    const p = this.data.properties.find(item => item.id === propId);
    if (!p) return;
    const msg = `Hola, me interesa agendar una visita para la propiedad *${p.title}* (Ref: ${p.id}) con precio de $${p.price.toLocaleString()} ${p.currency}. ¿Qué horarios tienen disponibles?`;
    window.open(`https://api.whatsapp.com/send?phone=${this.data.company.whatsapp}&text=${encodeURIComponent(msg)}`, '_blank');
  }

  contactWhatsAppGeneral(msg) {
    window.open(`https://api.whatsapp.com/send?phone=${this.data.company.whatsapp}&text=${encodeURIComponent(msg)}`, '_blank');
  }

  copyFromId(elementId) {
    const text = document.getElementById(elementId)?.textContent;
    if (text) {
      navigator.clipboard.writeText(text).then(() => {
        this.showToast('¡Enlace copiado al portapapeles!');
      });
    }
  }

  copyPropertyPublicLink(propId) {
    const url = `${window.location.origin}${window.location.pathname}?view=catalogo&prop=${propId}`;
    navigator.clipboard.writeText(url).then(() => {
      this.showToast('¡Enlace de propiedad copiado!');
    });
  }

  showToast(msg) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
      <span>${msg}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }

  bindEvents() {
    window.addEventListener('popstate', () => {
      this.resolveRouting();
      this.render();
    });
  }
}

let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new RealEstateApp();
});
