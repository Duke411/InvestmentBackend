// const mongoose = require('mongoose');
// const validator = require('validator');
// const bcrypt = require('bcrypt');

// // Function to generate a random 12-character alphanumeric account ID
// const generateAccountId = () => {
//   const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
//   let result = '';
//   for (let i = 0; i < 12; i++) {
//     result += chars.charAt(Math.floor(Math.random() * chars.length));
//   }
//   return result;
// };

// const UserSchema = new mongoose.Schema({
//     fullName: {
//         type: String,
//         required: [true, 'Full Name is required'],
//         trim: true
//     },
//     email: {
//         type: String,
//         required: [true, 'Email is required'],
//         unique: true,
//         trim: true,
//         lowercase: true,
//         validate: {
//             validator: validator.isEmail,
//             message: 'Please provide a valid email address'
//         }
//     },
//     password: {
//         type: String,
//         required: [true, 'Password is required'],
//         minlength: [6, 'Password should be at least 6 characters'],
//         select: false
//     },
//     confirmPassword: {
//         type: String,
//         required: [true, 'Please confirm your password'],
//         validate: {
//             validator: function(el) {
//                 return el === this.password;
//             },
//             message: 'Passwords do not match'
//         }
//     },
//     accountBalance: {
//         type: Number,
//         default: 0.00,
//         min: [0, 'Account balance cannot be negative']
//     },
//     totalInvestment: {
//         type: Number,
//         default: 0.00,
//         min: [0, 'Total investment cannot be negative']
//     },
//     totalLoss: {
//         type: Number,
//         default: 0.00,
//         min: [0, 'Total loss cannot be negative']
//     },
//     totalProfit: {
//         type: Number,
//         default: 0.00,
//         min: [0, 'Total profit cannot be negative']
//     },
//     accountId: {
//         type: String,
//         unique: true,
//         trim: true
//     },
//     role: {
//         type: String,
//         enum: ['user', 'admin'],
//         default: 'user'
//     }
// }, {
//     timestamps: true
// });

// // Pre-save middleware to generate accountId and handle password
// UserSchema.pre('save', async function(next) {
//     // Generate accountId if not set
//     if (!this.accountId) {
//         let isUnique = false;
//         let newAccountId;
//         let attempts = 0;
//         const maxAttempts = 5;

//         while (!isUnique && attempts < maxAttempts) {
//             newAccountId = generateAccountId();
//             const existingUser = await mongoose.model('User').findOne({ accountId: newAccountId });
//             if (!existingUser) {
//                 isUnique = true;
//             }
//             attempts++;
//         }

//         if (!isUnique) {
//             return next(new Error('Failed to generate a unique account ID after multiple attempts'));
//         }

//         this.accountId = newAccountId;
//     }

//     // Hash password if modified
//     if (!this.isModified('password')) return next();

//     this.password = await bcrypt.hash(this.password, 12);
//     this.confirmPassword = undefined;
//     next();
// });

// UserSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
//     return await bcrypt.compare(candidatePassword, userPassword);
// };

// const User = mongoose.model('User', UserSchema);

// module.exports = User;

const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

// Function to generate a random 8-character alphanumeric referral code
const generateReferralCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Function to generate a random 12-character alphanumeric account ID
const generateAccountId = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: validator.isEmail,
        message: "Please provide a valid email address",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password should be at least 6 characters"],
      select: false,
    },
    confirmPassword: {
      type: String,
      required: [true, "Please confirm your password"],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: "Passwords do not match",
      },
    },
    accountBalance: {
      type: Number,
      default: 0.0,
      min: [0, "Account balance cannot be negative"],
    },
    totalInvestment: {
      type: Number,
      default: 0.0,
      min: [0, "Total investment cannot be negative"],
    },
    totalLoss: {
      type: Number,
      default: 0.0,
      min: [0, "Total loss cannot be negative"],
    },
    totalProfit: {
      type: Number,
      default: 0.0,
      min: [0, "Total profit cannot be negative"],
    },
    accountId: {
      type: String,
      unique: true,
      trim: true,
    },
    referralCode: {
      type: String,
      unique: true,
      trim: true,
    },
    referredBy: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to generate accountId, referralCode, and handle password
UserSchema.pre("save", async function (next) {
  // Generate accountId if not set
  if (!this.accountId) {
    let isUnique = false;
    let newAccountId;
    let attempts = 0;
    const maxAttempts = 5;

    while (!isUnique && attempts < maxAttempts) {
      newAccountId = generateAccountId();
      const existingUser = await mongoose
        .model("User")
        .findOne({ accountId: newAccountId });
      if (!existingUser) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return next(
        new Error(
          "Failed to generate a unique account ID after multiple attempts"
        )
      );
    }

    this.accountId = newAccountId;
  }

  // Generate referralCode if not set
  if (!this.referralCode) {
    let isUnique = false;
    let newReferralCode;
    let attempts = 0;
    const maxAttempts = 5;

    while (!isUnique && attempts < maxAttempts) {
      newReferralCode = generateReferralCode();
      const existingUser = await mongoose
        .model("User")
        .findOne({ referralCode: newReferralCode });
      if (!existingUser) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return next(
        new Error(
          "Failed to generate a unique referral code after multiple attempts"
        )
      );
    }

    this.referralCode = newReferralCode;
  }

  // Hash password if modified
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

UserSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
