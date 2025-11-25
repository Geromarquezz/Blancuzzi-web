import { toast } from 'react-toastify';

/**
 * Maneja las respuestas de la API incluyendo errores de rate limiting (429)
 * @param {Response} response - Respuesta del fetch
 * @param {Object} data - Datos parseados de la respuesta
 * @returns {Object} - Objeto con success y mensaje
 */
export const handleApiResponse = async (response, data) => {
    // 🚨 Rate Limit excedido (429) - CRÍTICO, mostrar toast automáticamente
    if (response.status === 429) {
        const errorMessage = data.message || 'Demasiadas solicitudes. Por favor, espere unos minutos e intente nuevamente.';
        toast.error(errorMessage, {
            autoClose: 5000,
        });
        return { 
            success: false, 
            message: errorMessage,
            rateLimited: true,
            toastShown: true // Indicador de que ya mostramos el toast
        };
    }

    // Error de autenticación (401) - CRÍTICO, mostrar toast automáticamente
    if (response.status === 401) {
        const errorMessage = data.message || 'Sesión expirada. Por favor, inicie sesión nuevamente.';
        toast.error(errorMessage, {
            autoClose: 4000,
        });
        return { 
            success: false, 
            message: errorMessage,
            unauthorized: true,
            toastShown: true
        };
    }

    // Error de autorización (403) - Verificar si es por falta de verificación
    if (response.status === 403) {
        const errorMessage = data.message || 'No tiene permisos para realizar esta acción.';
        
        // Si es un error de verificación de cuenta, NO mostrar toast aquí
        // Dejar que el componente lo maneje con un mensaje personalizado
        if (data.requiresVerification) {
            return { 
                success: false, 
                message: errorMessage,
                forbidden: true,
                requiresVerification: true,
                toastShown: false // No mostrar toast automático
            };
        }
        
        // Para otros errores 403, mostrar toast
        toast.error(errorMessage, {
            autoClose: 4000,
        });
        return { 
            success: false, 
            message: errorMessage,
            forbidden: true,
            toastShown: true
        };
    }

    // Error del servidor (500+) - CRÍTICO, mostrar toast automáticamente
    if (response.status >= 500) {
        const errorMessage = 'Error del servidor. Por favor, intente más tarde.';
        toast.error(errorMessage, {
            autoClose: 4000,
        });
        return { 
            success: false, 
            message: errorMessage,
            serverError: true,
            toastShown: true
        };
    }

    // Recurso no encontrado (404) - No mostrar toast, dejar que el componente decida
    if (response.status === 404) {
        const errorMessage = data.message || 'Recurso no encontrado.';
        return { 
            success: false, 
            message: errorMessage,
            notFound: true,
            toastShown: false
        };
    }

    // ⚠️ Conflicto (409) - No mostrar toast, dejar que el componente decida
    if (response.status === 409) {
        const errorMessage = data.message || 'Ya existe un conflicto con esta solicitud.';
        return { 
            success: false, 
            message: errorMessage,
            conflict: true,
            toastShown: false
        };
    }

    // Bad Request (400) u otros errores - No mostrar toast, dejar que el componente decida
    if (!response.ok) {
        return { 
            success: false, 
            message: data.message || 'Error en la solicitud',
            toastShown: false
        };
    }

    // ✅ Respuesta exitosa
    return { 
        success: data.success !== undefined ? data.success : true, 
        message: data.message,
        data: data,
        toastShown: false
    };
};

/**
 * Wrapper para fetch con manejo automático de errores
 * @param {string} url - URL del endpoint
 * @param {Object} options - Opciones del fetch
 * @returns {Promise<Object>} - Resultado de la petición
 */
export const apiRequest = async (url, options = {}) => {
    try {
        const response = await fetch(url, {
            ...options,
            credentials: 'include' // Siempre incluir cookies
        });

        const data = await response.json();
        
        return handleApiResponse(response, data);
    } catch (error) {
        console.error('Error en petición API:', error);
        toast.error('Error de conexión con el servidor', {
            autoClose: 3000,
        });
        return { 
            success: false, 
            message: 'Error de conexión con el servidor',
            networkError: true,
            toastShown: true
        };
    }
};
