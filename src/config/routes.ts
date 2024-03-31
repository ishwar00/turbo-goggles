import expr from "express";
import { validateData } from "../middleware/reqValidator";
import { asyncErrHandler } from "../helpers/errors/errHandler";
import { UserLoginSchema, UserRegisterSchema } from "../@types/schema";
import {
    userLogin,
    userLogout,
    userRegister,
} from "../controller/auth.controller";
import { UserLogin, UserRegister } from "../@types/app.types";

const protectedRoutes = expr.Router();
protectedRoutes.get(
    "/data",
    asyncErrHandler(async (_, res, __) => {
        res.status(200).json({
            message: "got access to protected data.",
        });
    }),
);

const onBoardingRoutes = expr.Router();

onBoardingRoutes.post(
    "/register",
    validateData(UserRegisterSchema, "body"),
    asyncErrHandler(userRegister<UserRegister>),
);
onBoardingRoutes.post(
    "/login",
    validateData(UserLoginSchema, "body"),
    asyncErrHandler(userLogin<UserLogin>),
);

const offBoardingRoutes = expr.Router();
offBoardingRoutes.post("/logout", asyncErrHandler(userLogout));

export default {
    protectedRoutes,
    onBoardingRoutes,
    offBoardingRoutes,
};
