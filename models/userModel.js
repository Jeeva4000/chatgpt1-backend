const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const JWT = require("jsonwebtoken");
const cookie = require("cookie");

// Define the JWT_REFRESH_EXPIREIN variable
// const JWT_REFRESH_EXPIREIN = '15day';

// Define the user schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    customerID: {
        type: String,
        default: ""
    },
    subscription: {
        type: String,
        default: ""
    }
});

// Hash the password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Match the password
userSchema.methods.matchPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

// Sign JWT tokens
userSchema.methods.getSignedToken = function (res) {
    const accessToken = JWT.sign(
        { id: this._id },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: process.env.JWT_ACCESS_EXPIREIN }
    );
    const refreshToken = JWT.sign(
        { id: this._id },
        process.env.JWT_REFRESH_TOKEN,
        { expiresIn: JWT_REFRESH_EXPIREIN }
    );
    res.cookie('refreshToken', refreshToken, { maxAge: 86400 * 7000, httpOnly: true });
}

const User = mongoose.model("User", userSchema);

module.exports = User;
