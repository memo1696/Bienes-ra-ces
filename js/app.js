// ==========================================================================
// Lúmina Real Estate - Enterprise Administrator Suite & Luxury Portal Logic
// ==========================================================================

class RealEstateApp {
  constructor() {
    this.data = this.loadData();
    this.currentMode = 'admin'; // 'admin' | 'public_client' | 'public_owner'
    this.adminTab = 'dashboard'; // 'dashboard' | 'links' | 'properties' | 'leads' | 'concierge' | 'team'
    this.publicClientTab = 'catalog'; // 'catalog' | 'concierge' | 'team'
    this.clientGreeting = '';
    this.ownerGreeting = '';
    this.propertyTarget = null;
    this.selectedProperty = null;
    this.tempPhotos = []; // Galería en edición para Administrador (Máx 20)

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
        const parsed = JSON.parse(saved);
        // Garantizar que siempre se disponga de la data de agentes enriquecida y servicios concierge
        if (!parsed.exclusiveServices || !parsed.agents || !parsed.agents[0].credentials || typeof parsed.properties[0].isOffer === 'undefined') {
          parsed.agents = INITIAL_DATA.agents;
          parsed.exclusiveServices = INITIAL_DATA.exclusiveServices;
          parsed.properties = INITIAL_DATA.properties;
        }
        return parsed;
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
    const tab = params.get('tab');
    const cliente = params.get('cliente');
    const propietario = params.get('propietario');
    const prop = params.get('prop');

    if (view === 'propietario' || propietario) {
      this.currentMode = 'public_owner';
      this.ownerGreeting = propietario ? decodeURIComponent(propietario) : '';
    } else if (view === 'catalogo' || view === 'cliente' || cliente || prop || tab) {
      this.currentMode = 'public_client';
      this.clientGreeting = cliente ? decodeURIComponent(cliente) : '';
      this.propertyTarget = prop ? decodeURIComponent(prop) : null;
      if (tab === 'concierge' || tab === 'team' || tab === 'catalog') {
        this.publicClientTab = tab;
      }
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
            <div class="menu-label">Gestión Inmobiliaria</div>
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

            <div class="menu-label">Servicios & Equipo</div>
            <button class="nav-item ${this.adminTab === 'concierge' ? 'active' : ''}" onclick="app.setAdminTab('concierge')">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>
              <span>Servicios Concierge (${this.data.exclusiveServices ? this.data.exclusiveServices.length : 4})</span>
            </button>

            <button class="nav-item ${this.adminTab === 'team' ? 'active' : ''}" onclick="app.setAdminTab('team')">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
              <span>Equipo & Asesores (${this.data.agents.length})</span>
            </button>

            <div class="menu-label">Portales Públicos</div>
            <button class="nav-item" onclick="app.openExternalPreview('cliente')">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
              <span>Ver Portal Clientes</span>
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
              <span>${this.data.agents[0].role}</span>
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
            <div style="display:flex; gap:12px; flex-wrap:wrap;">
              <button class="btn btn-outline" onclick="app.setAdminTab('links')">
                🔗 Enlaces WhatsApp
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

        <!-- Barra de Navegación Inferior para Móviles -->
        <nav class="mobile-bottom-nav">
          <button class="mobile-nav-btn ${this.adminTab === 'dashboard' ? 'active' : ''}" onclick="app.setAdminTab('dashboard')">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
            <span>Dashboard</span>
          </button>
          <button class="mobile-nav-btn ${this.adminTab === 'links' ? 'active' : ''}" onclick="app.setAdminTab('links')">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
            <span>Links</span>
          </button>
          <button class="mobile-nav-btn ${this.adminTab === 'properties' ? 'active' : ''}" onclick="app.setAdminTab('properties')">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
            <span>Inmuebles</span>
          </button>
          <button class="mobile-nav-btn ${this.adminTab === 'leads' ? 'active' : ''}" onclick="app.setAdminTab('leads')">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            <span>Leads</span>
          </button>
        </nav>
      </div>
    `;

    this.renderAdminTabContent();
  }

  getAdminTabTitle() {
    switch (this.adminTab) {
      case 'dashboard': return 'Dashboard de Control Operativo';
      case 'links': return 'Generador de Enlaces para WhatsApp';
      case 'properties': return 'Gestión de Inventario de Propiedades';
      case 'leads': return 'Directorio de Prospectos y Leads';
      case 'concierge': return 'Servicios Exclusivos Concierge & Post-Venta';
      case 'team': return 'Equipo de Asesores Senior & Especialistas';
      default: return 'Panel de Administración';
    }
  }

  getAdminTabSubtitle() {
    switch (this.adminTab) {
      case 'dashboard': return 'Métricas en tiempo real, cartera activa y rendimiento comercial';
      case 'links': return 'Cree URLs dinámicas y mensajes de WhatsApp profesionales para propietarios y compradores';
      case 'properties': return 'Control de disponibilidad, precios, descripciones y fichas técnicas';
      case 'leads': return 'Seguimiento de compradores interesados y propietarios en consignación';
      case 'concierge': return 'Servicios de valor añadido: mudanzas premium, sanitización, legal e interiorismo';
      case 'team': return 'Asesores certificados con credenciales AMPI y asignación de portafolio';
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
    } else if (this.adminTab === 'concierge') {
      this.renderAdminConcierge(area);
    } else if (this.adminTab === 'team') {
      this.renderAdminTeam(area);
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

      <!-- Destacado del Módulo de Agentes y Servicios -->
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
        <div style="background: linear-gradient(135deg, #090E1D, #131E38); border-radius: var(--radius-lg); padding: 1.75rem; color: white; border: 1px solid rgba(200,157,53,0.3); display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <span class="tag-badge" style="background: rgba(200, 157, 53, 0.25);">⭐ Asesores a Cargo</span>
            <h3 style="font-size: 1.35rem; color: white; margin: 0.6rem 0;">Equipo Senior de Bienes Raíces</h3>
            <p style="color: #94A3B8; font-size: 0.88rem; line-height: 1.5;">
              Cada propiedad cuenta con un asesor senior asignado con credenciales AMPI verificadas y enlace de chat directo a WhatsApp.
            </p>
          </div>
          <div style="margin-top: 1.25rem; display:flex; align-items:center; justify-content:space-between;">
            <div style="display:flex; margin-left: 10px;">
              ${this.data.agents.map((ag, i) => `
                <img src="${ag.photo}" style="width:36px; height:36px; border-radius:50%; border:2px solid var(--accent-gold); margin-left:-10px; object-fit:cover;" title="${ag.name} (${ag.role})">
              `).join('')}
            </div>
            <button class="btn btn-outline" style="font-size:0.8rem; padding:0.4rem 0.8rem; color:#FFFFFF; border-color:rgba(255,255,255,0.3);" onclick="app.setAdminTab('team')">
              Ver Asesores →
            </button>
          </div>
        </div>

        <div style="background: linear-gradient(135deg, #0D1B2A, #1B263B); border-radius: var(--radius-lg); padding: 1.75rem; color: white; border: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <span class="tag-badge" style="background: rgba(16, 185, 129, 0.2); color: #34D399;">✨ Post-Venta & Concierge</span>
            <h3 style="font-size: 1.35rem; color: white; margin: 0.6rem 0;">Servicios Exclusivos Activos</h3>
            <p style="color: #94A3B8; font-size: 0.88rem; line-height: 1.5;">
              Mudanzas White-Glove, sanitización pre-entrega, blindaje legal y home staging integrados con cotizador rápido.
            </p>
          </div>
          <div style="margin-top: 1.25rem; display:flex; align-items:center; justify-content:space-between;">
            <span style="font-size:0.82rem; color:#A7F3D0;">4 Servicios de Élite</span>
            <button class="btn btn-gold" style="font-size:0.8rem; padding:0.4rem 0.8rem;" onclick="app.setAdminTab('concierge')">
              Ver Servicios →
            </button>
          </div>
        </div>
      </div>

      <!-- Tabla Resumen de Propiedades Recientes con Agente Asignado -->
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
              <th>Asesor a Cargo</th>
              <th>Operación</th>
              <th>Precio</th>
              <th>Estado</th>
              <th>Acción Rápida</th>
            </tr>
          </thead>
          <tbody>
            ${this.data.properties.slice(0, 4).map(p => {
              const ag = this.data.agents.find(a => a.id === (p.agentId || 1)) || this.data.agents[0];
              return `
                <tr>
                  <td><strong>${p.id}</strong></td>
                  <td>
                    <div style="font-weight: 700; color: var(--navy-blue);">${p.title}</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">${p.location}</div>
                  </td>
                  <td>
                    <div style="display:flex; align-items:center; gap:8px;">
                      <img src="${ag.photo}" style="width:28px; height:28px; border-radius:50%; object-fit:cover; border:1.5px solid var(--accent-gold);">
                      <div>
                        <div style="font-weight:600; font-size:0.82rem; color:var(--navy-blue);">${ag.name}</div>
                        <div style="font-size:0.72rem; color:var(--text-muted);">${ag.role}</div>
                      </div>
                    </div>
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
              `;
            }).join('')}
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
            Este enlace muestra la propuesta de valor institucional: <strong>Quiénes somos</strong>, los <strong>4 pilares del servicio</strong>, métricas de éxito, servicios concierge y el <strong>formulario para consignar y valuar su propiedad</strong>.
          </p>

          <div class="filter-group" style="margin-bottom: 0.8rem;">
            <label>Nombre del Propietario (Personalizado):</label>
            <input type="text" id="adminOwnerName" class="form-control" placeholder="Ej. Lic. Fernando Morales" oninput="app.refreshGeneratedLinks()">
          </div>

          <div class="link-url-box" id="adminOwnerUrlBox">
            Generando enlace...
          </div>

          <div style="display: flex; gap: 10px; margin-top: auto; flex-wrap:wrap;">
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
              <h3 style="font-size: 1.3rem; color: var(--navy-blue);">Enlace para Cliente (Catálogo / Ficha / Concierge)</h3>
              <p style="font-size: 0.85rem; color: var(--text-muted);">Para que el comprador explore propiedades y servicios</p>
            </div>
          </div>

          <p style="font-size: 0.88rem; color: #475569; margin-bottom: 1.2rem; line-height: 1.5;">
            Este enlace abre el <strong>catálogo interactivo con perfiles de agentes a cargo</strong>, o la sección de <strong>Servicios Concierge</strong> con cotización rápida.
          </p>

          <div class="filter-group" style="margin-bottom: 0.8rem;">
            <label>Nombre del Cliente (Personalizado):</label>
            <input type="text" id="adminClientName" class="form-control" placeholder="Ej. Dra. Sofía Benítez" oninput="app.refreshGeneratedLinks()">
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; margin-bottom:0.8rem;">
            <div class="filter-group">
              <label>Sección Inicial:</label>
              <select id="adminClientTabSelect" class="form-control" onchange="app.refreshGeneratedLinks()">
                <option value="catalog">Catálogo de Inmuebles</option>
                <option value="concierge">Servicios Concierge</option>
                <option value="team">Equipo de Asesores</option>
              </select>
            </div>
            <div class="filter-group">
              <label>Propiedad Específica:</label>
              <select id="adminClientPropSelect" class="form-control" onchange="app.refreshGeneratedLinks()">
                <option value="">-- Todo el Catálogo --</option>
                ${this.data.properties.map(p => `
                  <option value="${p.id}">${p.id} - ${p.title}</option>
                `).join('')}
              </select>
            </div>
          </div>

          <div class="link-url-box" id="adminClientUrlBox">
            Generando enlace...
          </div>

          <div style="display: flex; gap: 10px; margin-top: auto; flex-wrap:wrap;">
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
    const clientTab = document.getElementById('adminClientTabSelect')?.value || 'catalog';
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
    if (clientTab && clientTab !== 'catalog') clientUrl += `&tab=${encodeURIComponent(clientTab)}`;
    if (clientProp) clientUrl += `&prop=${encodeURIComponent(clientProp)}`;
    const clientBox = document.getElementById('adminClientUrlBox');
    if (clientBox) clientBox.textContent = clientUrl;
  }

  dispatchOwnerWhatsApp() {
    const ownerName = document.getElementById('adminOwnerName')?.value.trim() || 'Estimado/a Propietario/a';
    const link = document.getElementById('adminOwnerUrlBox')?.textContent;

    const msg = `Hola ${ownerName}, un gusto saludarle de parte de ${this.data.company.name}. Para la comercialización segura y al más alto valor de su propiedad, le comparto nuestra propuesta de servicios, casos de éxito y proceso de valuación:\n\n👉 ${link}\n\nQuedo a su entera disposición.`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  }

  dispatchClientWhatsApp() {
    const clientName = document.getElementById('adminClientName')?.value.trim() || 'Estimado/a Cliente';
    const clientProp = document.getElementById('adminClientPropSelect')?.value;
    const clientTab = document.getElementById('adminClientTabSelect')?.value;
    const link = document.getElementById('adminClientUrlBox')?.textContent;

    let msg = `Hola ${clientName}, un gusto saludarle de parte de ${this.data.company.name}. Le comparto nuestro catálogo exclusivo de propiedades seleccionadas para que pueda explorar sus opciones favoritas y agendar visitas:\n\n👉 ${link}\n\nCon gusto le asisto con cualquier duda.`;

    if (clientProp) {
      const p = this.data.properties.find(item => item.id === clientProp);
      const ag = this.data.agents.find(a => a.id === (p.agentId || 1)) || this.data.agents[0];
      msg = `Hola ${clientName}, le comparto la ficha completa de la propiedad *${p.title}* (${p.id}), a cargo de nuestro asesor *${ag.name}*:\n\n👉 ${link}\n\nQuedo a la orden para coordinar su recorrido.`;
    } else if (clientTab === 'concierge') {
      msg = `Hola ${clientName}, le comparto nuestro portafolio de *Servicios Concierge & Post-Venta* (Mudanzas White-Glove, Sanitización, Asesoría Legal e Interiorismo):\n\n👉 ${link}\n\nCon gusto le preparamos una cotización a medida.`;
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
              <th>Asesor a Cargo</th>
              <th>Tipo</th>
              <th>Operación</th>
              <th>Precio</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${this.data.properties.map(p => {
              const ag = this.data.agents.find(a => a.id === (p.agentId || 1)) || this.data.agents[0];
              return `
                <tr>
                  <td><strong>${p.id}</strong></td>
                  <td>
                    <div style="font-weight: 700; color: var(--navy-blue);">${p.title}</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">${p.location} • ${p.area} m²</div>
                  </td>
                  <td>
                    <div style="display:flex; align-items:center; gap:6px;">
                      <img src="${ag.photo}" style="width:24px; height:24px; border-radius:50%; object-fit:cover;">
                      <span style="font-size:0.82rem; font-weight:600;">${ag.name.split(' ')[0]}</span>
                    </div>
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
                      <button class="btn btn-outline" style="padding:0.3rem 0.6rem; font-size:0.8rem;" onclick="app.openPropertyModal('${p.id}')">Ficha</button>
                      <button class="btn btn-outline" style="padding:0.3rem 0.6rem; font-size:0.8rem;" onclick="app.openEditPropertyModal('${p.id}')" title="Editar Inmueble y Fotos">✏️</button>
                      <button class="btn btn-outline" style="padding:0.3rem 0.6rem; font-size:0.8rem;" onclick="app.openBrochureModal('${p.id}')" title="Descargar Brochure PDF">PDF</button>
                      <button class="btn btn-outline" style="padding:0.3rem 0.6rem; font-size:0.8rem;" onclick="app.generateClientLinkForProp('${p.id}')">Link</button>
                      <button class="btn btn-outline" style="padding:0.3rem 0.6rem; font-size:0.8rem; color:var(--danger);" onclick="app.deleteProperty('${p.id}')">✕</button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
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

  // Tab: Servicios Concierge (Admin View)
  renderAdminConcierge(container) {
    const services = this.data.exclusiveServices || INITIAL_DATA.exclusiveServices;
    container.innerHTML = `
      <div class="concierge-header-banner" style="margin-bottom:1.5rem; padding:1.75rem;">
        <span class="tag-badge" style="background:rgba(200,157,53,0.3); color:var(--accent-gold);">Servicios de Valor Añadido</span>
        <h2>Módulo de Servicios Concierge & Post-Venta</h2>
        <p>Servicios complementarios disponibles para clientes compradores y propietarios en el portal.</p>
      </div>

      <div class="concierge-grid">
        ${services.map(svc => `
          <div class="concierge-card">
            <div class="concierge-badge-top">${svc.badge}</div>
            <div class="concierge-icon-circle">
              ${this.getServiceIconSvg(svc.icon)}
            </div>
            <span style="font-size:0.75rem; font-weight:700; color:var(--accent-gold); text-transform:uppercase;">${svc.category}</span>
            <h3 class="concierge-card-title">${svc.title}</h3>
            <p class="concierge-card-desc">${svc.shortDesc}</p>

            <ul class="concierge-features-list">
              ${svc.features.map(f => `
                <li>
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                  <span>${f}</span>
                </li>
              `).join('')}
            </ul>

            <div class="concierge-card-footer">
              <div class="concierge-pricing">
                <span>Tarifa Estimada</span>
                <strong>${svc.pricingFrom}</strong>
              </div>
              <button class="btn btn-whatsapp" style="padding:0.45rem 0.9rem; font-size:0.82rem;" onclick="app.openConciergeModal('${svc.id}')">
                Probar Cotizador
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // Tab: Equipo de Asesores (Admin View)
  renderAdminTeam(container) {
    container.innerHTML = `
      <div style="background:white; border-radius:var(--radius-lg); padding:1.5rem; margin-bottom:2rem; border:1px solid var(--border-subtle); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
        <div>
          <h3 style="font-size:1.4rem; color:var(--navy-blue); margin-bottom:0.2rem;">Equipo de Asesores Senior</h3>
          <p style="color:var(--text-muted); font-size:0.88rem;">Profesionales a cargo de la gestión de inmuebles y atención directa por WhatsApp.</p>
        </div>
        <span class="tag-badge" style="background:#E2E8F0; color:var(--navy-blue);">${this.data.agents.length} Asesores Activos</span>
      </div>

      <div class="team-grid-public">
        ${this.data.agents.map(ag => `
          <div class="team-member-card">
            <div class="team-member-cover">
              <img src="${ag.photo}" alt="${ag.name}" class="team-member-photo">
            </div>
            <div class="team-member-body">
              <h3>${ag.name}</h3>
              <div class="role">${ag.role}</div>
              <div style="font-size:0.8rem; color:var(--navy-blue); font-weight:700; margin-bottom:0.4rem;">
                📜 ${ag.credentials || 'AMPI Master Certified'}
              </div>
              <p class="bio">${ag.bio || 'Especialista en transacciones inmobiliarias de alta gama.'}</p>
              
              <div style="display:flex; flex-direction:column; gap:8px; margin-top:auto; padding-top:1rem; border-top:1px solid var(--border-subtle);">
                <div style="font-size:0.8rem; color:var(--text-muted);">
                  📞 ${ag.phone} • ✉️ ${ag.email}
                </div>
                <button class="btn btn-whatsapp" onclick="window.open('https://api.whatsapp.com/send?phone=${(ag.whatsapp || ag.phone).replace(/[^0-9]/g, '')}&text=${encodeURIComponent('Hola ' + ag.name + ', me comunico desde el portal de Lúmina Real Estate.')}', '_blank')">
                  📱 Chat WhatsApp Directo
                </button>
              </div>
            </div>
          </div>
        `).join('')}
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
            <button class="btn btn-whatsapp" onclick="app.contactWhatsAppGeneral('Hola, estoy revisando el portal de Lúmina Real Estate y me gustaría recibir asesoría personalizada.')">
              📱 Asesor en Línea
            </button>
          </div>
        </header>

        <section class="hero-public">
          <div class="hero-public-content">
            ${greeting}
            <h2>Residencias & Servicios Exclusivos de Alto Valor</h2>
            <p>Explore nuestro inventario selecto de propiedades con asesor senior asignado y servicios concierge de guante blanco.</p>
          </div>
        </section>

        <!-- Barra de Navegación del Portal (Pills Switcher) -->
        <div class="portal-nav-bar">
          <div class="portal-nav-pills">
            <button class="portal-pill-btn ${this.publicClientTab === 'catalog' ? 'active' : ''}" onclick="app.setPublicClientTab('catalog')">
              🏠 Catálogo de Inmuebles
            </button>
            <button class="portal-pill-btn ${this.publicClientTab === 'concierge' ? 'active' : ''}" onclick="app.setPublicClientTab('concierge')">
              ✨ Servicios Concierge & Post-Venta
            </button>
            <button class="portal-pill-btn ${this.publicClientTab === 'team' ? 'active' : ''}" onclick="app.setPublicClientTab('team')">
              👥 Equipo de Asesores
            </button>
          </div>
        </div>

        <div id="publicClientContentArea">
          <!-- Renderizado dinámico según publicClientTab -->
        </div>
      </div>
    `;

    this.renderPublicClientTabContent();

    // Si venía una propiedad específica en el link, abrir su modal
    if (this.propertyTarget) {
      setTimeout(() => this.openPropertyModal(this.propertyTarget), 400);
    }
  }

  setPublicClientTab(tabName) {
    this.publicClientTab = tabName;
    const container = document.getElementById('publicClientContentArea');
    if (!container) {
      this.render();
      return;
    }
    document.querySelectorAll('.portal-pill-btn').forEach(btn => {
      btn.classList.toggle('active', btn.textContent.includes(tabName === 'catalog' ? 'Catálogo' : (tabName === 'concierge' ? 'Concierge' : 'Equipo')));
    });
    this.renderPublicClientTabContent();
  }

  renderPublicClientTabContent() {
    const area = document.getElementById('publicClientContentArea');
    if (!area) return;

    if (this.publicClientTab === 'catalog') {
      area.innerHTML = `
        <!-- Filtros Rápidos -->
        <div style="max-width:1300px; margin:0 auto 2.5rem; padding:0 1.5rem; position:relative; z-index:20;">
          <div style="background:white; border-radius:var(--radius-lg); padding:1.2rem 1.5rem; box-shadow:var(--shadow-md); border:1px solid var(--border-subtle); display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:1rem; align-items:end;">
            <div class="filter-group">
              <label>🔍 Buscar Inmueble</label>
              <input type="text" id="clientSearch" class="form-control" placeholder="Zona, título, amenidades..." value="${this.filters.search}">
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
      `;

      document.getElementById('clientCategory').value = this.filters.category;
      document.getElementById('clientOperation').value = this.filters.operation;
      this.renderPublicPropertyList();

    } else if (this.publicClientTab === 'concierge') {
      const services = this.data.exclusiveServices || INITIAL_DATA.exclusiveServices;
      area.innerHTML = `
        <div class="concierge-container">
          <div class="concierge-header-banner">
            <span class="tag-badge" style="background:rgba(200,157,53,0.3); color:var(--accent-gold);">Lúmina Concierge Privé</span>
            <h2>Servicios Exclusivos & Asistencia Post-Venta</h2>
            <p>Acompañamos a nuestros clientes más allá de la firma notarial. Disfrute de atención VIP para mudanzas residenciales, preparación estética, sanitización clínica y gestión jurídica.</p>
          </div>

          <div class="concierge-grid">
            ${services.map(svc => `
              <div class="concierge-card">
                <div class="concierge-badge-top">${svc.badge}</div>
                <div class="concierge-icon-circle">
                  ${this.getServiceIconSvg(svc.icon)}
                </div>
                <span style="font-size:0.75rem; font-weight:700; color:var(--accent-gold); text-transform:uppercase; letter-spacing:0.08em;">${svc.category}</span>
                <h3 class="concierge-card-title">${svc.title}</h3>
                <p class="concierge-card-desc">${svc.shortDesc}</p>

                <ul class="concierge-features-list">
                  ${svc.features.map(f => `
                    <li>
                      <svg width="15" height="15" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                      <span>${f}</span>
                    </li>
                  `).join('')}
                </ul>

                <div class="concierge-card-footer">
                  <div class="concierge-pricing">
                    <span>Estimación</span>
                    <strong>${svc.pricingFrom}</strong>
                  </div>
                  <button class="btn btn-gold" style="padding:0.6rem 1.1rem; font-size:0.85rem;" onclick="app.openConciergeModal('${svc.id}')">
                    Cotización Rápida →
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else if (this.publicClientTab === 'team') {
      area.innerHTML = `
        <div class="team-grid-public">
          ${this.data.agents.map(ag => `
            <div class="team-member-card">
              <div class="team-member-cover">
                <img src="${ag.photo}" alt="${ag.name}" class="team-member-photo">
              </div>
              <div class="team-member-body">
                <h3>${ag.name}</h3>
                <div class="role">${ag.role}</div>
                <div style="font-size:0.82rem; color:var(--navy-blue); font-weight:700; margin-bottom:0.4rem;">
                  📜 ${ag.credentials || 'AMPI Certified Specialist'}
                </div>
                <div style="font-size:0.78rem; color:var(--text-muted); margin-bottom:0.8rem;">
                  ⭐ ${ag.experience || '10+ Años de Experiencia'} • ${ag.languages || 'Español, Inglés'}
                </div>
                <p class="bio">${ag.bio || 'Asesor senior dedicado a la intermediación y gestión patrimonial de alto nivel.'}</p>
                
                <div style="margin-top:auto; padding-top:1.25rem; border-top:1px solid var(--border-subtle);">
                  <button class="btn btn-whatsapp" style="width:100%;" onclick="window.open('https://api.whatsapp.com/send?phone=${(ag.whatsapp || ag.phone).replace(/[^0-9]/g, '')}&text=${encodeURIComponent('Hola ' + ag.name + ', me interesa consultar sobre propiedades en cartera.')}', '_blank')">
                    💬 Chatear con ${ag.name.split(' ')[0]} por WhatsApp
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
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

    grid.innerHTML = filtered.map(p => {
      const ag = this.data.agents.find(a => a.id === (p.agentId || 1)) || this.data.agents[0];
      return `
        <article class="prop-card-public">
          <div class="card-img-box">
            <img src="${p.images[0]}" alt="${p.title}">
            <span style="position:absolute; top:12px; left:12px; background:var(--navy-blue); color:white; padding:0.3rem 0.8rem; border-radius:var(--radius-full); font-size:0.75rem; font-weight:700;">
              ${p.operation}
            </span>
            <span style="position:absolute; top:12px; right:12px; background:${p.status === 'Disponible' ? 'rgba(16,185,129,0.9)' : 'rgba(245,158,11,0.9)'}; color:white; padding:0.3rem 0.75rem; border-radius:var(--radius-full); font-size:0.75rem; font-weight:600;">
              ${p.status}
            </span>
            ${p.isOffer ? `<span class="badge-oferta">🔥 OFERTA</span>` : ''}
          </div>
          <div class="card-details">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.3rem;">
              <span style="color:var(--accent-gold); font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em;">
                ${p.category} • Ref: ${p.id}
              </span>
              <div style="display:flex; align-items:center; gap:5px;" title="Asesor: ${ag.name}">
                <img src="${ag.photo}" style="width:22px; height:22px; border-radius:50%; object-fit:cover; border:1px solid var(--accent-gold);">
                <span style="font-size:0.72rem; color:var(--text-muted); font-weight:600;">${ag.name.split(' ')[0]}</span>
              </div>
            </div>

            <h4 style="font-size:1.25rem; color:var(--navy-blue); margin-bottom:0.4rem;">${p.title}</h4>
            <div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1rem;">📍 ${p.location}</div>

            <div style="display:flex; justify-content:space-between; border-top:1px solid var(--border-subtle); border-bottom:1px solid var(--border-subtle); padding:0.75rem 0; margin-bottom:1.2rem; font-size:0.85rem; font-weight:600;">
              ${p.bedrooms > 0 ? `<span>🛏️ ${p.bedrooms} Rec</span>` : ''}
              ${p.bathrooms > 0 ? `<span>🚿 ${p.bathrooms} Baños</span>` : ''}
              <span>📐 ${p.area} m²</span>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:auto; gap:8px; flex-wrap:wrap;">
              <div>
                <div style="font-size:0.7rem; color:var(--text-muted); text-transform:uppercase;">Precio</div>
                <div style="font-size:1.3rem; font-weight:800; color:var(--navy-blue);">$${p.price.toLocaleString()} ${p.currency}</div>
              </div>
              <div style="display:flex; gap:6px;">
                <button class="btn-brochure" onclick="app.openBrochureModal('${p.id}')" title="Descargar Ficha en PDF">
                  <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                  <span>PDF</span>
                </button>
                <button class="btn btn-primary" style="padding:0.45rem 0.9rem;" onclick="app.openPropertyModal('${p.id}')">
                  Ver Ficha
                </button>
              </div>
            </div>
          </div>
        </article>
      `;
    }).join('');
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
            <p>En Lúmina Real Estate combinamos asesores dedicados, producción audiovisual de élite y servicios concierge para acelerar el cierre con total seguridad.</p>
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

            <h3 style="text-align:center; font-size:1.8rem; color:var(--navy-blue); margin-bottom:1.5rem;">¿Por qué Consignar con Lúmina?</h3>
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:1.5rem; margin-bottom:2.5rem;">
              ${this.data.company.about.advantages.map(adv => `
                <div style="background:#F8FAFC; border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:1.5rem;">
                  <h4 style="font-size:1.15rem; color:var(--navy-blue); margin-bottom:0.5rem;">${adv.title}</h4>
                  <p style="color:var(--text-muted); font-size:0.88rem; line-height:1.6;">${adv.desc}</p>
                </div>
              `).join('')}
            </div>

            <!-- Servicios Concierge para Propietarios -->
            <div style="background: linear-gradient(135deg, #090E1D, #16233B); border-radius: var(--radius-md); padding: 1.75rem; color: white;">
              <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
                <div>
                  <span class="tag-badge" style="background:rgba(200,157,53,0.3); color:var(--accent-gold);">Servicio Concierge Incluido</span>
                  <h4 style="font-size:1.3rem; color:white; margin:0.4rem 0;">Acondicionamiento & Blindaje Legal</h4>
                  <p style="color:#94A3B8; font-size:0.88rem; max-width:600px;">
                    Nos encargamos de la sanitización previa, home staging de lujo y dictamen notarial sin costo de anticipo para usted.
                  </p>
                </div>
                <button class="btn btn-gold" onclick="window.open('https://api.whatsapp.com/send?phone=${this.data.company.whatsapp}&text=${encodeURIComponent('Hola, me interesa conocer más sobre los servicios concierge para comercializar mi inmueble.')}', '_blank')">
                  Consultar con un Asesor
                </button>
              </div>
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

              <div style="display:flex; gap:12px; flex-wrap:wrap;">
                <button type="button" class="btn btn-outline" style="flex:1;" onclick="app.navigateBack()">← Regresar</button>
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
  // Modal de Ficha de Propiedad con Módulo del Agente a Cargo y Brochure PDF
  // ==========================================================================
  openPropertyModal(propId) {
    const p = this.data.properties.find(item => item.id === propId);
    if (!p) return;

    this.selectedProperty = p;
    const agent = this.data.agents.find(a => a.id === (p.agentId || 1)) || this.data.agents[0];
    const modal = document.getElementById('propertyModal');
    const content = document.getElementById('modalPropertyContent');

    content.innerHTML = `
      <div style="position:relative;">
        <img id="modalMainImg" style="width:100%; height:360px; object-fit:cover;" src="${p.images[0]}" alt="${p.title}">
        ${p.isOffer ? `<span class="badge-oferta">🔥 OFERTA ESPECIAL</span>` : ''}
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
          <h4 style="font-size:1.15rem; color:var(--navy-blue); margin-bottom:0.6rem;">Amenidades Principales</h4>
          <div style="display:flex; flex-wrap:wrap; gap:8px;">
            ${p.amenities.map(a => `
              <span style="background:#F1F5F9; border:1px solid var(--border-subtle); padding:0.35rem 0.8rem; border-radius:var(--radius-full); font-size:0.82rem; font-weight:600; color:var(--navy-blue);">
                ✓ ${a}
              </span>
            `).join('')}
          </div>
        </div>

        <!-- MÓDULO DEL AGENTE A CARGO (PERFIL DE LUJO) -->
        <div class="agent-profile-card">
          <div class="agent-profile-header">
            <div class="agent-avatar-wrapper">
              <img src="${agent.photo}" class="agent-avatar-img" alt="${agent.name}">
              <span class="agent-verified-badge" title="Asesor Certificado Lúmina">✓</span>
            </div>
            <div class="agent-info-meta">
              <span class="agent-role-tag">${agent.role}</span>
              <h3 class="agent-name-title">${agent.name}</h3>
              <div class="agent-credentials-text">
                <span>📜 ${agent.credentials || 'AMPI Master Certified • Cédula CDMX'}</span><br>
                <span style="color:#CBD5E1; font-size:0.78rem;">⭐ ${agent.experience || '12+ años de experiencia'} • Idiomas: ${agent.languages || 'Español, Inglés'}</span>
              </div>
              <div class="agent-badges-row">
                <span class="agent-badge-chip">Asesor a Cargo</span>
                <span class="agent-badge-chip">Respuesta Inmediata</span>
                <span class="agent-badge-chip">Visitas Personalizadas</span>
              </div>
            </div>
          </div>
          
          <div class="agent-action-box">
            <div class="agent-direct-msg">
              <strong>Atención Directa:</strong> ¿Desea agendar un recorrido privado o solicitar el brochure técnico confidencial?
            </div>
            <button class="btn btn-whatsapp" style="padding:0.75rem 1.4rem; font-size:0.92rem; font-weight:700;" onclick="app.contactAgentWhatsAppDirect('${p.id}', ${agent.id})">
              💬 Chatear con ${agent.name.split(' ')[0]} por WhatsApp
            </button>
          </div>
        </div>

        <!-- Botones de Acción Secundarios -->
        <div style="display:flex; gap:12px; flex-wrap:wrap; align-items:center;">
          <button class="btn btn-outline" style="padding:0.85rem 1.4rem;" onclick="app.closeModal()">
            ← Volver al Catálogo
          </button>
          <button class="btn btn-gold" style="padding:0.85rem 1.4rem; display:flex; align-items:center; gap:8px;" onclick="app.openBrochureModal('${p.id}')">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            <span>Descargar Brochure PDF</span>
          </button>
          <button class="btn btn-outline" style="padding:0.85rem 1.4rem;" onclick="app.openConciergeModal('mudanza-premium')">
            ✨ Servicios Concierge
          </button>
          <button class="btn btn-outline" style="padding:0.85rem 1.4rem; margin-left:auto;" onclick="app.copyPropertyPublicLink('${p.id}')">
            🔗 Copiar Enlace
          </button>
        </div>
      </div>
    `;

    modal.classList.add('active');
  }

  // ==========================================================================
  // MÓDULO DE BROCHURE EN PDF & DOSSIER TÉCNICO
  // ==========================================================================
  openBrochureModal(propId) {
    const p = this.data.properties.find(item => item.id === propId);
    if (!p) return;

    this.selectedProperty = p;
    const agent = this.data.agents.find(a => a.id === (p.agentId || 1)) || this.data.agents[0];
    const previewBox = document.getElementById('brochurePreviewBox');

    if (previewBox) {
      previewBox.innerHTML = `
        <img src="${p.images[0]}" style="width:110px; height:80px; border-radius:var(--radius-sm); object-fit:cover; border:1px solid var(--accent-gold);">
        <div style="flex:1;">
          <span style="color:var(--accent-gold); font-size:0.75rem; font-weight:700; text-transform:uppercase;">${p.category} • Ref: ${p.id}</span>
          <h4 style="font-size:1.1rem; color:white; margin:0.2rem 0;">${p.title}</h4>
          <div style="font-size:0.8rem; color:#94A3B8;">📍 ${p.location} • <strong>$${p.price.toLocaleString()} ${p.currency}</strong></div>
          <div style="font-size:0.75rem; color:var(--accent-gold); margin-top:0.3rem;">Asesor Asignado: ${agent.name}</div>
        </div>
      `;
    }

    document.getElementById('brochureModal').classList.add('active');
  }

  generateAndPrintPDF() {
    const p = this.selectedProperty;
    if (!p) return;
    const agent = this.data.agents.find(a => a.id === (p.agentId || 1)) || this.data.agents[0];

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      this.showToast('Por favor habilite las ventanas emergentes para generar el PDF');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Brochure Oficial - ${p.id} ${p.title} | Lúmina Real Estate</title>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
          body { background: #0A1020; color: #FFFFFF; padding: 2.5rem; line-height: 1.5; }
          .header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #C89D35; padding-bottom: 1.5rem; margin-bottom: 2rem; }
          .brand h1 { font-family: 'Playfair Display', serif; font-size: 2.2rem; color: #FFFFFF; letter-spacing: 0.05em; }
          .brand span { color: #C89D35; font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; }
          .ref-badge { background: rgba(200,157,53,0.15); border: 1px solid #C89D35; color: #C89D35; padding: 0.4rem 1rem; border-radius: 999px; font-weight: 700; font-size: 0.85rem; }
          
          .hero-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 1.25rem; margin-bottom: 2rem; }
          .hero-img-main { width: 100%; height: 380px; object-fit: cover; border-radius: 12px; border: 1px solid rgba(200,157,53,0.4); }
          .hero-sub-imgs { display: flex; flex-direction: column; gap: 1rem; }
          .hero-sub-img { width: 100%; height: 180px; object-fit: cover; border-radius: 10px; border: 1px solid rgba(255,255,255,0.15); }

          .title-section { margin-bottom: 1.75rem; }
          .title-section h2 { font-family: 'Playfair Display', serif; font-size: 2.4rem; color: #FFFFFF; margin-bottom: 0.4rem; }
          .title-section .loc { color: #94A3B8; font-size: 1.05rem; }
          .price-box { font-size: 2.4rem; font-weight: 800; color: #C89D35; font-family: 'Playfair Display', serif; margin-top: 0.5rem; }

          .specs-table { width: 100%; border-collapse: collapse; margin-bottom: 2rem; background: rgba(255,255,255,0.03); border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); }
          .specs-table td { padding: 1rem 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.08); font-size: 0.95rem; }
          .specs-table td strong { color: #C89D35; }

          .desc-box { margin-bottom: 2rem; font-size: 1rem; color: #CBD5E1; line-height: 1.7; background: #0D1629; padding: 1.5rem; border-radius: 10px; border-left: 3px solid #C89D35; }
          
          .amenities-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-bottom: 2.5rem; }
          .amenity-chip { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12); padding: 0.6rem 1rem; border-radius: 8px; font-size: 0.88rem; color: #E2E8F0; }

          .advisor-footer { background: linear-gradient(135deg, #090E1D, #16243F); border: 1px solid #C89D35; border-radius: 12px; padding: 1.5rem 2rem; display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; }
          .advisor-info { display: flex; align-items: center; gap: 1.25rem; }
          .advisor-img { width: 75px; height: 75px; border-radius: 50%; object-fit: cover; border: 2.5px solid #C89D35; }

          .print-bar { position: fixed; bottom: 20px; right: 20px; z-index: 1000; }
          .btn-print { background: #C89D35; color: #080D1A; font-weight: 800; border: none; padding: 1rem 2rem; font-size: 1rem; border-radius: 8px; cursor: pointer; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
          
          @media print {
            body { background: white !important; color: #0F172A !important; padding: 0; }
            .print-bar { display: none !important; }
            .desc-box { background: #F8FAFC !important; color: #334155 !important; }
            .brand h1, .title-section h2 { color: #0F172A !important; }
            .advisor-footer { background: #F8FAFC !important; color: #0F172A !important; }
            .amenity-chip { background: #F1F5F9 !important; color: #0F172A !important; border-color: #CBD5E1 !important; }
            .specs-table td { color: #0F172A !important; }
          }
        </style>
      </head>
      <body>
        <div class="print-bar">
          <button class="btn-print" onclick="window.print()">📥 Imprimir / Guardar como PDF</button>
        </div>

        <div class="header">
          <div class="brand">
            <h1>LÚMINA</h1>
            <span>Real Estate • Dossier Confidencial</span>
          </div>
          <div class="ref-badge">Referencia: ${p.id} • ${p.operation}</div>
        </div>

        <div class="hero-grid">
          <img src="${p.images[0]}" class="hero-img-main" alt="${p.title}">
          <div class="hero-sub-imgs">
            <img src="${p.images[1] || p.images[0]}" class="hero-sub-img">
            <img src="${p.images[2] || p.images[0]}" class="hero-sub-img">
          </div>
        </div>

        <div class="title-section">
          <h2>${p.title}</h2>
          <div class="loc">📍 ${p.addressDetails || p.location}</div>
          <div class="price-box">$${p.price.toLocaleString()} ${p.currency}</div>
        </div>

        <table class="specs-table">
          <tr>
            <td><strong>Categoría:</strong> ${p.category}</td>
            <td><strong>Área Total:</strong> ${p.area} m²</td>
            <td><strong>Operación:</strong> ${p.operation}</td>
          </tr>
          <tr>
            <td><strong>Recámaras:</strong> ${p.bedrooms > 0 ? p.bedrooms : 'N/A'}</td>
            <td><strong>Baños:</strong> ${p.bathrooms > 0 ? p.bathrooms : 'N/A'}</td>
            <td><strong>Estacionamientos:</strong> ${p.parking > 0 ? p.parking : 'N/A'}</td>
          </tr>
        </table>

        <div class="desc-box">
          <h4 style="color:#C89D35; font-size:1.1rem; margin-bottom:0.5rem; font-family:'Playfair Display',serif;">Memoria Descriptiva</h4>
          <p>${p.description}</p>
        </div>

        <h4 style="color:#C89D35; font-size:1.1rem; margin-bottom:0.8rem; font-family:'Playfair Display',serif;">Amenidades y Equipamiento de Lujo</h4>
        <div class="amenities-grid">
          ${p.amenities.map(a => `<div class="amenity-chip">✓ ${a}</div>`).join('')}
        </div>

        <div class="advisor-footer">
          <div class="advisor-info">
            <img src="${agent.photo}" class="advisor-img">
            <div>
              <div style="font-size:0.75rem; color:#C89D35; text-transform:uppercase; font-weight:700; letter-spacing:0.08em;">${agent.role}</div>
              <h3 style="font-size:1.25rem; font-family:'Playfair Display',serif;">${agent.name}</h3>
              <div style="font-size:0.82rem; color:#94A3B8;">${agent.credentials}</div>
              <div style="font-size:0.82rem; color:#94A3B8;">📞 ${agent.phone} • ✉️ ${agent.email}</div>
            </div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:0.8rem; color:#C89D35; font-weight:700;">LÚMINA REAL ESTATE CDMX</div>
            <div style="font-size:0.75rem; color:#94A3B8;">Paseo de la Reforma 480, Piso 28</div>
          </div>
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 600);
  }

  requestBrochureViaWhatsApp() {
    const p = this.selectedProperty;
    if (!p) return;
    const agent = this.data.agents.find(a => a.id === (p.agentId || 1)) || this.data.agents[0];
    const phone = (agent.whatsapp || agent.phone || this.data.company.whatsapp).replace(/[^0-9]/g, '');

    const msg = `Hola ${agent.name.split(' ')[0]}, solicito la ficha técnica y brochure ejecutivo en PDF de la propiedad *${p.title}* (Ref: ${p.id}) con valor de $${p.price.toLocaleString()} ${p.currency}. ¿Me la podría compartir?`;
    window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(msg)}`, '_blank');
    this.closeModal();
  }

  handleEmailBrochureSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('brochureEmailInput').value;
    const p = this.selectedProperty;

    const newLead = {
      id: this.data.leads.length + 1,
      name: `Cliente Brochure (${email.split('@')[0]})`,
      phone: '-',
      email: email,
      type: 'Descarga Brochure PDF',
      propertyInterest: `Brochure: ${p.title} (${p.id})`,
      budget: `$${p.price.toLocaleString()} ${p.currency}`,
      status: 'Ficha Solicitada',
      date: new Date().toISOString().split('T')[0]
    };

    this.data.leads.unshift(newLead);
    this.saveData();
    this.closeModal();
    this.showToast(`¡Ficha técnica de ${p.id} enviada a ${email}!`);
  }

  // Contacto Directo a WhatsApp con mensaje personalizado de Agente
  contactAgentWhatsAppDirect(propId, agentId) {
    const p = this.data.properties.find(item => item.id === propId);
    const agent = this.data.agents.find(a => a.id === agentId) || this.data.agents[0];
    if (!p) return;

    const phone = (agent.whatsapp || agent.phone || this.data.company.whatsapp).replace(/[^0-9]/g, '');
    const msg = `Hola ${agent.name.split(' ')[0]}, me interesa la propiedad "${p.title}" (Ref: ${p.id}) con valor de $${p.price.toLocaleString()} ${p.currency} y quiero agendar una visita.`;
    
    window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(msg)}`, '_blank');
  }

  // Modal de Cotización Rápida Concierge
  openConciergeModal(serviceId) {
    const services = this.data.exclusiveServices || INITIAL_DATA.exclusiveServices;
    const service = services.find(s => s.id === serviceId) || services[0];

    document.getElementById('conciergeServiceId').value = service.id;
    document.getElementById('conciergeServiceName').value = `${service.title} (${service.pricingFrom})`;
    document.getElementById('conciergeModal').classList.add('active');
  }

  handleConciergeQuoteSubmit(e) {
    e.preventDefault();
    const serviceId = document.getElementById('conciergeServiceId').value;
    const serviceName = document.getElementById('conciergeServiceName').value;
    const clientName = document.getElementById('conciergeClientName').value;
    const phone = document.getElementById('conciergeClientPhone').value;
    const location = document.getElementById('conciergeClientLocation').value;
    const desiredDate = document.getElementById('conciergeDesiredDate').value || 'A coordinar';
    const notes = document.getElementById('conciergeNotes').value || 'Sin notas adicionales';

    // Registrar lead en base de datos interna
    const newLead = {
      id: this.data.leads.length + 1,
      name: clientName,
      phone: phone,
      type: 'Cliente Concierge',
      propertyInterest: `Servicio: ${serviceName} (${location})`,
      budget: `Fecha: ${desiredDate} | Notas: ${notes}`,
      status: 'Cotización Concierge',
      date: new Date().toISOString().split('T')[0]
    };

    this.data.leads.unshift(newLead);
    this.saveData();
    this.closeModal();
    this.showToast('¡Solicitud registrada! Conectando con Concierge...');

    // Redirigir a WhatsApp con el mensaje estructurado
    const msg = `Hola Equipo Concierge Lúmina, solicito cotización para el servicio:\n\n✨ *${serviceName}*\n👤 *Nombre:* ${clientName}\n📍 *Inmueble / Zona:* ${location}\n📅 *Fecha Deseada:* ${desiredDate}\n📝 *Detalles:* ${notes}`;
    
    setTimeout(() => {
      window.open(`https://api.whatsapp.com/send?phone=${this.data.company.whatsapp}&text=${encodeURIComponent(msg)}`, '_blank');
    }, 300);
  }

  // Iconos SVG para servicios
  getServiceIconSvg(type) {
    switch (type) {
      case 'truck':
        return `<svg width="26" height="26" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h2m-6 0a1 1 0 001-1v-3"/></svg>`;
      case 'sparkles':
        return `<svg width="26" height="26" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>`;
      case 'scale':
        return `<svg width="26" height="26" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"/></svg>`;
      case 'home':
      default:
        return `<svg width="26" height="26" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>`;
    }
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
    document.getElementById('propertyModal')?.classList.remove('active');
    document.getElementById('newPropertyModal')?.classList.remove('active');
    document.getElementById('newLeadModal')?.classList.remove('active');
    document.getElementById('conciergeModal')?.classList.remove('active');
    document.getElementById('brochureModal')?.classList.remove('active');
  }

  // ==========================================================================
  // Acciones y Handlers de Propiedades & Carga Masiva de Fotos (Solo Administrador)
  // ==========================================================================
  openNewPropertyModal() {
    document.getElementById('propertyForm').reset();
    document.getElementById('propEditId').value = '';
    document.getElementById('propertyModalTitle').textContent = '+ Publicar Nueva Propiedad';
    document.getElementById('btnSaveProp').textContent = 'Guardar y Publicar';
    document.getElementById('propIsOffer').checked = false;
    this.tempPhotos = [];
    this.renderAdminPhotoPreview();
    document.getElementById('newPropertyModal').classList.add('active');
  }

  openEditPropertyModal(propId) {
    const p = this.data.properties.find(item => item.id === propId);
    if (!p) return;

    document.getElementById('propEditId').value = p.id;
    document.getElementById('propertyModalTitle').textContent = `✏️ Editar Inmueble (${p.id})`;
    document.getElementById('btnSaveProp').textContent = 'Guardar Cambios';
    document.getElementById('propTitle').value = p.title || '';
    document.getElementById('propOperation').value = p.operation || 'Venta';
    document.getElementById('propCategory').value = p.category || 'Villa Residencial';
    document.getElementById('propPrice').value = p.price || '';
    document.getElementById('propCurrency').value = p.currency || 'USD';
    document.getElementById('propLocation').value = p.location || '';
    document.getElementById('propBedrooms').value = p.bedrooms || 0;
    document.getElementById('propBathrooms').value = p.bathrooms || 0;
    document.getElementById('propParking').value = p.parking || 0;
    document.getElementById('propArea').value = p.area || 0;
    document.getElementById('propAgentId').value = p.agentId || 1;
    document.getElementById('propAmenities').value = (p.amenities || []).join(', ');
    document.getElementById('propDesc').value = p.description || '';
    document.getElementById('propIsOffer').checked = !!p.isOffer;

    this.tempPhotos = [...(p.images || [])];
    this.renderAdminPhotoPreview();
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
    this.filters.search = document.getElementById('clientSearch')?.value || '';
    this.filters.category = document.getElementById('clientCategory')?.value || 'all';
    this.filters.operation = document.getElementById('clientOperation')?.value || 'all';
    this.renderPublicPropertyList();
  }

  resetPublicFilters() {
    this.filters = { search: '', category: 'all', operation: 'all' };
    this.renderPublicClientTabContent();
  }

  handleFilesSelected(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remainingSlots = 20 - this.tempPhotos.length;
    if (remainingSlots <= 0) {
      this.showToast('Límite de 20 fotografías alcanzado');
      return;
    }

    const filesToLoad = files.slice(0, remainingSlots);
    let loadedCount = 0;

    filesToLoad.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (this.tempPhotos.length < 20) {
          this.tempPhotos.push(event.target.result);
        }
        loadedCount++;
        if (loadedCount === filesToLoad.length) {
          this.renderAdminPhotoPreview();
          this.showToast(`${loadedCount} fotografía(s) agregada(s)`);
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  }

  addPhotoFromUrl() {
    const input = document.getElementById('propUrlInput');
    const url = input?.value.trim();
    if (!url) return;

    if (this.tempPhotos.length >= 20) {
      this.showToast('Límite de 20 fotografías alcanzado');
      return;
    }

    this.tempPhotos.push(url);
    input.value = '';
    this.renderAdminPhotoPreview();
    this.showToast('Fotografía agregada a la galería');
  }

  deletePhoto(index) {
    this.tempPhotos.splice(index, 1);
    this.renderAdminPhotoPreview();
  }

  renderAdminPhotoPreview() {
    const counterBadge = document.getElementById('adminPhotoCounterBadge');
    const grid = document.getElementById('adminPhotoGridPreview');
    if (!counterBadge || !grid) return;

    const count = this.tempPhotos.length;
    counterBadge.textContent = `${count} / 20 Fotos Subidas`;
    counterBadge.classList.toggle('limit-reached', count >= 20);

    if (count === 0) {
      grid.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:1rem; color:var(--text-muted); font-size:0.8rem; font-style:italic;">
          No hay fotografías cargadas aún. Se usará una imagen por defecto si no sube fotos.
        </div>
      `;
      return;
    }

    grid.innerHTML = this.tempPhotos.map((img, idx) => `
      <div class="photo-thumb-item">
        <img src="${img}" alt="Foto ${idx + 1}">
        ${idx === 0 ? '<span class="photo-thumb-cover-tag">Portada</span>' : ''}
        <button type="button" class="photo-thumb-delete-btn" onclick="app.deletePhoto(${idx})" title="Eliminar foto">&times;</button>
      </div>
    `).join('');
  }

  handlePropertySubmit(e) {
    e.preventDefault();
    const editId = document.getElementById('propEditId')?.value;
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
    const amenitiesText = document.getElementById('propAmenities').value;
    const description = document.getElementById('propDesc').value;
    const agentId = parseInt(document.getElementById('propAgentId')?.value) || 1;
    const isOffer = document.getElementById('propIsOffer')?.checked || false;

    const defaultCover = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';
    const photosToSave = this.tempPhotos.length > 0 ? [...this.tempPhotos] : [defaultCover];

    if (editId) {
      // Modo Edición
      const existing = this.data.properties.find(p => p.id === editId);
      if (existing) {
        existing.title = title;
        existing.operation = operation;
        existing.category = category;
        existing.price = price;
        existing.currency = currency;
        existing.location = location;
        existing.bedrooms = bedrooms;
        existing.bathrooms = bathrooms;
        existing.parking = parking;
        existing.area = area;
        existing.agentId = agentId;
        existing.isOffer = isOffer;
        existing.images = photosToSave;
        existing.amenities = amenitiesText ? amenitiesText.split(',').map(a => a.trim()) : existing.amenities;
        existing.description = description;

        this.saveData();
        this.closeModal();
        this.showToast(`Propiedad ${editId} actualizada con éxito (${photosToSave.length} fotos)`);
        this.renderAdminTabContent();
        return;
      }
    }

    // Modo Creación Nueva
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
      images: photosToSave,
      amenities: amenitiesText ? amenitiesText.split(',').map(a => a.trim()) : ["Seguridad 24/7", "Excelente Ubicación"],
      agentId: agentId,
      isOffer: isOffer
    };

    this.data.properties.unshift(newProp);
    this.saveData();
    this.closeModal();
    this.showToast(`¡Propiedad ${newId} publicada con éxito (${photosToSave.length} fotos)!`);
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
