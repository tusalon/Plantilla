// components/WelcomeScreen.js - Versión femenina con imagen de fondo

function WelcomeScreen({ onStart, onGoBack, cliente, userRol }) {
    const [config, setConfig] = React.useState(null);
    const [cargando, setCargando] = React.useState(true);
    const [imagenCargada, setImagenCargada] = React.useState(false);

    React.useEffect(() => {
        const cargarDatos = async () => {
            const configData = await window.cargarConfiguracionNegocio();
            setConfig(configData);
            setCargando(false);
        };
        cargarDatos();

        // Precargar la imagen de fondo
        const img = new Image();
        img.src = 'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=2071&auto=format&fit=crop';
        img.onload = () => setImagenCargada(true);
    }, []);

    if (cargando || !imagenCargada) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-pink-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
            </div>
        );
    }

    const colorPrimario = '#ec4899'; // Rosado principal
    const colorSecundario = '#f9a8d4'; // Rosado claro
    const sticker = config?.especialidad?.toLowerCase().includes('uñas') ? '💅' : '💇‍♀️';

    return (
        <div 
            className="min-h-screen flex flex-col items-center justify-center p-8 animate-fade-in relative overflow-hidden"
        >
            {/* Imagen de fondo */}
            <div className="absolute inset-0 z-0">
                <img 
                    src="https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=2071&auto=format&fit=crop"
                    alt="Fondo de salón" 
                    className="w-full h-full object-cover"
                />
                {/* Overlay oscuro para mejorar legibilidad */}
                <div className="absolute inset-0 bg-black/40"></div>
            </div>

            {/* Botón volver */}
            {onGoBack && (
                <button
                    onClick={onGoBack}
                    className="absolute top-4 left-4 z-20 w-10 h-10 bg-pink-500/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors border border-pink-300"
                    title="Volver"
                >
                    <i className="icon-arrow-left text-white text-xl"></i>
                </button>
            )}

            {/* Contenido principal */}
            <div className="relative z-10 text-center space-y-6 max-w-2xl bg-white/20 backdrop-blur-md p-10 rounded-3xl shadow-2xl border border-pink-300/50">
                {/* Logo o sticker */}
                {config?.logo_url ? (
                    <img 
                        src={config.logo_url} 
                        alt={config.nombre} 
                        className="w-24 h-24 object-contain mx-auto rounded-2xl shadow-2xl ring-4 ring-pink-300/50"
                    />
                ) : (
                    <div 
                        className="w-24 h-24 rounded-2xl mx-auto flex items-center justify-center shadow-2xl ring-4 ring-pink-300/50"
                        style={{ backgroundColor: colorPrimario }}
                    >
                        <span className="text-5xl">{sticker}</span>
                    </div>
                )}
                
                <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight drop-shadow-lg">
                    Bienvenida a <br/>
                    <span className="text-5xl sm:text-6xl text-pink-300">
                        {config?.nombre || 'Mi Salón'}
                    </span>
                </h1>
                
                {cliente && (
                    <p className="text-white/90 text-lg bg-black/20 inline-block px-4 py-1 rounded-full">
                        ✨ {cliente.nombre} ✨
                    </p>
                )}
                
                <p className="text-white/90 text-lg sm:text-xl max-w-lg mx-auto">
                    {config?.mensaje_bienvenida || '¡Bienvenida a nuestro salón!'}
                </p>

                <div className="pt-6">
                    <button 
                        onClick={onStart}
                        className="text-white text-lg font-bold py-4 px-10 rounded-full shadow-2xl transition-all transform hover:scale-110 active:scale-95 flex items-center justify-center gap-2 mx-auto border-2 border-pink-300"
                        style={{ 
                            backgroundColor: colorPrimario,
                        }}
                    >
                        <span>💖</span>
                        Reservar Turno
                        <span>✨</span>
                    </button>
                </div>
            </div>

            {/* Stickers flotantes decorativos (opcional) */}
            <div className="absolute bottom-4 left-4 text-4xl opacity-30 rotate-12">💅</div>
            <div className="absolute top-4 right-4 text-4xl opacity-30 -rotate-12">🌸</div>
        </div>
    );
}