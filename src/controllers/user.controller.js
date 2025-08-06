import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select("-password -refreshToken")

    res.status(200).json(new ApiResponse(200, users, "All users fetched"))
})

const getUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select("-password -refreshToken")

    if (!user) throw new ApiError(404,"User not found")

    res.status(200).json(new ApiResponse(200, user, "All users fetched"))
})
export { getAllUsers, getUser }