const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');

exports.signup = asyncHandler(async (req, res, next) => {
  try {
    // Create new user with data from request body
    const newUser = await User.create({
      fullName: req.body.fullName,
      email: req.body.email,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
      role: req.body.role || 'user', // If role is provided use it, otherwise default to 'user'
    });

    // Generate JWT token for authentication
    const token = jwt.sign(
      { id: newUser._id },
      process.env.TOKEN_PASSWORD,
      {
        expiresIn: process.env.JWT_EXPIRES || '30d'
      }
    );

    // Set JWT as cookie
    res.cookie('jwt', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      secure: process.env.NODE_ENV === 'production', // Secure in production
      sameSite: 'strict'
    });

    // Return success response with user data (without password)
    const userWithoutPassword = newUser.toObject();
    delete userWithoutPassword.password;
    delete userWithoutPassword.confirmPassword;

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: userWithoutPassword
      }
    });
  } catch (error) {
    // Better error handling
    if (error.code === 11000) {
      // Duplicate key error (likely email)
      return res.status(400).json({
        status: 'fail',
        message: 'Email already in use. Please use a different email or login.'
      });
    }

    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
});

exports.login = asyncHandler(async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Check if email and password were provided
    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide email and password",
      });
    }
    
    // Find the user with the provided email
    const user = await User.findOne({ email }).select("+password");
    
    // Check if user exists
    if (!user) {
      return res.status(401).json({
        status: "fail",
        message: "Incorrect email or password",
      });
    }
    
    // Verify password
    const correct = await user.correctPassword(password, user.password);
    
    // If password is incorrect
    if (!correct) {
      return res.status(401).json({
        status: "fail",
        message: "Incorrect email or password",
      });
    }
    
    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.TOKEN_PASSWORD,
      {
        expiresIn: process.env.JWT_EXPIRES || '30d', // Added default value
      }
    );
    
    // Set cookie
    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      secure: process.env.NODE_ENV === 'production', // Added secure in production
      sameSite: 'strict' // Added same site policy
    });
    
    // Remove password from output
    user.password = undefined;
    
    // Send response
    res.status(200).json({
      status: "success",
      token,
      data: {
        user,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});