import aj from "../config/arcjet.js";
import { ApiError } from "../utils/ApiError.js";

const arcjetMiddleware = async (req, res, next) => {
    try {
        const decision = await aj.protect(req, { requested: 1 }) //will remove one token from the bucket per request

        if (decision.isDenied()) {
            if (decision.reason.isRateLimit()) return res.status(429).json(new ApiError(429, "Too many requests"))

            if (decision.reason.isBot()) return res.status(403).json(new ApiError(429, "Bot Detected"))

            return res.status(403).json(new ApiError(403, "Access Denied"))
        }
        next()
    } catch (error) {
        console.log(`Arcjet Middleware error:${error}`);
        next(error)
    }
}

export { arcjetMiddleware }