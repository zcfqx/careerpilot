const jwt = require('jsonwebtoken');
const config = require('../config');

function generateToken(userId) {
  return jwt.sign({ userId }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
}

function verifyToken(token) {
  return jwt.verify(token, config.jwt.secret);
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ code: 401, message: '未登录或登录已过期', data: null });
  }
  const token = authHeader.substring(7);
  try {
    const decoded = verifyToken(token);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ code: 401, message: '登录已过期，请重新登录', data: null });
  }
}

module.exports = { generateToken, verifyToken, authMiddleware };
