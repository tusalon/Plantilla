// utils/config-negocio.js - VERSIÓN CON ID FIJO POR REPOSITORIO

console.log('🏢 config-negocio.js cargado');

// ============================================
// 🔥 ÚNICA LÍNEA QUE CAMBIA POR CLIENTE
// ============================================
// ⚠️ IMPORTANTE: Cambiar este ID para cada repositorio cliente
const NEGOCIO_ID_POR_DEFECTO = '5e710464-de34-45ae-9197-cd6eeb748ca0'; // ID de BennetSalón
// ============================================

// Cache de configuración
let configCache = null;
let ultimaActualizacion = 0;
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutos

/**
 * Obtiene el negocio_id - PRIORIDAD: localStorage > ID fijo
 * Esta función SIEMPRE devuelve un ID válido
 */
function getNegocioId() {
    // 1. Si hay sesión de admin logueado, usar ese
    const localId = localStorage.getItem('negocioId');
    if (localId) {
        console.log('📌 Usando ID de localStorage:', localId);
        return localId;
    }
    
    // 2. Si no, usar el ID fijo del código
    console.log('📌 Usando ID fijo del código:', NEGOCIO_ID_POR_DEFECTO);
    return NEGOCIO_ID_POR_DEFECTO;
}

// Hacer la función global INMEDIATAMENTE
window.getNegocioId = getNegocioId;

/**
 * Carga la configuración del negocio desde Supabase
 */
window.cargarConfiguracionNegocio = async function(forceRefresh = false) {
    // AHORA USA LA FUNCIÓN QUE SIEMPRE DEVUELVE ALGO
    const negocioId = getNegocioId();
    
    if (!negocioId) {
        console.error('❌ No hay negocioId disponible');
        return null;
    }

    // Usar caché si no se fuerza refresco
    if (!forceRefresh && configCache && (Date.now() - ultimaActualizacion) < CACHE_DURATION) {
        console.log('📦 Usando cache de configuración');
        return configCache;
    }

    try {
        console.log('🌐 Cargando configuración del negocio desde Supabase...');
        console.log('📡 ID del negocio:', negocioId);
        
        const url = `${window.SUPABASE_URL}/rest/v1/negocios?id=eq.${negocioId}&select=*`;
        
        const response = await fetch(url, {
            headers: {
                'apikey': window.SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                'Cache-Control': 'no-cache'
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Error response:', errorText);
            return null;
        }

        const data = await response.json();
        
        // Guardar en cache
        configCache = data[0] || null;
        ultimaActualizacion = Date.now();
        
        if (configCache) {
            console.log('✅ Configuración cargada:');
            console.log('   - Nombre:', configCache.nombre);
            console.log('   - Teléfono:', configCache.telefono);
            console.log('   - NTFY Topic:', configCache.ntfy_topic);
        } else {
            console.log('⚠️ No se encontró configuración para el negocio');
            
            // Crear configuración por defecto si no existe
            console.log('🔄 Creando configuración por defecto...');
            configCache = {
                id: negocioId,
                nombre: 'BennetSalón',
                telefono: '54438629',
                configurado: true
            };
        }
        
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
    return config?.nombre || 'BennetSalón'; // ← Cambiado el default
};

/**
 * Obtiene el teléfono del dueño
 */
window.getTelefonoDuenno = async function() {
    const config = await window.cargarConfiguracionNegocio();
    return config?.telefono || '54438629'; // ← Cambiado el default
};

/**
 * Obtiene el tópico de ntfy para notificaciones
 */
window.getNtfyTopic = async function() {
    const config = await window.cargarConfiguracionNegocio();
    return config?.ntfy_topic || 'bennetsalon-89d702'; // ← Cambiado el default
};

// Otras funciones (sin cambios)
window.getColorPrincipal = async function() {
    const config = await window.cargarConfiguracionNegocio();
    return config?.color_primario || '#ec4899';
};

window.getColorSecundario = async function() {
    const config = await window.cargarConfiguracionNegocio();
    return config?.color_secundario || '#f9a8d4';
};

window.negocioConfigurado = async function() {
    const config = await window.cargarConfiguracionNegocio();
    return config?.configurado || true; // ← Cambiado a true por defecto
};

// Precargar configuración al inicio
setTimeout(async () => {
    console.log('🔄 Precargando configuración con ID fijo...');
    const config = await window.cargarConfiguracionNegocio();
    if (config) {
        console.log('✅ Configuración precargada:', config.nombre);
    }
}, 500);

console.log('✅ config-negocio.js listo - ID fijo:', NEGOCIO_ID_POR_DEFECTO);