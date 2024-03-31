import expr from "express";
import { validateData } from "../middleware/reqValidator";
import { asyncErrHandler } from "../helpers/errors/errHandler";
import {
    PublicAPIParamsSchema,
    UserLoginSchema,
    UserRegisterSchema,
} from "../@types/schema";
import {
    userLogin,
    userLogout,
    userRegister,
} from "../controller/auth.controller";
import { PublicAPIParams, UserLogin, UserRegister } from "../@types/app.types";
import { fetchData } from "../controller/data.controller";

const protectedRoutes = expr.Router();
protectedRoutes.get(
    "/data",
    validateData(
        PublicAPIParamsSchema,
        (req) => req.query,
        (data: any, req) => (req.query = data),
    ),
    asyncErrHandler(fetchData<PublicAPIParams>),
);

const onBoardingRoutes = expr.Router();

onBoardingRoutes.post(
    "/register",
    validateData(
        UserRegisterSchema,
        (req) => req.query,
        (data, req) => (req.body = data),
    ),
    asyncErrHandler(userRegister<UserRegister>),
);
onBoardingRoutes.post(
    "/login",
    validateData(
        UserLoginSchema,
        (req) => req.body,
        (data, req) => (req.body = data),
    ),
    asyncErrHandler(userLogin<UserLogin>),
);

const offBoardingRoutes = expr.Router();
offBoardingRoutes.post("/logout", asyncErrHandler(userLogout));

export default {
    protectedRoutes,
    onBoardingRoutes,
    offBoardingRoutes,
};
