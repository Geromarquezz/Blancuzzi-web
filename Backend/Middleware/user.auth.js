import jwt from 'jsonwebtoken';

const userAuth = async (req, res, next) => {

    const { token } = req.cookies;

    if (!token) {
        // No loguear error, es normal en páginas públicas
        return res.status(401).json({ success: false, message: "Sesion cerrada. Inicia sesion de nuevo" })
    }

    try {

        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

        const userId = Number(tokenDecode.id);

        if (Number.isInteger(userId) && userId > 0) {
            req.userId = userId;
            req.isAdmin = userId === 1;
            req.userRole = req.isAdmin ? 'admin' : 'patient';
        } else {
            console.log('No hay ID en el token');
            return res.status(401).json({ success: false, message: 'Sesión cerrada. Inicia sesión de nuevo' });
        }

        next();

    } catch (error) {
        console.log('Error verificando token:', error.message);
        return res.status(401).json({ success: false, message: error.message })
    }

}

export default userAuth;