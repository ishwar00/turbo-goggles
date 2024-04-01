import { z, ZodAny, ZodParsedType } from "zod";
import "dotenv/config";
import { ZodType } from "zod";

export function handleZodParse<T extends ZodType>(zodModel: T) {
    const parse_result = zodModel.safeParse(process.env);
    if (!parse_result.success) {
        throw {
            message:
                "Error => Environment variables are missing or have incorrect values!!",
            errors: parse_result.error.errors.map(
                (err) => `${err.path.join(".")} <-- ${err.message}`,
            ),
        };
    }
    return parse_result.data;
}

const EnvVarsSchema = z.object({
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
});

export const envVars = handleZodParse(EnvVarsSchema);
