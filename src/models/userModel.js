import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { appSettings, messages } from "../constants/constant.js";

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, messages.user.validation.nameRequired],
        minlength: [3, messages.user.validation.nameLength],
        maxlength: [50, messages.user.validation.nameLength],
    },
    email: {
        type: String,
        required: [true, messages.user.validation.emailRequired],
        unique: [true, messages.user.unique.emailInUse],
        lowercase: true,
    },
    phoneNumber: {
        type: Number,
        required: [true, messages.user.validation.phoneNumberRequired],
        unique: [true, messages.user.unique.phoneNumberInUse],
        minlength: [10, messages.user.validation.phoneNumberLength],
        maxlength: [15, messages.user.validation.phoneNumberLength],
    },
    password: {
        type: String,
        required: [true, messages.user.validation.passwordRequired],
        minlength: [8, messages.user.validation.passwordLength],
    },
    role: {
        type: String,
        enum: [appSettings.role.admin, appSettings.role.user],
        default: appSettings.role.user,
    },
    flightHours: {
        type: Number,
        default: 0,
    },
    rewardsPoints: {
        type: Number,
        default: 0,
    },
    socialLogins: {
        googleId: { type: String },
        facebookId: { type: String }
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    authkey: {
        type: String,
        default: null
    }
}, { timestamps: true });

// Hash password before saving user
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate and hash a reset password token
userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // Token expires in 10 minutes
    return resetToken;
};

export const User = mongoose.model('User', userSchema);
