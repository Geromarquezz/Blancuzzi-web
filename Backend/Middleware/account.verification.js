import { pool } from '../Database/db.js';

// Middleware para verificar que la cuenta del usuario esté verificada
const requireVerifiedAccount = async (req, res, next) => {
    
    // Este middleware debe usarse DESPUÉS de userAuth, 
    // ya que necesita req.userId que es establecido por userAuth
    if (!req.userId) {
        return res.status(401).json({ 
            success: false, 
            message: "No autenticado. Por favor inicia sesión" 
        });
    }

    try {
        // Buscar usuario en la base de datos
        const userResult = await pool.query(
            'SELECT is_verified FROM users WHERE id = $1', 
            [req.userId]
        );
        
        const user = userResult.rows[0];

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "Usuario no encontrado" 
            });
        }

        // Verificar si la cuenta está verificada
        if (!user.is_verified) {
            return res.status(403).json({ 
                success: false, 
                message: "Debes verificar tu cuenta antes de poder agendar turnos.",
                requiresVerification: true
            });
        }

        // Si está verificada, continuar con la siguiente función
        next();

    } catch (error) {
        console.error('Error en middleware de verificación:', error);
        return res.status(500).json({ 
            success: false, 
            message: "Error al verificar el estado de la cuenta" 
        });
    }
};

export default requireVerifiedAccount;
