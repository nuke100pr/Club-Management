const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-strong-secret-key-here';

const verifyToken = (req, res, next) => {
    // Get token from:
    // 1. Authorization header (Bearer token)
    // 2. Or from query parameter (/?token=xxx)
    // 3. Or from cookies (if you're using them)

    console.log("hello");

    const token = req.headers.authorization?.split(' ')[1] || 
                 req.query.token || 
                 req.cookies.token;
 
    

    if (!token) {
        return res.status(401).json({ 
            success: false,
            message: 'No token provided' 
        });
    }

    try {
        // Verify token
        if(!token)
        {
            next();
        }
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Attach decoded user data to request
        req.user = decoded;
        
        // Continue to the next middleware/controller
        next();
    } catch (err) {
        console.error('JWT verification error:', err);
        
        let message = 'Invalid token';
        if (err.name === 'TokenExpiredError') {
            message = 'Token expired';
        } else if (err.name === 'JsonWebTokenError') {
            message = 'Malformed token';
        }

        return res.status(401).json({ 
            success: false,
            message 
        });
    }
};

module.exports = verifyToken;