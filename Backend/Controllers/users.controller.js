import { pool } from '../Database/db.js';

export const getUsers = async (req, res) => {

    if (!req.isAdmin) {
        return res.status(403).json({ success: false, message: 'Acceso restringido a administradores' });
    }

    try {
        const selectFields = `id, name, lastname, phone, email, is_verified, is_blocked, created_at, updated_at`;

        // Por defecto devolvemos los usuarios ordenados por id ascendente
        const result = await pool.query(`SELECT ${selectFields} FROM users ORDER BY id ASC`);
        const users = result.rows.map(user => ({
            ...user,
            role: user.id === 1 ? 'admin' : 'patient'
        }));
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }   
}

// Nuevo endpoint para obtener los datos del usuario autenticado actual
export const getCurrentUser = async (req, res) => {
    try {
        const userId = req.userId; // Viene del middleware de autenticación

        const result = await pool.query(
            'SELECT id, name, lastname, email, phone, is_verified, is_blocked, created_at, updated_at FROM users WHERE id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Usuario no encontrado' 
            });
        }

        const user = {
            ...result.rows[0],
            role: req.userRole
        };

        res.json({
            success: true,
            message: 'Datos del usuario obtenidos exitosamente',
            user: {
                ...result.rows[0],
                role: req.userRole
            }
        });
    } catch (error) {
        console.error('Error obteniendo usuario actual:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error interno del servidor',
            error: error.message 
        });
    }
}

export const updateCurrentUser = async (req, res) => {
    try {
        const userId = req.userId; // Viene del middleware de autenticación
        const { name, lastname, phone } = req.body;

        // Obtener datos actuales del usuario
        const currentUser = await pool.query(
            'SELECT name, lastname, phone FROM users WHERE id = $1',
            [userId]
        );

        if (currentUser.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Usuario no encontrado' 
            });
        }

        // Usar valores actuales si no se proporcionan nuevos
        const updateName = name || currentUser.rows[0].name;
        const updateLastname = lastname || currentUser.rows[0].lastname;
        const updatePhone = phone || currentUser.rows[0].phone;

        // Validaciones condicionales según qué campos se están actualizando
        
        // Si se proporciona name, validarlo
        if (name !== undefined && !name.trim()) {
            return res.status(400).json({ 
                success: false, 
                message: 'El nombre no puede estar vacío' 
            });
        }

        // Si se proporciona lastname, validarlo
        if (lastname !== undefined && !lastname.trim()) {
            return res.status(400).json({ 
                success: false, 
                message: 'El apellido no puede estar vacío' 
            });
        }

        // Si se proporciona phone, validarlo
        if (phone !== undefined) {
            if (!phone.trim()) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'El teléfono no puede estar vacío' 
                });
            }
            if (phone.length < 9) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'El teléfono debe tener al menos 9 caracteres' 
                });
            }
        }

        // Validar que al menos se esté actualizando un campo
        if (name === undefined && lastname === undefined && phone === undefined) {
            return res.status(400).json({ 
                success: false, 
                message: 'Debes proporcionar al menos un campo para actualizar' 
            });
        }

        // Actualizar usuario
        const result = await pool.query(
            `UPDATE users 
             SET name = $1, lastname = $2, phone = $3, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $4 
             RETURNING id, name, lastname, email, phone, is_verified, is_blocked, created_at, updated_at`,
            [updateName, updateLastname, updatePhone, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Usuario no encontrado' 
            });
        }

        res.json({
            success: true,
            message: 'Perfil actualizado exitosamente',
            user: {
                ...result.rows[0],
                role: req.userRole
            }
        });
    } catch (error) {
        console.error('Error actualizando usuario:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error interno del servidor',
            error: error.message 
        });
    }
}

export const updateUserBlockStatus = async (req, res) => {
    if (!req.isAdmin) {
        return res.status(403).json({ success: false, message: 'Acceso restringido a administradores' });
    }

    const { id } = req.params;
    const targetId = Number(id);
    const { blocked } = req.body;

    if (!Number.isInteger(targetId) || targetId <= 0) {
        return res.status(400).json({ success: false, message: 'Identificador de usuario inválido' });
    }

    if (typeof blocked !== 'boolean') {
        return res.status(400).json({ success: false, message: 'El campo "blocked" debe ser booleano' });
    }

    if (targetId === 1) {
        return res.status(400).json({ success: false, message: 'El administrador principal no puede ser bloqueado' });
    }

    try {
        const result = await pool.query(
            `UPDATE users 
             SET is_blocked = $1, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $2 
             RETURNING id, name, lastname, email, phone, is_verified, is_blocked, created_at, updated_at`,
            [blocked, targetId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const user = {
            ...result.rows[0],
            role: targetId === 1 ? 'admin' : 'patient'
        };

        return res.json({
            success: true,
            message: blocked ? 'Usuario bloqueado correctamente' : 'Usuario desbloqueado correctamente',
            data: { user }
        });
    } catch (error) {
        console.error('Error actualizando estado de bloqueo:', error);
        res.status(500).json({ success: false, message: error.message });
    }
}