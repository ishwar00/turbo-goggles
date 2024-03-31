import * as expr from "express";
import {
    IResBody,
    JWTPayload,
    UserLogin,
    UserRegister,
} from "../@types/app.types";
import { BackendAPIErr, InternalBackendError } from "../helpers/errors";
import { prisma } from "../dataSource";
import bcryptjs from "bcryptjs";
import { envVars } from "../config/env.config";
import * as jwt from "jsonwebtoken";
import { COOKIE_KEY } from "../global";

export async function userRegister<T extends UserRegister>(
    req: expr.Request<{}, {}, T>,
    res: expr.Response<IResBody>,
): Promise<void> {
    let { username, password } = req.body;
    username = username.trim();
    const users = await prisma.carbonUser.findMany({ where: { username } });

    if (users.length === 1) {
        throw new BackendAPIErr(
            `Username '${username}' is not available, please use different one and try again.`,
            400,
        );
    }

    if (users.length > 1) {
        // violation of invariant, there can't be multiple users with same username
        const errCtx = {
            message: `Bug: DB has multiple users with same usernames '${username}'`,
        };
        throw new InternalBackendError(
            errCtx,
            "This username is not available, please use different one and try again.",
        );
    }

    const passwordHash = await bcryptjs.hash(password, envVars.BCRYPT_SALT);
    const userRecord = await prisma.carbonUser.create({
        data: {
            password: passwordHash,
            username,
        },
    });

    res.status(201).json({
        success: true,
        statusCode: 201,
        data: {
            message: `user '${userRecord.username}' has been registered`,
        },
    });
}

export async function userLogin<T extends UserLogin>(
    req: expr.Request<{}, {}, T>,
    res: expr.Response<IResBody>,
): Promise<void> {
    let { username, password } = req.body;
    username = username.trim();

    const passwordHash = await bcryptjs.hash(password, envVars.BCRYPT_SALT);
    const user = await prisma.carbonUser.findFirst({
        where: { username, password: passwordHash },
    });

    if (user === null) {
        throw new BackendAPIErr(`Incorrect username or password.`, 401);
    }
    // remove existing sesions
    await prisma.carbonUserSession.deleteMany({ where: { userId: user.id } });

    const { id: sessionId } = await prisma.carbonUserSession.create({
        data: {
            userId: user.id,
        },
    });

    const jwtToken = jwt.sign(
        { id: sessionId } satisfies JWTPayload,
        envVars.JWT_TOKEN_SECRET_KEY,
        { expiresIn: envVars.JWT_TOKEN_EXPIRY },
    );

    res.cookie("_CarbonSessToken", jwtToken, {
        secure: true,
        httpOnly: true,
        sameSite: "lax",
    });

    res.status(200).json({
        statusCode: 200,
        success: true,
        data: {
            message: "Succesfully logged in.",
        },
    });
}

export async function userLogout(
    req: expr.Request,
    res: expr.Response<IResBody>,
): Promise<void> {
    const token = req.cookies[COOKIE_KEY];
    let jwtPayload: JWTPayload | undefined;
    try {
        jwtPayload = jwt.verify(
            token,
            envVars.JWT_TOKEN_SECRET_KEY,
        ) as JWTPayload;
    } catch (err: unknown) {
        let errMessage = "Bad request.";
        throw new BackendAPIErr(errMessage, 400);
    }

    const _ = await prisma.carbonUserSession.deleteMany({
        where: { id: jwtPayload.id },
    });

    res.status(200).json({
        success: true,
        statusCode: 200,
        data: {
            message: "Logged out succesfully.",
        },
    });
}
