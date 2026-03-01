// components/ClientAuthScreen.js - Versión con datos dinámicos

function ClientAuthScreen({ onAccessGranted, onGoBack }) {
    const [config, setConfig] = React.useState(null);
    const [cargando, setCargando] = React.useState(true);
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

    React.useEffect(() => {
        const cargarDatos = async () => {
            const configData = await window.cargarConfiguracionNegocio();
            setConfig(configData);
            setCargando(false);
        };
        cargarDatos();
    }, []);

    if (cargando) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            </div>
        );
    }

    const colorPrimario = config?.color_primario || '#c49b63';
    const colorSecundario = config?.color_secundario || '#f59e0b';
    const nombreNegocio = config?.nombre || 'Mi Salón';
    const telefonoDuenno = config?.telefono || '53357234';
    const logoUrl = config?.logo_url;

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
            // Verificar si es ADMIN (dueño)
            if (numeroLimpio === telefonoDuenno.replace(/\D/g, '')) {
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
            <div 
                className="min-h-screen flex flex-col items-center justify-center p-6 animate-fade-in"
                style={{
                    background: `linear-gradient(135deg, ${colorPrimario} 0%, ${colorSecundario} 100%)`
                }}
            >
                <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-6 mx-auto shadow-2xl">
                    <i className="icon-check text-5xl text-white"></i>
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-3 text-center">¡Solicitud Enviada!</h2>
                
                <div className="bg-black/40 backdrop-blur-md p-6 rounded-2xl shadow-2xl max-w-md mb-6 border border-white/20 w-full">
                    <p className="text-white mb-4 text-center">
                        Gracias por querer ser parte de <span className="font-bold">{nombreNegocio}</span>
                    </p>
                    
                    <div className="bg-black/40 p-4 rounded-xl text-left space-y-2 mb-4 border border-white/10">
                        <p className="text-sm text-white/80">
                            <span className="font-semibold text-white">📱 Tu número:</span> +{whatsapp}
                        </p>
                        <p className="text-sm text-white/80">
                            <span className="font-semibold text-white">👤 Nombre:</span> {nombre}
                        </p>
                    </div>
                    
                    <p className="text-white/80 text-sm text-center">
                        El administrador revisará tu solicitud y te contactará por WhatsApp.
                    </p>
                </div>
                
                <div className="text-sm text-white/60 text-center">
                    <p>Mientras tanto, puede contactarnos:</p>
                    <a 
                        href={`https://api.whatsapp.com/send?phone=${telefonoDuenno}&text=Hola%20${nombreNegocio}%2C%20consulté%20mi%20solicitud%20de%20acceso`} 
                        target="_blank" 
                        className="text-white font-medium inline-flex items-center gap-1 mt-2 hover:text-white/80 transition-colors"
                    >
                        <i className="icon-message-circle"></i>
                        +{telefonoDuenno}
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div 
            className="min-h-screen flex items-center justify-center p-4"
            style={{
                background: `linear-gradient(135deg, ${colorPrimario} 0%, ${colorSecundario} 100%)`
            }}
        >
            <div className="max-w-md w-full mx-auto">
                <div className="bg-black/40 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-white/20">
                    {/* Logo */}
                    <div className="text-center mb-6">
                        {logoUrl ? (
                            <img 
                                src={logoUrl} 
                                alt={nombreNegocio} 
                                className="w-20 h-20 object-contain mx-auto rounded-xl"
                            />
                        ) : (
                            <div 
                                className="w-20 h-20 rounded-xl mx-auto flex items-center justify-center"
                                style={{ backgroundColor: colorPrimario }}
                            >
                                <i className="icon-calendar text-3xl text-white"></i>
                            </div>
                        )}
                        <h1 className="text-3xl font-bold text-white mt-4">{nombreNegocio}</h1>
                        <p className="text-white/80 mt-1">Acceso para clientes</p>
                    </div>

                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <i className="icon-user-plus"></i>
                        Ingresá con tu número
                    </h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-1">
                                Tu nombre completo
                            </label>
                            <input
                                type="text"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/50 focus:ring-2 focus:ring-white/50 focus:border-transparent outline-none transition"
                                placeholder="Ej: Juan Pérez"
                                disabled={esAdmin || esProfesional}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-1">
                                Tu WhatsApp
                            </label>
                            <div className="flex">
                                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-white/20 bg-white/10 text-white/80 text-sm">
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
                                    className="w-full px-4 py-3 rounded-r-lg border border-white/20 bg-white/10 text-white placeholder-white/50 focus:ring-2 focus:ring-white/50 focus:border-transparent outline-none transition"
                                    placeholder="Ej: 51234567"
                                    required
                                />
                            </div>
                            <p className="text-xs text-white/60 mt-1">Ingresá tu número de WhatsApp (8 dígitos después del +53)</p>
                        </div>

                        {verificando && (
                            <div className="text-white text-sm bg-white/10 p-2 rounded-lg flex items-center gap-2 border border-white/20">
                                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                Verificando...
                            </div>
                        )}

                        {esAdmin && !verificando && (
                            <div className="bg-white/20 border border-white/30 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                                        A
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white font-bold text-xl">
                                            ¡Bienvenido Administrador!
                                        </p>
                                        <p className="text-white/80 text-sm">
                                            Hacé clic en el botón de abajo para acceder al panel.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {esProfesional && profesionalInfo && !verificando && (
                            <div className="bg-white/20 border border-white/30 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                                        P
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white font-bold text-xl">
                                            ¡Hola {profesionalInfo.nombre}!
                                        </p>
                                        <p className="text-white/80 text-sm">
                                            Hacé clic en el botón de abajo para acceder a tu panel.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {clienteAutorizado && !verificando && !esAdmin && !esProfesional && (
                            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center text-2xl font-bold text-green-400">
                                        C
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-green-400 font-bold text-xl">
                                            ¡Hola {clienteAutorizado.nombre}!
                                        </p>
                                        <p className="text-green-400/80 text-sm">
                                            Ya tenés acceso para reservar turnos.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {error && !esAdmin && !esProfesional && (
                            <div className={`text-sm p-3 rounded-lg flex items-start gap-2 ${
                                estadoRechazado 
                                    ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' 
                                    : 'bg-red-500/20 text-red-300 border border-red-500/30'
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
                                    className="w-full bg-white text-gray-900 py-4 rounded-xl font-bold hover:bg-white/90 transition transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg text-lg"
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
                                    className="w-full bg-white text-gray-900 py-4 rounded-xl font-bold hover:bg-white/90 transition transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg text-lg"
                                >
                                    <span className="text-xl">✂️</span>
                                    Ingresar como Profesional
                                </button>
                            )}

                            {clienteAutorizado && !verificando && !esAdmin && !esProfesional && (
                                <button
                                    type="button"
                                    onClick={handleAccesoDirecto}
                                    className="w-full bg-white text-gray-900 py-4 rounded-xl font-bold hover:bg-white/90 transition transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg text-lg"
                                >
                                    <span className="text-xl">📱</span>
                                    Ingresar como Cliente
                                </button>
                            )}

                            {!clienteAutorizado && !esAdmin && !esProfesional && !verificando && (
                                <button
                                    type="submit"
                                    disabled={verificando || (yaTieneSolicitud && !estadoRechazado)}
                                    className="w-full bg-white text-gray-900 py-4 rounded-xl font-bold hover:bg-white/90 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg text-lg"
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