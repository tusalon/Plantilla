// utils/auth-profesionales.js - Autenticación para profesionales

console.log('👤 auth-profesionales.js cargado');

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
        
        if (!response.ok) return null;
        
        const data = await response.json();
        return data?.[0] || null;
    } catch (error) {
        console.error('Error en loginProfesional:', error);
        return null;
    }
};

window.verificarProfesionalPorTelefono = async function(telefono) {
    try {
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
        
        if (!response.ok) return null;
        
        const data = await response.json();
        return data?.[0] || null;
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

window.getReservasPorProfesional = async function(profesionalId, soloActivas = true) {
    try {
        let url = `${window.SUPABASE_URL}/rest/v1/reservas?profesional_id=eq.${profesionalId}&order=fecha.desc,hora_inicio.asc`;
        
        if (soloActivas) {
            url += '&estado=neq.Cancelado';
        }
        
        const response = await fetch(url, {
            headers: {
                'apikey': window.SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) return [];
        
        return await response.json();
    } catch (error) {
        console.error('Error obteniendo reservas:', error);
        return [];
    }
};