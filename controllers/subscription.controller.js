import { SERVER_URL } from "../config/env.js";
import { workflowClient } from "../config/upstash.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createSubscription = asyncHandler(async (req, res) => {
    const subscription = await Subscription.create({
        ...req.body,//spread operator
        user: req.user._id
    })

    const { workflowRunId } = await workflowClient.trigger({
        url: `${SERVER_URL}/api/v1/workflows/subscription/reminder`,
        body: {
            subscriptionId: subscription.id
        },
        headers: {
            'content-type': 'application/json'
        },
        retries: 0,
    })

    res.status(201).json(new ApiResponse(201, { subscription, workflowRunId }, "Subscription Created"))
})

const getUserSubscriptions = asyncHandler(async (req, res) => {
    //If someone tries to get the subscriptions from other's account
    if (req.user._id != req.params.id) {
        throw new ApiError(401, "You are not the owner of this account")
    }

    //GET all subscriptions in which the user field matches the userid from params
    const subscriptions = await Subscription.find({ user: req.params.id })

    res.status(200).json(new ApiResponse(200, subscriptions, "All User subscriptions"))
})

export { createSubscription, getUserSubscriptions, }
