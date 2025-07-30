import express, { urlencoded } from "express"
import cookieParser from "cookie-parser"
import { PORT } from "./config/env.js"
import { connectDB } from "./db/mongodb.js"
import { userRouter } from "./routes/user.routes.js"
import { subscriptionRouter } from "./routes/subscription.routes.js"
import { errorMiddleware } from "./middlewares/error.middleware.js"
import { authRouter } from "./routes/auth.routes.js"
import { arcjetMiddleware } from "./middlewares/arcjet.middleware.js"
import { workflowRouter } from "./routes/workflow.routes.js"

const app = express()

app.use(express.json())
app.use(urlencoded({ extended: true }))
app.use(cookieParser())
app.use(arcjetMiddleware)

app.use('/api/v1/subscriptions', subscriptionRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/workflows', workflowRouter)

app.get('/', (req, res) => {
    res.json({
        message: "Lets start this project and learn something new"
    })
})

app.use(errorMiddleware)


app.listen(PORT, async () => {
    console.log(`Server is listening at http://localhost:${PORT}`);
    await connectDB()
})

