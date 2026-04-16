import { rateLimitKey, get, set } from "../DB/redis.service.js";

const RATE_LIMIT = 3;
const WINDOW_SECONDS = 15 * 60;

export const customRateLimitter = async (req, res, next) => {
  try {
    const ip = req.headers["x-forwarded-for"] || req.ip;

    const key = rateLimitKey({ ip });

    const requests = await get({ key });

    if (!requests) {
      await set({
        key,
        value: 1,
        ttl: WINDOW_SECONDS,
      });

      return next();
    }

    const count = Number(requests) + 1;

    if (count > RATE_LIMIT) {
      return res.status(429).json({
        message: "Too many requests, please try again later",
      });
    }
    await set({
      key,
      value: count,
      ttl: WINDOW_SECONDS,
    });
    next();
  } catch (error) {
    next(error);
  }
};
