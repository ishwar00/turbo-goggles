import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { envVars } from "./config/env.config";
import { asyncErrHandler, errHandler } from "./helpers/errors/errHandler";
import { prisma } from "./dataSource";
import routes from "./config/routes";
import { authenticate } from "./middleware/auth.middleware";

const app = express();
app.use(bodyParser.json({ limit: "100kb" }));
app.use(cookieParser());
app.use(routes.onBoardingRoutes);
app.use(routes.offBoardingRoutes);
app.use("/api/", asyncErrHandler(authenticate), routes.protectedRoutes);

app.get("/", (_, res) => {
    res.status(200).json({
        success: true,
        statusCode: 200,
        data: {
            message: "server is up and running.",
        },
    });
});

app.use(errHandler);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        statusCode: 404,
        data: {
            message: `Invalid URL path '${req.path}'.`,
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
