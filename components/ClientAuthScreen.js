// components/ClientAuthScreen.js - VERSIÓN CON REGISTRO AUTOMÁTICO
// Los clientes se registran solos al ingresar sus datos

function ClientAuthScreen({ onAccessGranted, onGoBack }) {
    const [config, setConfig] = React.useState(null);
    const [cargando, setCargando] = React.useState(true);
    const [imagenCargada, setImagenCargada] = React.useState(false);
    const [nombre, setNombre] = React.useState('');
    const [whatsapp, setWhatsapp] = React.useState('');
    const [procesando, setProcesando] = React.useState(false);
    const [error, setError] = React.useState('');
    const [modoRegistro, setModoRegistro] = React.useState('ingreso'); // 'ingreso' o 'registro'

    // Cargar configuración del negocio
    React.useEffect(() => {
        const cargarDatos = async () => {
            const configData = await window.cargarConfiguracionNegocio();
            setConfig(configData);
            setCargando(false);
        };
        cargarDatos();

        // Precargar imagen de fondo
        const img = new Image();
        img.src = 'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=2071&auto=format&fit=crop';
        img.onload = () => setImagenCargada(true);
    }, []);

    // Verificar el número mientras escribe
    const handleWhatsappChange = async (e) => {
        const value = e.target.value.replace(/\D/g, '');
        setWhatsapp(value);
        setError('');
        
        // Si tiene 8 dígitos, verificar si existe
        if (value.length === 8) {
            setProcesando(true);
            try {
                const numeroCompleto = `53${value}`;
                const cliente = await window.verificarAccesoCliente(numeroCompleto);
                
                if (cliente) {
                    setModoRegistro('ingreso');
                    setNombre(cliente.nombre || '');
                } else {
                    setModoRegistro('registro');
                }
            } catch (err) {
                console.error('Error verificando:', err);
            } finally {
                setProcesando(false);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!nombre.trim()) {
            setError('Ingresá tu nombre');
            return;
        }
        
        if (whatsapp.length !== 8) {
            setError('El número debe tener 8 dígitos');
            return;
        }
        
        setProcesando(true);
        setError('');
        
        const numeroCompleto = `53${whatsapp}`;
        
        try {
            // Verificar una última vez si existe
            let cliente = await window.verificarAccesoCliente(numeroCompleto);
            
            if (cliente) {
                // Cliente existe, actualizar nombre si cambió
                if (cliente.nombre !== nombre) {
                    await window.actualizarNombreCliente(numeroCompleto, nombre);
                    cliente.nombre = nombre;
                }
                console.log('✅ Cliente existente, accediendo...');
            } else {
                // Cliente no existe, crearlo
                cliente = await window.crearCliente(nombre, numeroCompleto);
                if (!cliente) {
                    throw new Error('No se pudo crear el cliente');
                }
                console.log('✅ Cliente nuevo creado, accediendo...');
            }
            
            // Acceder al sistema
            onAccessGranted(cliente.nombre || nombre, numeroCompleto);
            
        } catch (err) {
            console.error('Error en submit:', err);
            setError('Error al procesar. Intentá de nuevo.');
        } finally {
            setProcesando(false);
        }
    };

    if (cargando || !imagenCargada) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 to-pink-200">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
            </div>
        );
    }

    const nombreNegocio = config?.nombre || 'Mi Salón';
    const telefonoDuenno = config?.telefono || '53357234';
    const logoUrl = config?.logo_url;
    const sticker = config?.especialidad?.toLowerCase().includes('uñas') ? '💅' : 
                    config?.especialidad?.toLowerCase().includes('pelo') ? '💇‍♀️' : 
                    config?.especialidad?.toLowerCase().includes('belleza') ? '🌸' : '💖';

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Imagen de fondo */}
            <div className="absolute inset-0 z-0">
                <img 
                    src="https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=2071&auto=format&fit=crop" 
                    alt="Fondo de salón" 
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40"></div>
            </div>

            {/* Botón volver */}
            {onGoBack && (
                <button
                    onClick={onGoBack}
                    className="absolute top-4 left-4 z-20 w-10 h-10 bg-pink-500/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors border border-pink-300"
                >
                    <i className="icon-arrow-left text-white text-xl"></i>
                </button>
            )}

            <div className="relative z-10 max-w-md w-full mx-auto">
                <div className="bg-white/20 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-pink-300/50">
                    {/* Logo */}
                    <div className="text-center mb-6">
                        {logoUrl ? (
                            <img 
                                src={logoUrl} 
                                alt={nombreNegocio} 
                                className="w-20 h-20 object-contain mx-auto rounded-xl ring-4 ring-pink-300/50"
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-xl mx-auto flex items-center justify-center bg-pink-500 ring-4 ring-pink-300/50">
                                <span className="text-3xl">{sticker}</span>
                            </div>
                        )}
                        <h1 className="text-3xl font-bold text-white mt-4">{nombreNegocio}</h1>
                        <p className="text-pink-300 mt-1">🌸 Acceso inmediato sin esperas 🌸</p>
                    </div>

                    {/* Indicador de modo */}
                    <div className="mb-4 text-center">
                        {modoRegistro === 'ingreso' && whatsapp.length === 8 && (
                            <div className="bg-green-500/30 text-green-300 p-2 rounded-lg text-sm border border-green-500/30">
                                ✅ ¡Bienvenida de vuelta! Completá tus datos
                            </div>
                        )}
                        {modoRegistro === 'registro' && whatsapp.length === 8 && (
                            <div className="bg-pink-500/30 text-pink-300 p-2 rounded-lg text-sm border border-pink-500/30">
                                ✨ Primera vez por aquí? Completá tu registro
                            </div>
                        )}
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Campo de nombre */}
                        <div>
                            <label className="block text-sm font-medium text-white mb-1">
                                Tu nombre completo
                            </label>
                            <input
                                type="text"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-pink-300/30 bg-white/10 text-white placeholder-pink-200/70 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                                placeholder="Ej: María Pérez"
                                disabled={procesando}
                                required
                            />
                        </div>

                        {/* Campo de WhatsApp */}
                        <div>
                            <label className="block text-sm font-medium text-white mb-1">
                                Tu WhatsApp
                            </label>
                            <div className="flex">
                                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-pink-300/30 bg-white/10 text-pink-300 text-sm">
                                    +53
                                </span>
                                <input
                                    type="tel"
                                    value={whatsapp}
                                    onChange={handleWhatsappChange}
                                    className="w-full px-4 py-3 rounded-r-lg border border-pink-300/30 bg-white/10 text-white placeholder-pink-200/70 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                                    placeholder="51234567"
                                    maxLength="8"
                                    disabled={procesando}
                                    required
                                />
                            </div>
                            <p className="text-xs text-pink-300/70 mt-1">
                                Ingresá tu número de WhatsApp (8 dígitos)
                            </p>
                        </div>

                        {/* Indicador de procesando */}
                        {procesando && (
                            <div className="text-pink-300 text-sm bg-pink-500/20 p-2 rounded-lg flex items-center gap-2 border border-pink-300/30">
                                <div className="animate-spin h-4 w-4 border-2 border-pink-300 border-t-transparent rounded-full"></div>
                                {whatsapp.length === 8 ? 'Verificando...' : 'Procesando...'}
                            </div>
                        )}

                        {/* Mensaje de error */}
                        {error && (
                            <div className="bg-red-500/20 text-red-300 text-sm p-3 rounded-lg flex items-start gap-2 border border-red-500/30">
                                <i className="icon-triangle-alert mt-0.5"></i>
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Botón de acción */}
                        <button
                            type="submit"
                            disabled={procesando || whatsapp.length !== 8}
                            className="w-full bg-pink-500 text-white py-4 rounded-xl font-bold hover:bg-pink-600 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-lg text-lg border-2 border-pink-300"
                        >
                            <span className="text-xl">💅</span>
                            {procesando ? 'Procesando...' : 'Ingresar'}
                            <span className="text-xl">✨</span>
                        </button>
                    </form>

                    {/* Contacto */}
                    <div className="text-sm text-white/60 text-center mt-4">
                        <p>¿Problemas? Contactanos al</p>
                        <a 
                            href={`https://wa.me/${telefonoDuenno}`} 
                            target="_blank" 
                            className="text-pink-300 font-medium inline-flex items-center gap-1 mt-2 hover:text-pink-200 transition-colors"
                        >
                            💬 +{telefonoDuenno}
                        </a>
                    </div>

                    {/* Stickers decorativos */}
                    <div className="absolute -bottom-6 -right-6 text-7xl opacity-20 rotate-12 select-none">💇‍♀️</div>
                    <div className="absolute -top-6 -left-6 text-7xl opacity-20 -rotate-12 select-none">💅</div>
                </div>
            </div>
        </div>
    );
}