import jwt from 'jsonwebtoken';

export function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ msg: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ msg: 'Unauthorized' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET is not configured');
      return res.status(500).json({ msg: 'Internal server error' });
    }

    // Verify token and extract payload
    const decoded = jwt.verify(token, secret);
    req.user = decoded; // Contains: id, role, and optional flags like needsPasswordSetup
    return next();
  } catch (error) {
    // Handle expired tokens, invalid signatures, etc.
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ msg: 'Unauthorized' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ msg: 'Unauthorized' });
    }
    return res.status(401).json({ msg: 'Unauthorized' });
  }
}