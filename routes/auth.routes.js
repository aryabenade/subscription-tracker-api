import { Router } from "express";
import { loginUser, logOutUser, registerUser,refreshAccessToken } from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const authRouter = Router()

authRouter.post('/register', registerUser)

authRouter.post('/login', loginUser)

authRouter.post('/refresh', refreshAccessToken)

//protected routes(authorization)
authRouter.post('/logout', verifyJWT,logOutUser)

export { authRouter }