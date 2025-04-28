const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const uniqueValidator = require('mongoose-unique-validator')

const userSchema = new mongoose.Schema({
    userId: { type: String, unique: true, default: uuidv4 },
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
})

userSchema.plugin(uniqueValidator);

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
})

module.exports = mongoose.models.User || mongoose.model('User', userSchema);