import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { envVars } from "./config/env.config";
import { validateData } from "./middleware/reqValidator";
import { UserRegisterSchema } from "./@types/schema";
import { asyncErrHandler, errHandler } from "./helpers/errors/errHandler";
import { userRegister } from "./controller/auth.controller";
import { UserRegister } from "./@types/app.types";
import { prisma } from "./dataSource";
// import routes from "./config/routes";
// import { authenticate } from "./middleware/auth.middleware";

const app = express();
app.use(bodyParser.json({ limit: "100kb" }));
app.use(cookieParser());

app.post(
    "/register",
    validateData(UserRegisterSchema, "body"),
    asyncErrHandler(userRegister<UserRegister>),
);

app.use(errHandler)

// app.use("/protected/", authenticate, routes.protectedRoutes);

app.get("/", (_, res) => {
    res.status(200).json({
        success: true,
        statusCode: 200,
        data: {
            message: "server is up and running.",
        },
    });
});

async function main() {
    await prisma.$connect();
    app.listen(envVars.APP_PORT, envVars.APP_HOST, () => {
        console.log(
            `server is listen on http://${envVars.APP_HOST}:${envVars.APP_PORT}`,
        );
    });

    process.on("exit", async () => {
        await prisma.$disconnect();
    });
}

main();
