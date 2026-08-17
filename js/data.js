// Data inicial para InmobiliariaPro
const INITIAL_DATA = {
  company: {
    name: "Lúmina Real Estate",
    tagline: "Alta Gestión Inmobiliaria & Inversiones Exclusivas",
    phone: "+52 55 8765 4321",
    whatsapp: "5215587654321",
    email: "contacto@luminabienesraices.com",
    address: "Paseo de la Reforma 480, Piso 28, CDMX",
    about: {
      story: "Con más de 12 años liderando el mercado inmobiliario premium, en Lúmina combinamos tecnología de vanguardia, inteligencia de mercado y una red global de inversionistas precalificados para garantizar transacciones ágiles, seguras y de máximo rendimiento.",
      stats: [
        { label: "Propiedades Vendidas", value: "+450" },
        { label: "Días Promedio de Cierre", value: "38 días" },
        { label: "Clientes Satisfechos", value: "99.2%" },
        { label: "Volumen Gestionado", value: "$180M USD" }
      ],
      advantages: [
        {
          icon: "shield",
          title: "Blindaje Legal y Notarial",
          desc: "Equipo jurídico especializado que valida títulos, certificados de libertad de gravamen y contratos para operaciones 100% blindadas."
        },
        {
          icon: "camera",
          title: "Marketing Digital & Audiovisual de Élite",
          desc: "Fotografía arquitectónica HDR, video cinematográfico con dron, recorridos virtuales 3D y campañas segmentadas en Google y Meta."
        },
        {
          icon: "users",
          title: "Red de Compradores Precalificados",
          desc: "Cartera activa de clientes con solvencia financiera verificada y fondos de inversión listos para compra inmediata."
        },
        {
          icon: "trending",
          title: "Valuación Científica y Rentabilidad",
          desc: "Análisis comparativo de mercado en tiempo real para establecer el precio óptimo que maximiza su retorno sin estancar el inmueble."
        }
      ],
      process: [
        { step: "01", title: "Inspección y Valuación", desc: "Visitamos su propiedad y realizamos un estudio comparativo de mercado sin costo." },
        { step: "02", title: "Estrategia de Difusión", desc: "Producción audiovisual de lujo y pauta publicitaria en los canales más exclusivos." },
        { step: "03", title: "Filtro de Prospectos", desc: "Solo coordinamos visitas con clientes precalificados financieramente." },
        { step: "04", title: "Cierre y Firma Notarial", desc: "Acompañamiento integral hasta la entrega de llaves y pago garantizado." }
      ]
    }
  },
  agents: [
    { id: 1, name: "Valentina Montoya", role: "Directora Comercial", phone: "+52 55 9876 5432", email: "valentina@luminabienesraices.com", photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80" },
    { id: 2, name: "Rodrigo Alarcón", role: "Senior Real Estate Advisor", phone: "+52 55 1234 5678", email: "rodrigo@luminabienesraices.com", photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80" }
  ],
  properties: [
    {
      id: "PROP-101",
      title: "Villa Serena & Private Infinity Pool",
      category: "Villa Residencial",
      operation: "Venta",
      price: 850000,
      currency: "USD",
      location: "Lomas de Chapultepec, CDMX",
      addressDetails: "Av. Virreyes 740, Sección Lomas",
      bedrooms: 4,
      bathrooms: 5,
      parking: 4,
      area: 580,
      status: "Disponible",
      featured: true,
      description: "Espectacular residencia contemporánea con acabados en mármol Calacatta y carpintería de nogal importado. Dispone de ventanales piso a techo con vista panorámica a jardines privados, alberca climatizada infinity, cava subterránea para 300 botellas, paneles solares y sistema domótico integral Lutron.",
      images: [
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"
      ],
      amenities: ["Alberca Climatizada", "Domótica Completa", "Seguridad 24/7", "Cava Privada", "Jardín Zen", "Paneles Solares", "Gimnasio Equipado"],
      agentId: 1
    },
    {
      id: "PROP-102",
      title: "Sky Penthouse Horizon 360",
      category: "Penthouse",
      operation: "Venta",
      price: 620000,
      currency: "USD",
      location: "Polanco V Sección, CDMX",
      addressDetails: "Campos Elíseos 290",
      bedrooms: 3,
      bathrooms: 3.5,
      parking: 3,
      area: 340,
      status: "Disponible",
      featured: true,
      description: "Exclusivo Penthouse en doble altura con terraza perimetral de 90m2 y vistas ininterrumpidas a la ciudad y áreas verdes. Cocina de diseñador equipada con electrodomésticos Miele, elevador directo al piso y acceso a club privado con spa y helipuerto.",
      images: [
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80"
      ],
      amenities: ["Elevador Directo", "Terraza 360", "Spa & Sauna", "Helipuerto", "Concierge 24 hrs", "Bodega Privada"],
      agentId: 1
    },
    {
      id: "PROP-103",
      title: "Residencia Campestre Los Encinos",
      category: "Casa",
      operation: "Venta",
      price: 490000,
      currency: "USD",
      location: "Valle de Bravo, Edo. Méx.",
      addressDetails: "Club de Golf Avándaro",
      bedrooms: 4,
      bathrooms: 4.5,
      parking: 4,
      area: 450,
      status: "Disponible",
      featured: false,
      description: "Diseño orgánico en maderas nobles, chimenea central de piedra volcánica y amplias áreas sociales integradas al bosque. Incluye jacuzzi exterior, terraza con asador argentino y acción de club de golf incluida.",
      images: [
        "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80"
      ],
      amenities: ["Chimenea Central", "Jacuzzi Exterior", "Club de Golf", "Bosque Privado", "Sistema de Riego"],
      agentId: 2
    },
    {
      id: "PROP-104",
      title: "Apartamento Boutique Reforma Skyline",
      category: "Apartamento",
      operation: "Alquiler",
      price: 3400,
      currency: "USD/mes",
      location: "Cuauhtémoc, CDMX",
      addressDetails: "Paseo de la Reforma 300",
      bedrooms: 2,
      bathrooms: 2,
      parking: 2,
      area: 160,
      status: "Disponible",
      featured: true,
      description: "Completamente amueblado por firma de interiorismo europeo. Cuenta con balcón con vista directa al Monumento a la Independencia, aire acondicionado central, lavandería integrada y servicio de valet parking.",
      images: [
        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80"
      ],
      amenities: ["Amueblado de Lujo", "Valet Parking", "Gimnasio & Alberca", "Vistas Panorámicas", "Pet Friendly"],
      agentId: 2
    },
    {
      id: "PROP-105",
      title: "Terreno Macrolote Premium Paraíso",
      category: "Terreno",
      operation: "Venta",
      price: 1200000,
      currency: "USD",
      location: "Riviera Maya, Quintana Roo",
      addressDetails: "Carretera Federal Tulum - Cancún Km 240",
      bedrooms: 0,
      bathrooms: 0,
      parking: 0,
      area: 2500,
      status: "Disponible",
      featured: false,
      description: "Terreno con uso de suelo residencial mixto de alta densidad, frente de 50 metros sobre avenida principal y accesibilidad inmediata a playas vírgenes y desarrollos ecoturísticos de alto valor.",
      images: [
        "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80"
      ],
      amenities: ["Uso de Suelo Mixto", "Factibilidad de Servicios", "Acceso Carretera", "Escrituración Inmediata"],
      agentId: 1
    },
    {
      id: "PROP-106",
      title: "Pent-Garden Cosmopolita Condesa",
      category: "Apartamento",
      operation: "Venta",
      price: 430000,
      currency: "USD",
      location: "Condesa, CDMX",
      addressDetails: "Av. Amsterdam 185",
      bedrooms: 2,
      bathrooms: 2.5,
      parking: 2,
      area: 210,
      status: "Reservada",
      featured: false,
      description: "Departamento estilo Art Déco renovado con jardín privado interior de 60 m2, techos altos, pisos de madera recuperada y cocina con isla en cuarzo negro.",
      images: [
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80"
      ],
      amenities: ["Jardín Privado", "Techos Altos", "Acabados de Lujo", "Seguridad 24/7"],
      agentId: 2
    }
  ],
  testimonials: [
    {
      author: "Ing. Mauricio Garza",
      role: "Propietario en Lomas de Chapultepec",
      text: "Consigné mi residencia con Lúmina y en menos de 35 días lograron el cierre al 98% del valor pedido. Su asesoría legal y filtro de compradores nos dieron total tranquilidad."
    },
    {
      author: "Dra. Sofía Benítez",
      role: "Inversionista Compradora",
      text: "El link interactivo que me envió mi asesor me permitió comparar opciones y agendar visitas directo por WhatsApp. Un servicio sumamente ágil y de primer nivel."
    }
  ],
  leads: [
    { id: 1, name: "Carlos Villarreal", email: "carlos.v@empresa.com", phone: "+52 55 4321 9876", type: "Comprador", propertyInterest: "PROP-101", budget: "$900,000 USD", status: "En Negociación", date: "2026-08-14" },
    { id: 2, name: "Elena Ramos", email: "elena_ramos@gmail.com", phone: "+52 55 6543 2109", type: "Propietario", propertyInterest: "Consignación Polanco", budget: "$600,000 USD", status: "Evaluación Técnica", date: "2026-08-16" }
  ],
  salesHistory: [
    { id: 1, propertyId: "PROP-099", propertyTitle: "Mansión Las Cumbres", clientName: "Familia Del Valle", price: 1150000, date: "2026-07-20", agent: "Valentina Montoya", commission: 57500 }
  ]
};
