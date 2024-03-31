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
