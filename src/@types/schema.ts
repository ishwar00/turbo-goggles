import { title } from "process";
import { z } from "zod";

export const UserRegisterSchema = z.object({
    username: z.string().min(4, {
        message: "username must be atleast 4 characters in length.",
    }),
    password: z.string().min(8, {
        message: "password must be atleast 8 characters in length.",
    }),
});

export const UserLoginSchema = UserRegisterSchema;

const ParsePositiveInteger = z.preprocess(
    (arg) => {
        if (typeof arg === "string" && arg.length > 0) {
            const result = Number(arg);
            if (!Number.isNaN(result)) {
                return result;
            }
        }
        return arg; // This willl error if arg is not of number type
    },
    z.number().int({ message: "limit must be a integer" }).positive({
        message: "limit must be positive integer",
    }),
);

export const PublicAPIParamsSchema = z.object({
    description: z.string().optional(),
    auth: z.string().optional(),
    https: z.union([z.literal("true"), z.literal("false")]).optional(),
    cors: z
        .union([z.literal("yes"), z.literal("no"), z.literal("unknown")])
        .optional(),
    category: z.string().optional(),
    limit: ParsePositiveInteger.optional(),
});
