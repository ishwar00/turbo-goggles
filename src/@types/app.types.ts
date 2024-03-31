import { z } from "zod";
import { UserLoginSchema, UserRegisterSchema } from "./schema";

export type UserRegister = z.infer<typeof UserRegisterSchema>;
export type UserLogin = z.infer<typeof UserLoginSchema>;
export type JWTPayload = {
    id: string; // session id
};

export interface IResBody {
    success: boolean;
    statusCode: number;
    data: {
        message: string;
    };
}

export function isObject(data: unknown): data is { [_: string]: unknown } {
    return typeof data === "object" && data !== null && !Array.isArray(data);
}
