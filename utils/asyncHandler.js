const asyncHandler = (reqFunction) => async (req, res, next) => {
    try {
        await reqFunction(req, res, next)
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        })
    }
}

export { asyncHandler }