import { z } from "zod";
import "dotenv/config";

export const envVars = z
    .object({
        APP_HOST: z.string(),
        APP_PORT: z.preprocess((value) => {
            if (typeof value !== "string") {
                return undefined;
            }
            return JSON.parse(value);
        }, z.number().positive()),
        NODE_ENV: z.union([z.literal("production"), z.literal("development")]),
        JWT_TOKEN_SECRET_KEY: z.string(),
        BCRYPT_SALT: z.string(),
        DATABASE_URL: z.string(),
        JWT_TOKEN_EXPIRY: z.preprocess((value) => {
            if (typeof value !== "string") {
                return undefined;
            }
            return JSON.parse(value);
        }, z.number().positive()),
    })
    .parse(process.env);
