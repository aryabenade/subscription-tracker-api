import mongoose from "mongoose"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken"
import { REFRESH_TOKEN_SECRET } from "../config/env.js"

//options for cookies
const options = {
    httpOnly: true,
    secure: true,
}

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong")
    }
}

const registerUser = asyncHandler(async (req, res, next) => {
    // take the input from req.body
    // check if there are any empty fields
    // check if the user exists
    // create the user -db
    // remove the password from the object
    // return the response
    const session = await mongoose.startSession();
    session.startTransaction();

    try {

        const { userName, email, password } = req.body

        if ([userName, email, password].some((val) => val?.trim() == "")) {
            throw new ApiError(400, "All fields are required")
        }


        const existingUser = await User.findOne({ email })

        if (existingUser) throw new ApiError(400, "User already exists")

        const user = await User.create({
            userName,
            email,
            password
        })

        const createdUser = await User.findById(user._id).select("-password")

        if (!createdUser) throw new ApiError(500, "There was an error while creating the user")

        await session.commitTransaction()
        session.endSession()

        res.status(200).json(
            new ApiResponse(201, createdUser, "User created successfully")
        )
    } catch (error) {
        await session.abortTransaction()
        session.endSession()
        next(error)
    }
})

const loginUser = asyncHandler(async (req, res) => {
    //req-body->data
    //username or email
    //find the user
    //password check
    //access and refresh token
    //send cookie
    // console.log(req.body);

    const { email, password } = req.body;
    // console.log(password);

    if (!email) {
        throw new ApiError(400, "email is required")
    }

    const user = await User.findOne({ email })

    if (!user) throw new ApiError(404, "User does not exist. You have to register first.")

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) throw new ApiError(401, "The password you entered is incorrect")

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    //might tweak this later
    const LoggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(
            200,
            {
                user: LoggedInUser, accessToken, refreshToken
            },
            "User logged in successfully"))
})

const logOutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user?._id,
        {
            $unset: {
                "refreshToken": 1
            }
        },
        {
            new: true
        }
    )

    res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User Logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefToken = req.cookies?.refreshToken || req.body.refreshToken

    if (!incomingRefToken) throw new ApiError(401, "Unauthorized request")

    const decodedToken = jwt.verify(incomingRefToken, REFRESH_TOKEN_SECRET)

    const user = await User.findById(decodedToken._id)

    if (!user) throw new ApiError(401, "Invalid Refresh Token")

    if (incomingRefToken !== user?.refreshToken) {
        throw new ApiError(401, "Refresh Token is expired or used")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refresfToken", refreshToken, options)
        .json(new ApiResponse(200, {}, "Access Token refreshed"))

})

export { registerUser, loginUser, logOutUser, refreshAccessToken }