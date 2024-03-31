import expr from "express";
import { ZodType } from "zod";

export function validateData<T>(
    zodModel: ZodType<T>,
    getData: (req: expr.Request) => unknown,
    setData: (data: T, req: expr.Request) => void,
): expr.RequestHandler {
    return (
        req: expr.Request,
        res: expr.Response,
        next: expr.NextFunction,
    ): void => {
        try {
            const data = getData(req);
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
            setData(parse_result.data, req);
            next();
        } catch (err: unknown) {
            next(err);
        }
    };
}
