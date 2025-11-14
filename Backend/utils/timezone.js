// Utilidades centralizadas para manejo de zona horaria de Argentina

// Función para obtener la fecha/hora actual en Argentina (UTC-3)
export const getArgentinaDate = (date = null) => {
    const targetDate = date || new Date();
    // Convertir a string con zona horaria de Argentina
    const argentinaDateString = targetDate.toLocaleString('en-US', { 
        timeZone: 'America/Argentina/Buenos_Aires' 
    });
    // Crear nuevo objeto Date con la fecha de Argentina
    return new Date(argentinaDateString);
};

// Función para formatear fecha en formato YYYY-MM-DD en Argentina
export const formatDateArgentina = (date) => {
    const argDate = getArgentinaDate(date);
    const year = argDate.getFullYear();
    const month = String(argDate.getMonth() + 1).padStart(2, '0');
    const day = String(argDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Función para obtener timestamp actual en Argentina
export const getArgentinaTimestamp = () => {
    return getArgentinaDate().getTime();
};

// Función para agregar minutos a una fecha en Argentina
export const addMinutesArgentina = (minutes) => {
    const now = getArgentinaDate();
    return new Date(now.getTime() + minutes * 60 * 1000);
};
