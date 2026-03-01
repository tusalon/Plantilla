// utils/auth-profesionales.js - Autenticación para profesionales

console.log('👤 auth-profesionales.js cargado');

// ============================================
// FUNCIONES DE AUTENTICACIÓN PARA PROFESIONALES
// ============================================

window.loginProfesional = async function(telefono, password) {
    try {
        console.log('🔐 Intentando login de profesional:', telefono);
        
        const response = await fetch(
            `${window.SUPABASE_URL}/rest/v1/profesionales?telefono=eq.${telefono}&password=eq.${password}&activo=eq.true&select=*`,
            {
                headers: {
                    'apikey': window.SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        if (!response.ok) {
            console.error('Error response:', await response.text());
            return null;
        }
        
        const data = await response.json();
        console.log('📋 Resultado login:', data);
        
        if (data && data.length > 0) {
            const profesional = data[0];
            return profesional;
        }
        return null;
    } catch (error) {
        console.error('Error en loginProfesional:', error);
        return null;
    }
};

window.verificarProfesionalPorTelefono = async function(telefono) {
    try {
        console.log('🔍 Verificando si es profesional (solo teléfono):', telefono);
        
        const response = await fetch(
            `${window.SUPABASE_URL}/rest/v1/profesionales?telefono=eq.${telefono}&activo=eq.true&select=id,nombre,telefono,nivel`,
            {
                headers: {
                    'apikey': window.SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        if (!response.ok) {
            console.error('Error response:', await response.text());
            return null;
        }
        
        const data = await response.json();
        console.log('📋 Resultado verificación:', data);
        
        if (data && data.length > 0) {
            return data[0];
        }
        return null;
    } catch (error) {
        console.error('Error verificando profesional:', error);
        return null;
    }
};

window.getProfesionalAutenticado = function() {
    const auth = localStorage.getItem('profesionalAuth');
    if (auth) {
        try {
            return JSON.parse(auth);
        } catch (e) {
            return null;
        }
    }
    return null;
};

// ============================================
// FUNCIONES PARA OBTENER ROL
// ============================================

window.obtenerRolUsuario = async function(telefono) {
    try {
        console.log('🔍 Obteniendo rol para:', telefono);
        
        const telefonoLimpio = telefono.replace(/\D/g, '');
        
        // Verificar si es dueño (admin)
        // Esto debería venir de la tabla negocios, no hardcodeado
        // Por ahora lo dejamos así temporalmente
        
        // Verificar si es PROFESIONAL
        const profesionalRes = await fetch(
            `${window.SUPABASE_URL}/rest/v1/profesionales?telefono=eq.${telefonoLimpio}&activo=eq.true&select=id,nombre,nivel`,
            {
                headers: {
                    'apikey': window.SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        if (profesionalRes.ok) {
            const profesionales = await profesionalRes.json();
            if (profesionales && profesionales.length > 0) {
                console.log('👨‍🎨 Es profesional:', profesionales[0].nombre);
                return {
                    rol: 'profesional',
                    id: profesionales[0].id,
                    nombre: profesionales[0].nombre,
                    nivel: profesionales[0].nivel || 1
                };
            }
        }
        
        return {
            rol: 'cliente',
            nombre: null
        };
        
    } catch (error) {
        console.error('Error obteniendo rol:', error);
        return { rol: 'cliente' };
    }
};

window.tieneAccesoPanel = async function(telefono) {
    const rol = await window.obtenerRolUsuario(telefono);
    return rol.rol === 'admin' || rol.rol === 'profesional';
};

// ============================================
// FUNCIONES PARA RESERVAS DE PROFESIONALES
// ============================================

window.getReservasPorProfesional = async function(profesionalId, soloActivas = true) {
    try {
        console.log(`📋 Obteniendo reservas para profesional ${profesionalId}`);
        let url = `${window.SUPABASE_URL}/rest/v1/reservas?profesional_id=eq.${profesionalId}&order=fecha.desc,hora_inicio.asc`;
        
        if (soloActivas) {
            url += '&estado=neq.Cancelado';
        }
        
        const response = await fetch(
            url,
            {
                headers: {
                    'apikey': window.SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        if (!response.ok) return [];
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error obteniendo reservas:', error);
        return [];
    }
};

// ============================================
// ALIAS PARA COMPATIBILIDAD (eliminar después)
// ============================================
window.getReservasPorBarbero = window.getReservasPorProfesional;