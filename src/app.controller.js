import helmet from "helmet";
import connectDB from "./DB/connection.js";
import { connectRedis } from "./DB/redis.connection.js";
import { authRouter, messageRouter, userRouter } from "./Modules/index.js";
import { corsOptions } from "./Utils/cors/cors.utils.js";
import {
  globalErrorHandler,
  NotFoundException,
} from "./Utils/responnse/error.response.js";
import { successResponse } from "./Utils/responnse/success.response.js";
import cors from "cors";
import morgan from "morgan";
import { attachRouterWithLogger } from "./Utils/loggers/morgan.logger.js";
import rateLimit from "express-rate-limit";
import { customRateLimitter } from "./Middleware/rateLimitter.middleware.js";

const bootstrap = async (app, express) => {
  app.use(cors(corsOptions()));
  app.use(express.json(), helmet(), morgan());
  app.use(customRateLimitter);

  await connectDB();
  await connectRedis();

  app.get("/", (req, res) => {
    return successResponse({
      res,
      statusCode: 201,
      message: "Hello From Success Response",
    });
  });

  attachRouterWithLogger(app, "/", authRouter, "access.log");

  app.use("/uploads", express.static("src/uploads"));
  app.use("/auth", authRouter);
  app.use("/users", userRouter);
  app.use("/messages", messageRouter);

  app.all("/*dummy", (req, res) => {
    throw NotFoundException({ message: "Not Found Handler" });
  });

  app.use(globalErrorHandler);
};

export default bootstrap;
