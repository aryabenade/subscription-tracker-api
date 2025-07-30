import mongoose from "mongoose";
import {
    ACCESS_TOKEN_EXPIRY, ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_EXPIRY, REFRESH_TOKEN_SECRET
} from "../config/env.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"


const userSchema = new mongoose.Schema(
    {
        userName: {
            type: String,
            required: [true, "Please enter your name"],
            minLength: 2,
            maxLength: 50
        },
        email: {
            type: String,
            required: [true, "Please enter your email"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/\S+@\S+\.\S+/, 'Please fill a valid email address'],
        },
        password: {
            type: String,
            required: true,
            minLength: 6,
            maxLength: 20,
        },
        refreshToken: {
            type: String
        }
    }, { timestamps: true })

// Function for hashing passwords
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10)
})//Dont forget to assign

//Function for checking passwords
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = async function () {
    return jwt.sign(
        {
            _id: this._id
        },
        ACCESS_TOKEN_SECRET,
        {
            expiresIn: ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = async function () {
    return jwt.sign(
        {
            _id: this._id
        },
        REFRESH_TOKEN_SECRET,
        {
            expiresIn: REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)