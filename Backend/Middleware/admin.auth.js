const adminAuth = (req, res, next) => {
    if (!req.isAdmin) {
        return res.status(403).json({
            success: false,
            message: 'Acceso restringido a administradores'
        });
    }

    next();
};

export default adminAuth;
