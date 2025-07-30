const errorMiddleware = async (err, req, res, next) => {
    try {
        let error = { ...err }
        error.message = err.message
        console.log(err);

        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Server Error"
        })

    } catch (error) {
        next(error)
    }
}

export {errorMiddleware}