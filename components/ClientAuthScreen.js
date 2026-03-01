// components/ClientAuthScreen.js - Versión genérica

function ClientAuthScreen({ onAccessGranted, onGoBack }) {
    const [nombre, setNombre] = React.useState('');
    const [whatsapp, setWhatsapp] = React.useState('');
    const [solicitudEnviada, setSolicitudEnviada] = React.useState(false);
    const [error, setError] = React.useState('');
    const [clienteAutorizado, setClienteAutorizado] = React.useState(null);
    const [verificando, setVerificando] = React.useState(false);
    const [yaTieneSolicitud, setYaTieneSolicitud] = React.useState(false);
    const [estadoRechazado, setEstadoRechazado] = React.useState(false);
    const [esProfesional, setEsProfesional] = React.useState(false);
    const [profesionalInfo, setProfesionalInfo] = React.useState(null);
    const [esAdmin, setEsAdmin] = React.useState(false);
    const [imagenCargada, setImagenCargada] = React.useState(false);
    const [nombreNegocio, setNombreNegocio] = React.useState('');
    const [telefonoDuenno, setTelefonoDuenno] = React.useState('');

    React.useEffect(() => {
        const cargarDatos = async () => {
            const nombre = await window.getNombreNegocio();
            const tel = await window.getTelefonoDuenno();
            setNombreNegocio(nombre);
            setTelefonoDuenno(tel);
        };
        cargarDatos();
    }, []);

    // Cargar imagen de fondo (opcional - se puede configurar después)
    React.useEffect(() => {
        // Por ahora usamos un gradiente
        setImagenCargada(true);
    }, []);

    const verificarNumero = async (numero) => {
        if (numero.length < 8) {
            setClienteAutorizado(null);
            setYaTieneSolicitud(false);
            setEstadoRechazado(false);
            setEsProfesional(false);
            setProfesionalInfo(null);
            setEsAdmin(false);
            setError('');
            return;
        }
        
        setVerificando(true);
        
        const numeroLimpio = numero.replace(/\D/g, '');
        const numeroCompleto = `53${numeroLimpio}`;
        
        try {
            // Verificar si es ADMIN (dueño) - por teléfono
            const adminPhone = await window.getTelefonoDuenno();
            if (numeroLimpio === adminPhone.replace(/\D/g, '')) {
                setEsAdmin(true);
                setEsProfesional(false);
                setProfesionalInfo(null);
                setClienteAutorizado(null);
                setError('👑 Acceso como administrador detectado');
                setVerificando(false);
                return;
            }
            
            // Verificar si es PROFESIONAL
            if (window.verificarProfesionalPorTelefono) {
                const profesional = await window.verificarProfesionalPorTelefono(numeroLimpio);
                if (profesional) {
                    setEsProfesional(true);
                    setProfesionalInfo(profesional);
                    setEsAdmin(false);
                    setClienteAutorizado(null);
                    setError('👨‍🎨 Acceso como profesional detectado');
                    setVerificando(false);
                    return;
                }
            }
            
            // Verificar si es CLIENTE AUTORIZADO
            const existe = await window.verificarAccesoCliente(numeroCompleto);
            
            if (existe) {
                setClienteAutorizado(existe);
                setYaTieneSolicitud(false);
                setEstadoRechazado(false);
                setEsProfesional(false);
                setEsAdmin(false);
                setError('');
            } else {
                setClienteAutorizado(null);
                
                // Verificar si tiene solicitud pendiente
                if (window.obtenerEstadoSolicitud) {
                    const estado = await window.obtenerEstadoSolicitud(numeroCompleto);
                    
                    if (estado && estado.existe) {
                        if (estado.estado === 'pendiente') {
                            setYaTieneSolicitud(true);
                            setEstadoRechazado(false);
                            setError('Ya tenés una solicitud pendiente.');
                        } 
                        else if (estado.estado === 'rechazado') {
                            setYaTieneSolicitud(false);
                            setEstadoRechazado(true);
                            setError('Tu solicitud anterior fue rechazada.');
                        }
                        else {
                            setYaTieneSolicitud(true);
                            setEstadoRechazado(false);
                            setError('Este número ya fue registrado.');
                        }
                    } else {
                        setYaTieneSolicitud(false);
                        setEstadoRechazado(false);
                        setError('');
                    }
                }
            }
        } catch (err) {
            console.error('Error verificando:', err);
        } finally {
            setVerificando(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!nombre.trim() || !whatsapp.trim()) {
            setError('Completá todos los campos');
            return;
        }
        
        if (esAdmin || esProfesional) {
            return;
        }
        
        setVerificando(true);
        
        const numeroLimpio = whatsapp.replace(/\D/g, '');
        const numeroCompleto = `53${numeroLimpio}`;
        
        try {
            const autorizado = await window.verificarAccesoCliente(numeroCompleto);
            
            if (autorizado) {
                onAccessGranted(autorizado.nombre, numeroCompleto);
                return;
            }
            
            const agregado = await window.agregarClientePendiente(nombre, numeroCompleto);
            
            if (agregado) {
                setSolicitudEnviada(true);
                setError('');
                
                console.log('✅ Solicitud enviada');
            }
        } catch (err) {
            console.error('Error en submit:', err);
            setError('Error en el sistema. Intentá más tarde.');
        } finally {
            setVerificando(false);
        }
    };

    const handleAccesoDirecto = () => {
        if (clienteAutorizado) {
            const numeroLimpio = whatsapp.replace(/\D/g, '');
            const numeroCompleto = `53${numeroLimpio}`;
            onAccessGranted(clienteAutorizado.nombre, numeroCompleto);
        }
    };

    if (solicitudEnviada) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 to-amber-900 flex flex-col items-center justify-center p-6 animate-fade-in">
                <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center mb-6 mx-auto shadow-2xl">
                    <div className="icon-check text-5xl text-white"></div>
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-3 text-center">¡Solicitud Enviada!</h2>
                
                <div className="bg-black/60 backdrop-blur-md p-6 rounded-2xl shadow-2xl max-w-md mb-6 border border-amber-500/30 w-full">
                    <p className="text-gray-200 mb-4 text-center">
                        Gracias por querer ser parte de <span className="font-bold text-amber-400">{nombreNegocio}</span>
                    </p>
                    
                    <div className="bg-black/40 p-4 rounded-xl text-left space-y-2 mb-4 border border-amber-500/20">
                        <p className="text-sm text-gray-300">
                            <span className="font-semibold text-amber-400">📱 Tu número:</span> +{whatsapp}
                        </p>
                        <p className="text-sm text-gray-300">
                            <span className="font-semibold text-amber-400">👤 Nombre:</span> {nombre}
                        </p>
                    </div>
                    
                    <p className="text-gray-300 text-sm text-center">
                        El administrador revisará tu solicitud y te contactará por WhatsApp.
                    </p>
                </div>
                
                <div className="text-sm text-gray-400 text-center">
                    <p>Mientras tanto, puede contactarnos:</p>
                    <a 
                        href={`https://api.whatsapp.com/send?phone=${telefonoDuenno}&text=Hola%20${nombreNegocio}%2C%20consulté%20mi%20solicitud%20de%20acceso`} 
                        target="_blank" 
                        className="text-amber-400 font-medium inline-flex items-center gap-1 mt-2 hover:text-amber-300 transition-colors"
                    >
                        <div className="icon-message-circle"></div>
                        +{telefonoDuenno}
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-amber-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full mx-auto">
                <div className="bg-black/60 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-amber-500/30">
                    <div className="text-center mb-6">
                        <h1 className="text-3xl font-bold text-white">{nombreNegocio}</h1>
                        <p className="text-amber-400 mt-2">Acceso para clientes</p>
                    </div>

                    <h2 className="text-lg font-semibold text-amber-400 mb-4 flex items-center gap-2">
                        <i className="icon-user-plus"></i>
                        Ingresá con tu número
                    </h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Tu nombre completo
                            </label>
                            <input
                                type="text"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                className={`w-full px-4 py-3 rounded-lg border ${
                                    esAdmin || esProfesional 
                                        ? 'bg-gray-800/50 border-gray-600 text-gray-400 cursor-not-allowed' 
                                        : 'bg-gray-800/50 border-gray-600 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
                                } outline-none transition`}
                                placeholder="Ej: Juan Pérez"
                                disabled={esAdmin || esProfesional}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Tu WhatsApp
                            </label>
                            <div className="flex">
                                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-600 bg-gray-800/50 text-gray-400 text-sm">
                                    +53
                                </span>
                                <input
                                    type="tel"
                                    value={whatsapp}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '');
                                        setWhatsapp(value);
                                        verificarNumero(value);
                                    }}
                                    className="w-full px-4 py-3 rounded-r-lg border border-gray-600 bg-gray-800/50 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition"
                                    placeholder="Ej: 51234567"
                                    required
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Ingresá tu número de WhatsApp (8 dígitos después del +53)</p>
                        </div>

                        {verificando && (
                            <div className="text-amber-400 text-sm bg-black/40 p-2 rounded-lg flex items-center gap-2 border border-amber-500/30">
                                <div className="animate-spin h-4 w-4 border-2 border-amber-500 border-t-transparent rounded-full"></div>
                                Verificando...
                            </div>
                        )}

                        {esAdmin && !verificando && (
                            <div className="bg-gradient-to-r from-amber-900/80 to-amber-800/80 border-2 border-amber-500 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                                        A
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-amber-300 font-bold text-xl">
                                            ¡Bienvenido Administrador!
                                        </p>
                                        <p className="text-amber-400 text-sm">
                                            Hacé clic en el botón de abajo para acceder al panel.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {esProfesional && profesionalInfo && !verificando && (
                            <div className="bg-gradient-to-r from-amber-900/80 to-amber-800/80 border-2 border-amber-500 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                                        P
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-amber-300 font-bold text-xl">
                                            ¡Hola {profesionalInfo.nombre}!
                                        </p>
                                        <p className="text-amber-400 text-sm">
                                            Hacé clic en el botón de abajo para acceder a tu panel.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {clienteAutorizado && !verificando && !esAdmin && !esProfesional && (
                            <div className="bg-gradient-to-r from-green-900/80 to-green-800/80 border-2 border-green-500 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                                        C
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-green-300 font-bold text-xl">
                                            ¡Hola {clienteAutorizado.nombre}!
                                        </p>
                                        <p className="text-green-400 text-sm">
                                            Ya tenés acceso para reservar turnos.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {error && !esAdmin && !esProfesional && (
                            <div className={`text-sm p-3 rounded-lg flex items-start gap-2 ${
                                estadoRechazado 
                                    ? 'bg-yellow-900/80 text-yellow-300 border border-yellow-700' 
                                    : 'bg-red-900/80 text-red-300 border border-red-700'
                            }`}>
                                <i className={`${estadoRechazado ? 'icon-alert-circle' : 'icon-triangle-alert'} mt-0.5`}></i>
                                {error}
                            </div>
                        )}

                        <div className="space-y-3 pt-2">
                            {esAdmin && !verificando && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        localStorage.setItem('adminAuth', 'true');
                                        localStorage.setItem('adminUser', 'Administrador');
                                        localStorage.setItem('adminLoginTime', Date.now());
                                        window.location.href = 'admin.html';
                                    }}
                                    className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 text-white py-4 rounded-xl font-bold hover:from-amber-700 hover:to-yellow-700 transition transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg text-lg"
                                >
                                    <span className="text-xl">⚡</span>
                                    Ingresar como Administrador
                                </button>
                            )}

                            {esProfesional && profesionalInfo && !verificando && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        localStorage.setItem('profesionalAuth', JSON.stringify({
                                            id: profesionalInfo.id,
                                            nombre: profesionalInfo.nombre,
                                            telefono: profesionalInfo.telefono,
                                            nivel: profesionalInfo.nivel || 1
                                        }));
                                        window.location.href = 'admin.html';
                                    }}
                                    className="w-full bg-gradient-to-r from-amber-700 to-amber-800 text-white py-4 rounded-xl font-bold hover:from-amber-800 hover:to-amber-900 transition transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg text-lg"
                                >
                                    <span className="text-xl">✂️</span>
                                    Ingresar como Profesional
                                </button>
                            )}

                            {clienteAutorizado && !verificando && !esAdmin && !esProfesional && (
                                <button
                                    type="button"
                                    onClick={handleAccesoDirecto}
                                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg text-lg"
                                >
                                    <span className="text-xl">📱</span>
                                    Ingresar como Cliente
                                </button>
                            )}

                            {!clienteAutorizado && !esAdmin && !esProfesional && !verificando && (
                                <button
                                    type="submit"
                                    disabled={verificando || (yaTieneSolicitud && !estadoRechazado)}
                                    className="w-full bg-gradient-to-r from-amber-600 to-amber-700 text-white py-4 rounded-xl font-bold hover:from-amber-700 hover:to-amber-800 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg text-lg"
                                >
                                    <span className="text-xl">📱</span>
                                    {verificando ? 'Verificando...' : 'Solicitar Acceso como Cliente'}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}