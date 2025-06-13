const jwt = require('jsonwebtoken');

function authenticateJWT(req, res, next) {
    const authHeader = req.headers['authorization'] || req.header('x-auth-token');

    if (!authHeader) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Support Bearer token or direct token in header
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: decoded.userId, userType: decoded.userType };
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token is not valid' });
    }
}

module.exports = { authenticateJWT };
