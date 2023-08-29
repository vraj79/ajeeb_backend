const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require("crypto");

const UserSchema = new mongoose.Schema({
    name: { type: String, required: [true, 'Please Enter Your Name'] },
    email: { type: String, required: [true, 'Please Enter Your Email'], unique: true, validate: [validator.isEmail, "Please enter a valid email"] },
    password: { type: String, required: [true, 'Please Enter Your Password'], minLength: [6, "min 6 characters"], select: false },
    avatar: { public_id: { type: String, required: true }, url: { type: String, required: true } },
    role: { type: String, default: "user" },
    createdAt: { type: Date, default: Date.now },
    resetPasswordToken: String,
    resetPasswordExpire: String
})

// hashing password
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next()
    }
    this.password = await bcrypt.hash(this.password, 10);
})

UserSchema.methods.getJWTToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, { expiresIn: process.env.JWT_EXPIRE_TIME })
}

UserSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

UserSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString("hex");

    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    return resetToken
}

const UserModel = mongoose.model("user", UserSchema);

module.exports = UserModel