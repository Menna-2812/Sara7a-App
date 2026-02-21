import connectDB from "./DB/connection.js";
import { authRouter, userRouter } from "./Modules/index.js";
import { globalErrorHandler, NotFoundException } from './Utils/responnse/error.response.js';
import { successResponse } from './Utils/responnse/success.response.js';

const bootstrap = async (app, express) => {
    app.use(express.json());
    await connectDB();
    app.get("/", (req, res) => {
        return successResponse({
            res,
            statusCode: 201,
            message: "Hello From Success Response"
        });
    });

    app.use("/auth", authRouter);
    app.use("/users", userRouter);

    app.all("/*dummy", (req, res) => {
        throw NotFoundException({ message: "Not Found Handler" });
    });

    app.use(globalErrorHandler);
}

export default bootstrap;