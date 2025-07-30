import mongoose from "mongoose";
import { DB_NAME, MONGODB_URI, NODE_ENV } from "../config/env.js";

const connectDB = async () => {
    try {
        await mongoose.connect(`${MONGODB_URI}/${DB_NAME}`)
        console.log(`Database is connected in ${NODE_ENV} mode`);
    } catch (error) {
        // throw new Error("MONGODB connection error")
        console.error("MONGODB CONNECTION ERROR:", error);
        process.exit(1)
    }
}

export { connectDB }