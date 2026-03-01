// components/ProfesionalSelector.js

function ProfesionalSelector({ onSelect, selectedProfesional }) {
    const [profesionales, setProfesionales] = React.useState([]);
    const [cargando, setCargando] = React.useState(true);

    React.useEffect(() => {
        cargarProfesionales();
        
        const handleActualizacion = () => cargarProfesionales();
        window.addEventListener('profesionalesActualizados', handleActualizacion);
        
        return () => {
            window.removeEventListener('profesionalesActualizados', handleActualizacion);
        };
    }, []);

    const cargarProfesionales = async () => {
        setCargando(true);
        try {
            if (window.salonProfesionales) {
                const activos = await window.salonProfesionales.getAll(true);
                setProfesionales(activos || []);
            }
        } catch (error) {
            console.error('Error cargando profesionales:', error);
        } finally {
            setCargando(false);
        }
    };

    if (cargando) {
        return (
            <div className="space-y-4 animate-fade-in">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <div className="icon-users text-amber-500"></div>
                    2. Elegí tu profesional
                </h2>
                <div className="text-center py-8">
                    <div className="animate-spin h-8 w-8 border-b-2 border-amber-600 rounded-full mx-auto"></div>
                    <p className="text-gray-500 mt-4">Cargando profesionales...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-fade-in">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <div className="icon-users text-amber-500"></div>
                2. Elegí tu profesional
                {selectedProfesional && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full ml-2">
                        ✓ Profesional seleccionado
                    </span>
                )}
            </h2>
            
            {profesionales.length === 0 ? (
                <div className="text-center p-8 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-gray-500">No hay profesionales disponibles</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {profesionales.map(prof => (
                        <button
                            key={prof.id}
                            onClick={() => onSelect(prof)}
                            className={`
                                p-4 rounded-xl border-2 text-left transition-all duration-200 transform hover:scale-105
                                ${selectedProfesional?.id === prof.id 
                                    ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-300 shadow-lg' 
                                    : 'border-gray-200 bg-white hover:border-amber-300 hover:shadow-md'}
                            `}
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className={`w-16 h-16 ${prof.color || 'bg-amber-600'} rounded-full flex items-center justify-center text-3xl mb-3 shadow-md`}>
                                    {prof.avatar || '👤'}
                                </div>
                                <span className="font-bold text-gray-800 text-lg block">
                                    {prof.nombre}
                                </span>
                                <span className="text-sm text-gray-500 mt-1">
                                    {prof.especialidad}
                                </span>
                                
                                {selectedProfesional?.id === prof.id && (
                                    <div className="mt-2 text-amber-600 text-sm font-semibold flex items-center gap-1">
                                        <div className="icon-check-circle"></div>
                                        Seleccionado
                                    </div>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            )}
            
            <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg border border-blue-100">
                <p className="flex items-center gap-2">
                    <div className="icon-info text-blue-500"></div>
                    <span>Cada profesional tiene su propia agenda. Después de elegir, podrás ver sus horarios disponibles.</span>
                </p>
            </div>
        </div>
    );
}