const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

// exports.signup = asyncHandler(async (req, res, next) => {
//   try {
//     const newUser = await User.create({
//       fullName: req.body.fullName,
//       email: req.body.email,
//       password: req.body.password,
//       confirmPassword: req.body.confirmPassword,
//       role: req.body.role || 'user',
//     });

//     const token = jwt.sign(
//       { id: newUser._id },
//       process.env.TOKEN_PASSWORD,
//       {
//         expiresIn: process.env.JWT_EXPIRES || '30d'
//       }
//     );

//     res.cookie('jwt', token, {
//       httpOnly: true,
//       maxAge: 30 * 24 * 60 * 60 * 1000,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'strict'
//     });

//     const userWithoutPassword = newUser.toObject();
//     delete userWithoutPassword.password;
//     delete userWithoutPassword.confirmPassword;

//     res.status(201).json({
//       status: 'success',
//       token,
//       data: {
//         user: userWithoutPassword
//       }
//     });
//   } catch (error) {
//     if (error.code === 11000) {
//       return res.status(400).json({
//         status: 'fail',
//         message: 'Email already in use. Please use a different email or login.'
//       });
//     }

//     res.status(400).json({
//       status: 'fail',
//       message: error.message
//     });
//   }
// });

exports.signup = asyncHandler(async (req, res, next) => {
  try {
    const { fullName, email, password, confirmPassword, role, referralCode } =
      req.body;

    // Validate referral code if provided
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (!referrer) {
        return res.status(400).json({
          status: "fail",
          message: "Invalid referral code",
        });
      }
    }

    const newUser = await User.create({
      fullName,
      email,
      password,
      confirmPassword,
      role: role || "user",
      referredBy: referralCode || null,
    });

    const token = jwt.sign({ id: newUser._id }, process.env.TOKEN_PASSWORD, {
      expiresIn: process.env.JWT_EXPIRES || "30d",
    });

    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
    });

    const userWithoutPassword = newUser.toObject();
    delete userWithoutPassword.password;
    delete userWithoutPassword.confirmPassword;

    res.status(201).json({
      status: "success",
      token,
      data: {
        user: userWithoutPassword,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        status: "fail",
        message:
          "Email or referral code already in use. Please use a different email or try again.",
      });
    }

    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
});

exports.login = asyncHandler(async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        status: "fail",
        message: "Incorrect email or password",
      });
    }

    const correct = await user.correctPassword(password, user.password);

    if (!correct) {
      return res.status(401).json({
        status: "fail",
        message: "Incorrect email or password",
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.TOKEN_PASSWORD,
      {
        expiresIn: process.env.JWT_EXPIRES || "30d",
      }
    );

    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    user.password = undefined;

    res.status(200).json({
      status: "success",
      token,
      data: {
        user,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

exports.logout = asyncHandler(async (req, res) => {
  try {
    res.cookie("jwt", "", {
      httpOnly: true,
      expires: new Date(0),
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({
      status: "success",
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

exports.getAllUsers = asyncHandler(async (req, res) => {
  try {
    console.log("Fetching all users...");
    const users = await User.find().select("-password -confirmPassword");
    console.log("Users fetched:", users.length);

    res.status(200).json({
      status: "success",
      results: users.length,
      data: {
        users,
      },
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

exports.updateUserProfile = asyncHandler(async (req, res) => {
  try {
    const {
      fullName,
      email,
      accountBalance,
      totalInvestment,
      totalProfit,
      totalLoss,
    } = req.body;

    if (
      req.body.password ||
      req.body.confirmPassword ||
      req.body.role ||
      req.body.accountId
    ) {
      return res.status(400).json({
        status: "fail",
        message:
          "Cannot update password, role, or accountId through this endpoint",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      {
        fullName,
        email,
        accountBalance,
        totalInvestment,
        totalProfit,
        totalLoss,
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password -confirmPassword");

    if (!updatedUser) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    console.error("Update user profile error:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        status: "fail",
        message: "Email already in use. Please use a different email.",
      });
    }

    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
});

exports.deleteUser = asyncHandler(async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.userId);

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// ! New Endpoint

exports.creditReferrer = asyncHandler(async (req, res) => {
  try {
    const { userId, fundingAmount } = req.body;

    // Find the user who was referred
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    // Check if the user has a referredBy code
    if (!user.referredBy) {
      return res.status(400).json({
        status: "fail",
        message: "User was not referred",
      });
    }

    // Find the referrer
    const referrer = await User.findOne({ referralCode: user.referredBy });
    if (!referrer) {
      return res.status(400).json({
        status: "fail",
        message: "Referrer not found",
      });
    }

    // Calculate 10% of the funding amount
    const referralBonus = fundingAmount * 0.1;

    // Update referrer's account balance
    referrer.accountBalance += referralBonus;
    await referrer.save();

    // Clear the referredBy code
    user.referredBy = null;
    await user.save();

    res.status(200).json({
      status: "success",
      message: `Referrer credited with $${referralBonus.toFixed(2)}`,
    });
  } catch (error) {
    console.error("Credit referrer error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});
