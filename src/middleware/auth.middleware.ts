import expr from "express";
import { IResBody, UserRegister } from "../@types/app.types";
import { BackendAPIErr } from "../helpers/errors";

export async function authenticate(
    req: expr.Request<{}, {}, UserRegister>,
    _: expr.Response<IResBody>,
    next: expr.NextFunction,
): Promise<void> {
    console.log(req.body);
    next(new BackendAPIErr("User is not authenticated.", 401));
}
