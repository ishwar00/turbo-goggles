import expr from "express";
import { ZodType } from "zod";

export function validateData<
    K extends keyof expr.Request,
    T extends expr.Request[K],
>(zodModel: ZodType<T>, key: K): expr.RequestHandler {
    return (
        req: expr.Request,
        res: expr.Response,
        next: expr.NextFunction,
    ): void => {
        try {
            const data = req[key];
            const parse_result = zodModel.safeParse(data);
            if (!parse_result.success) {
                res.status(400).json({
                    success: false,
                    data: {
                        message: "bad request",
                        errors: parse_result.error.errors.map((err) => {
                            return {
                                message: `${err.message}`,
                                path: [...err.path].join("."),
                            };
                        }),
                    },
                });
                return undefined;
            }
            req[key] = parse_result.data;
            next();
        } catch (err: unknown) {
            next(err);
        }
    };
}
