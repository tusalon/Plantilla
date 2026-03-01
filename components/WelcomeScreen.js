// components/WelcomeScreen.js - Versión genérica

function WelcomeScreen({ onStart, onGoBack, cliente, userRol }) {
    const [nombreNegocio, setNombreNegocio] = React.useState('');

    React.useEffect(() => {
        window.getNombreNegocio().then(nombre => {
            setNombreNegocio(nombre);
        });
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-amber-900 flex flex-col items-center justify-center p-8 animate-fade-in">
            {onGoBack && (
                <button
                    onClick={onGoBack}
                    className="absolute top-4 left-4 z-20 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-colors border border-white/20"
                    title="Volver"
                >
                    <i className="icon-arrow-left text-white text-xl"></i>
                </button>
            )}

            <div className="text-center space-y-6 max-w-2xl">
                <div className="w-24 h-24 bg-amber-600 rounded-2xl mx-auto flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform">
                    <i className="icon-calendar text-5xl text-white"></i>
                </div>
                
                <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
                    Bienvenido a <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-600 text-5xl sm:text-6xl">
                        {nombreNegocio}
                    </span>
                </h1>
                
                {cliente && (
                    <p className="text-amber-400 text-lg">
                        👤 {cliente.nombre}
                    </p>
                )}
                
                <p className="text-gray-300 text-lg sm:text-xl max-w-lg mx-auto">
                    Reservá tu turno de manera fácil y rápida
                </p>

                <div className="pt-6">
                    <button 
                        onClick={onStart}
                        className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-lg font-bold py-4 px-10 rounded-full shadow-2xl shadow-amber-600/50 transition-all transform hover:scale-110 active:scale-95 flex items-center justify-center gap-2 mx-auto border border-amber-400/30"
                    >
                        Reservar Turno
                        <i className="icon-arrow-right text-xl"></i>
                    </button>
                </div>
            </div>
        </div>
    );
}