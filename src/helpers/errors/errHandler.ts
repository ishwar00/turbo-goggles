import expr from "express";
import {
    BackendAPIErr,
    ExternalSystemError,
    InternalBackendError,
} from "../errors";
import { IResBody, isObject } from "../../@types/app.types";

export function asyncErrHandler<
    T extends expr.Request<any>,
    U extends expr.Response,
    N extends expr.NextFunction,
>(handler: (req: T, res: U, next: N) => Promise<void>) {
    return async (req: T, res: U, next: N) => {
        try {
            await handler(req, res, next);
        } catch (err: unknown) {
            console.log(JSON.stringify(err, null, 2));
            next(err);
        }
    };
}

export function finalErrHandler(err: unknown): IResBody | undefined {
    switch (true) {
        case err instanceof ExternalSystemError:
        case err instanceof InternalBackendError: {
            return {
                success: false,
                statusCode: 500,
                data: {
                    message: err.userMessage,
                },
            };
        }
        case err instanceof BackendAPIErr: {
            console.log("BackendAPIErr");
            return {
                success: false,
                statusCode: err.statusCode,
                data: {
                    message: err.userMessage,
                },
            };
        }
    }

    return undefined;
}

export function errHandler(
    err: Error,
    _: expr.Request,
    res: expr.Response,
    __: expr.NextFunction,
): void {
    console.log(JSON.stringify(err, null, 2));

    if (
        isObject(err) &&
        err instanceof SyntaxError &&
        err["status"] === 400 &&
        err["body"] !== undefined
    ) {
        res.status(400).json({
            success: false,
            data: {
                message: `syntax error in body: ${err.message}`,
            },
        });
        return undefined;
    }

    const fmtErr = finalErrHandler(err);
    if (fmtErr === undefined) {
        res.status(500).json({
            success: false,
            data: {
                message:
                    "We ran into unexpected internal sysmtem error, please try again.",
            },
        });
        return undefined;
    }
    const { statusCode } = fmtErr;
    res.status(statusCode).json(fmtErr);
}
