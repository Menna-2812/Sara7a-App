import { resolve } from "node:path";
import dotenv from "dotenv";

const envPath = {
    devlopment: `.env.dev`,
    production: `.env.prod`,
};

dotenv.config({ path: resolve(`./config/${envPath.devlopment}`) });

export const PORT = process.env.PORT || 5000;
export const DB_URI = process.env.DB_URI;
export const SALT = parseInt(process.env.SALT);
export const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET_KEY;
export const TOKEN_ACCESS_KEY = process.env.TOKEN_ACCESS_SECRET_KEY;
export const ACCESS_EXPIRES_DURATION = Number(process.env.ACCESS_EXPIRES);

