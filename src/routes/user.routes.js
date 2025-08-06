import { Router } from "express";
import { getAllUsers, getUser } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const userRouter = Router()

userRouter.post('/', (req, res) => res.send({title:"Create a user"}))

userRouter.get('/', getAllUsers)

userRouter.get('/:id', verifyJWT,getUser)

userRouter.put('/:id', (req, res) => res.send("Update user details"))

userRouter.delete('/:id', (req, res) => res.send("Delete a user"))

export { userRouter }