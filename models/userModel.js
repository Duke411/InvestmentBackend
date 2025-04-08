const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

//! Creating a schema for the user
const UserSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Full Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: validator.isEmail,
            message: 'Please provide a valid email address'
        }
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password should be at least 6 characters'],
        select: false //! Won't be returned in queries by default
    },
    confirmPassword: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            //! This validator only works on CREATE and SAVE
            validator: function(el) {
                return el === this.password;
            },
            message: 'Passwords do not match'
        }
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    }
}, {
    timestamps: true
});

//! Pre-save middleware to hash the password
UserSchema.pre('save', async function(next) {
    //! Only run this function if password was modified
    if (!this.isModified('password')) return next();
    
    //! Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    
    //! Delete confirmPassword field
    this.confirmPassword = undefined;
    next();
});

//! Instance method to check if password is correct
UserSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', UserSchema);

module.exports  = User;