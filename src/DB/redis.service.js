import { redisClient } from "./redis.connection.js";

// Revoke Token
export const revokeTokenKeyPrefix = ({ userId }) => {
  return `user:revokeToken:${userId}`;
};
export const revokeTokenKey = ({ userId, jti }) => {
  return `${revokeTokenKeyPrefix({ userId })}:${jti}`;
};
export const logoutAllKey = ({ userId }) => {
  return `user:logoutAll:${userId}`;
};

// Set a Kry-value pair in Redis
export const set = async ({ key, value, ttl = null }) => {
  try {
    const data = typeof value != "string" ? JSON.stringify(value) : value;
    if (ttl) {
      return await redisClient.set(key, data, {
        expiration: { type: "EX", value: ttl },
      });
    } else {
      return await redisClient.set(key, data);
    }
  } catch (error) {
    console.log("Redis Set Error", error);
  }
};

// Get a value by key from Redis
export const get = async ({ key }) => {
  try {
    const data = await redisClient.get(key);
    return data;
  } catch (error) {
    console.log("Redis Get Error", error);
  }
};

// update a key-value pair in Redis
export const update = async ({ key, value, ttl = null }) => {
  try {
    const isExists = await redisClient.exists(key);
    if (!isExists) return false;
    const data = typeof value != "string" ? JSON.stringify(value) : value;
    if (ttl) {
      return await redisClient.set(key, data, {
        expiration: { type: "EX", value: ttl },
      });
    } else {
      return await redisClient.update(key, data);
    }
  } catch (error) {
    console.log("Redis Update Error", error);
  }
};

// delete pair
export const del = async ({ key }) => {
  try {
    const isExists = await redisClient.exists(key);
    if (!isExists) return false;
    return await redisClient.del(key);
  } catch (error) {
    console.log("Redis Delete Error", error);
  }
};

// expire
export const expire = async ({ key, ttl = null }) => {
  try {
    const isExists = await redisClient.exists(key);
    if (!isExists) return false;
    return await redisClient.expire(key, ttl);
  } catch (error) {
    console.log("Redis Expire Error", error);
  }
};

// ttl
export const ttl = async ({ key }) => {
  try {
    const isExists = await redisClient.exists(key);
    if (!isExists) return false;
    return await redisClient.ttl(key);
  } catch (error) {
    console.log("Redis TTL Error", error);
  }
};

// keys pattern
export const keys = async ({ pattern }) => {
  try {
    return await redisClient.keys(pattern);
  } catch (error) {
    console.log("Redis Keys Error", error);
  }
};

export const otpCooldownKey = ({ email }) => {
  return `otp:cooldown:${email}`;
};

export const otpResendKey = ({ email }) => {
  return `otp:resend:${email}`;
};

export const otpKey = ({ email }) => {
  return `otp:${email}`;
};

export const rateLimitKey = ({ ip }) => {
  return `rateLimit:${ip}`;
};