import { ACCESS_TOKEN_SECRET } from "../config/env.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"

const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
       
        // const token = req.cookies?.accessToken || req.header("Authorization").replace("Bearer ", "")

        if (!token) throw new ApiError(401, "Unauthorized request")

        const decodedToken = jwt.verify(token, ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken._id).select("-password -refreshToken")
        //dont pass password and refreshToken
        if (!user) throw new ApiError(401, "Invalid Access Token")

        req.user = user

        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token")
    }
})

export { verifyJWT }