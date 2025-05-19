const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

exports.protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    console.error('No JWT token found');
    return res.status(401).json({ status: 'fail', message: 'Not authenticated' });
  }
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.TOKEN_PASSWORD);
  } catch (err) {
    console.error('JWT verification error:', err.message);
    return res.status(401).json({ status: 'fail', message: 'Invalid token' });
  }
  const user = await User.findById(decoded.id);
  if (!user) {
    console.error('User not found for ID:', decoded.id);
    return res.status(401).json({ status: 'fail', message: 'User not found' });
  }
  req.user = user;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      console.error('Role not authorized:', req.user.role);
      return res.status(403).json({ status: 'fail', message: 'You do not have permission to perform this action' });
    }
    next();
  };
};