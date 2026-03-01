// utils/config-negocio.js - Configuración del negocio (VERSIÓN CORREGIDA)

console.log('🏢 config-negocio.js cargado');

// Cache de configuración (para evitar llamadas innecesarias)
let configCache = null;
let ultimaActualizacion = 0;
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutos

/**
 * Obtiene el negocio_id del localStorage
 */
function getNegocioId() {
    return localStorage.getItem('negocioId');
}

/**
 * Carga la configuración del negocio desde Supabase
 * @param {boolean} forceRefresh - Si es true, ignora el caché
 */
window.cargarConfiguracionNegocio = async function(forceRefresh = false) {
    const negocioId = getNegocioId();
    if (!negocioId) {
        console.error('❌ No hay negocioId en localStorage');
        return null;
    }

    // Usar caché si no se fuerza refresco y tenemos datos recientes
    if (!forceRefresh && configCache && (Date.now() - ultimaActualizacion) < CACHE_DURATION) {
        console.log('📦 Usando cache de configuración');
        return configCache;
    }

    try {
        console.log('🌐 Cargando configuración del negocio desde Supabase...');
        
        // ✅ SIN timestamp extra, solo headers anti-caché
        const url = `${window.SUPABASE_URL}/rest/v1/negocios?id=eq.${negocioId}&select=*`;
        
        console.log('📡 URL:', url);
        
        const response = await fetch(url, {
            headers: {
                'apikey': window.SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            },
            cache: 'no-store' // Importante: no cachear la respuesta
        });

        if (!response.ok) {
            console.error('❌ Error response:', await response.text());
            return null;
        }

        const data = await response.json();
        
        // GUARDAR EN CACHE
        configCache = data[0] || null;
        ultimaActualizacion = Date.now();
        
        console.log('✅ Configuración cargada y cacheada:', configCache?.nombre);
        console.log('📞 Teléfono dueño:', configCache?.telefono);
        console.log('📢 NTFY Topic:', configCache?.ntfy_topic);
        console.log('🎨 Logo URL:', configCache?.logo_url);
        
        return configCache;
    } catch (error) {
        console.error('❌ Error cargando configuración:', error);
        return null;
    }
};

/**
 * Obtiene el nombre del negocio
 */
window.getNombreNegocio = async function() {
    const config = await window.cargarConfiguracionNegocio();
    return config?.nombre || 'Mi Salón';
};

/**
 * Obtiene el teléfono del dueño
 */
window.getTelefonoDuenno = async function() {
    const config = await window.cargarConfiguracionNegocio();
    return config?.telefono || '53357234';
};

/**
 * Obtiene el color principal
 */
window.getColorPrincipal = async function() {
    const config = await window.cargarConfiguracionNegocio();
    return config?.color_primario || '#ec4899';
};

/**
 * Obtiene el color secundario
 */
window.getColorSecundario = async function() {
    const config = await window.cargarConfiguracionNegocio();
    return config?.color_secundario || '#f9a8d4';
};

/**
 * Obtiene el tópico de ntfy para notificaciones
 */
window.getNtfyTopic = async function() {
    const config = await window.cargarConfiguracionNegocio();
    return config?.ntfy_topic || 'lag-barberia';
};

/**
 * Verifica si el negocio ya está configurado
 */
window.negocioConfigurado = async function() {
    const config = await window.cargarConfiguracionNegocio();
    return config?.configurado || false;
};

// Precargar configuración al inicio
setTimeout(async () => {
    const negocioId = getNegocioId();
    if (negocioId) {
        console.log('🔄 Precargando configuración...');
        await window.cargarConfiguracionNegocio();
    }
}, 500);

console.log('✅ config-negocio.js listo');