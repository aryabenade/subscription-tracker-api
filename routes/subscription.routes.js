import { Router } from "express";
import { createSubscription, getUserSubscriptions } from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const subscriptionRouter = Router()

subscriptionRouter.get('/', (req, res) => res.send({ title: "Get all subscriptions" }))

subscriptionRouter.get('/:id', (req, res) => res.send({ title: "Get subscriptions details" }))

subscriptionRouter.post('/', verifyJWT, createSubscription)

subscriptionRouter.put('/', (req, res) => res.send({ title: "Update subscription" }))

subscriptionRouter.delete('/', (req, res) => res.send({ title: "Delete subscription" }))

subscriptionRouter.get('/user/:id', verifyJWT, getUserSubscriptions)


export { subscriptionRouter }