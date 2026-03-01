// components/WelcomeScreen.js - Versión con datos dinámicos

function WelcomeScreen({ onStart, onGoBack, cliente, userRol }) {
    const [config, setConfig] = React.useState(null);
    const [cargando, setCargando] = React.useState(true);

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
    const mensajeBienvenida = config?.mensaje_bienvenida || '¡Bienvenido a nuestro salón!';

    return (
        <div 
            className="min-h-screen flex flex-col items-center justify-center p-8 animate-fade-in"
            style={{
                background: `linear-gradient(135deg, ${colorPrimario}99 0%, ${colorSecundario}99 100%)`
            }}
        >
            {onGoBack && (
                <button
                    onClick={onGoBack}
                    className="absolute top-4 left-4 z-20 w-10 h-10 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/30 transition-colors border border-white/20"
                    title="Volver"
                >
                    <i className="icon-arrow-left text-white text-xl"></i>
                </button>
            )}

            <div className="text-center space-y-6 max-w-2xl">
                {/* Logo del negocio */}
                {config?.logo_url ? (
                    <img 
                        src={config.logo_url} 
                        alt={config.nombre} 
                        className="w-24 h-24 object-contain mx-auto rounded-2xl shadow-2xl"
                    />
                ) : (
                    <div 
                        className="w-24 h-24 rounded-2xl mx-auto flex items-center justify-center shadow-2xl"
                        style={{ backgroundColor: colorPrimario }}
                    >
                        <i className="icon-scissors text-5xl text-white"></i>
                    </div>
                )}
                
                <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
                    Bienvenido a <br/>
                    <span className="text-5xl sm:text-6xl" style={{ color: 'white' }}>
                        {config?.nombre || 'Mi Salón'}
                    </span>
                </h1>
                
                {cliente && (
                    <p className="text-white/90 text-lg">
                        👤 {cliente.nombre}
                    </p>
                )}
                
                <p className="text-white/80 text-lg sm:text-xl max-w-lg mx-auto">
                    {mensajeBienvenida}
                </p>

                <div className="pt-6">
                    <button 
                        onClick={onStart}
                        className="text-white text-lg font-bold py-4 px-10 rounded-full shadow-2xl transition-all transform hover:scale-110 active:scale-95 flex items-center justify-center gap-2 mx-auto border border-white/30"
                        style={{ 
                            backgroundColor: colorPrimario,
                            boxShadow: `0 20px 30px -10px ${colorPrimario}80`
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = colorSecundario}
                        onMouseLeave={(e) => e.target.style.backgroundColor = colorPrimario}
                    >
                        Reservar Turno
                        <i className="icon-arrow-right text-xl"></i>
                    </button>
                </div>
            </div>
        </div>
    );
}