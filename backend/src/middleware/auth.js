const jwt = require('jsonwebtoken');
const { User, TeacherProfile, StudentProfile } = require('../models');

const protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key');

    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] },
      include: [
        { model: TeacherProfile },
        { model: StudentProfile },
      ],
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User not found or account deactivated' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token verification failed', error: error.message });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role '${req.user ? req.user.role : 'none'}' is not authorized to access this route`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
