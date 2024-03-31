import * as expr from "express";
import { IResBody, UserLogin, UserRegister } from "../@types/app.types";
import { BackendAPIErr, InternalBackendError } from "../helpers/errors";
import { prisma } from "../dataSource";
import bcryptjs from "bcryptjs";
import { envVars } from "../config/env.config";

export async function userRegister<T extends UserRegister>(
    req: expr.Request<{}, {}, T>,
    res: expr.Response<IResBody>,
): Promise<void> {
    const { username, password } = req.body;
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

export async function logIn<T extends UserLogin>(
    req: expr.Request<{}, {}, T>,
    _: expr.Response<IResBody>,
): Promise<void> {
    console.log(req.body);
    throw new BackendAPIErr("not implemented", 400);
}
