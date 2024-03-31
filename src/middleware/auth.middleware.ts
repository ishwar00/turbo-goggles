import expr from "express";
import { IResBody, JWTPayload } from "../@types/app.types";
import { BackendAPIErr, InternalBackendError } from "../helpers/errors";
import { COOKIE_KEY } from "../global";
import * as jwt from "jsonwebtoken";
import { envVars } from "../config/env.config";
import { prisma } from "../dataSource";
prisma.carbonUser;

export async function authenticate(
    req: expr.Request,
    _: expr.Response<IResBody>,
    next: expr.NextFunction,
): Promise<void> {
    const token = req.cookies[COOKIE_KEY];

    let jwtPayload: JWTPayload | undefined;
    try {
        jwtPayload = jwt.verify(
            token,
            envVars.JWT_TOKEN_SECRET_KEY,
        ) as JWTPayload;
    } catch (err: unknown) {
        let errMessage =
            "Unauthenticated: user authentication token is missing or invalid.";
        if (err instanceof jwt.TokenExpiredError) {
            errMessage = "User session is expired please login again.";
        }
        throw new BackendAPIErr(errMessage, 401, { err });
    }

    const session = await prisma.carbonUserSession.findFirst({
        where: { id: jwtPayload.id },
    });

    if (session === null) {
        throw new BackendAPIErr("Login is requried to proceed.", 401);
    }

    const userInfo = await prisma.carbonUser.findUnique({
        where: { id: session.userId },
    });

    if (userInfo === null) {
        const errCtx = {
            message: "Bug: authenticated user does not have account!!.",
            jwtPayload,
        };
        throw new InternalBackendError(
            errCtx,
            "We could not find your account. Please register again.",
        );
    }

    req.user = userInfo;
    next();
}
