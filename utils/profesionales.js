// utils/profesionales.js - Gestión de profesionales

console.log('👥 profesionales.js cargado');

let profesionalesCache = [];
let ultimaActualizacionProfesionales = 0; // 👈 NOMBRE ÚNICO
const CACHE_DURATION_PROFESIONALES = 5 * 60 * 1000; // 👈 NOMBRE ÚNICO

async function cargarProfesionalesDesdeDB() {
    try {
        const response = await fetch(
            `${window.SUPABASE_URL}/rest/v1/profesionales?select=*&order=id.asc`,
            {
                headers: {
                    'apikey': window.SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        if (!response.ok) return null;
        
        const data = await response.json();
        profesionalesCache = data;
        ultimaActualizacionProfesionales = Date.now(); // 👈 ACTUALIZADO
        return data;
    } catch (error) {
        console.error('Error cargando profesionales:', error);
        return null;
    }
}

window.salonProfesionales = {
    getAll: async function(activos = true) {
        // 👈 USAR LAS NUEVAS VARIABLES
        if (Date.now() - ultimaActualizacionProfesionales < CACHE_DURATION_PROFESIONALES && profesionalesCache.length > 0) {
            if (activos) {
                return profesionalesCache.filter(p => p.activo === true);
            }
            return [...profesionalesCache];
        }
        
        const datos = await cargarProfesionalesDesdeDB();
        if (datos) {
            if (activos) {
                return datos.filter(p => p.activo === true);
            }
            return datos;
        }
        return [];
    },
    
    getById: async function(id) {
        try {
            const response = await fetch(
                `${window.SUPABASE_URL}/rest/v1/profesionales?id=eq.${id}&select=*`,
                {
                    headers: {
                        'apikey': window.SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            if (!response.ok) return null;
            const data = await response.json();
            return data[0] || null;
        } catch (error) {
            console.error('Error obteniendo profesional:', error);
            return null;
        }
    },
    
    crear: async function(profesional) {
        try {
            const response = await fetch(
                `${window.SUPABASE_URL}/rest/v1/profesionales`,
                {
                    method: 'POST',
                    headers: {
                        'apikey': window.SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify({
                        nombre: profesional.nombre,
                        especialidad: profesional.especialidad,
                        color: profesional.color || 'bg-amber-600',
                        avatar: profesional.avatar || '👤',
                        activo: true,
                        telefono: profesional.telefono || null,
                        password: profesional.password || null,
                        nivel: profesional.nivel || 1
                    })
                }
            );
            
            if (!response.ok) return null;
            
            const nuevo = await response.json();
            profesionalesCache = await cargarProfesionalesDesdeDB() || profesionalesCache;
            
            if (window.dispatchEvent) {
                window.dispatchEvent(new Event('profesionalesActualizados'));
            }
            
            return nuevo[0];
        } catch (error) {
            console.error('Error en crear:', error);
            return null;
        }
    },
    
    actualizar: async function(id, cambios) {
        try {
            const response = await fetch(
                `${window.SUPABASE_URL}/rest/v1/profesionales?id=eq.${id}`,
                {
                    method: 'PATCH',
                    headers: {
                        'apikey': window.SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify(cambios)
                }
            );
            
            if (!response.ok) return null;
            
            const actualizado = await response.json();
            profesionalesCache = await cargarProfesionalesDesdeDB() || profesionalesCache;
            
            if (window.dispatchEvent) {
                window.dispatchEvent(new Event('profesionalesActualizados'));
            }
            
            return actualizado[0];
        } catch (error) {
            console.error('Error en actualizar:', error);
            return null;
        }
    },
    
    eliminar: async function(id) {
        try {
            const response = await fetch(
                `${window.SUPABASE_URL}/rest/v1/profesionales?id=eq.${id}`,
                {
                    method: 'DELETE',
                    headers: {
                        'apikey': window.SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            if (!response.ok) return false;
            
            profesionalesCache = await cargarProfesionalesDesdeDB() || profesionalesCache;
            
            if (window.dispatchEvent) {
                window.dispatchEvent(new Event('profesionalesActualizados'));
            }
            
            return true;
        } catch (error) {
            console.error('Error en eliminar:', error);
            return false;
        }
    }
};

setTimeout(async () => {
    await window.salonProfesionales.getAll(false);
}, 1000);