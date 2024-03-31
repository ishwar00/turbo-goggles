import * as expr from "express";
import { IResBody, PublicAPIParams } from "../@types/app.types";
import axios, { AxiosError, AxiosResponse } from "axios";
import { ExternalSystemError } from "../helpers/errors";
import { retry } from "../helpers/retry";

const retryPolicy = (err: unknown): boolean => {
    if (err instanceof AxiosError && err.status !== undefined) {
        return [500, 503, 502, 408].includes(err.status);
    }

    return false;
};

/**
 * @swagger
 */
export async function fetchData<T extends PublicAPIParams>(
    req: expr.Request<{}, {}, {}, T>,
    res: expr.Response<IResBody & { data: { count: number } }>,
): Promise<void> {
    const publicUrl = "https://api.publicapis.org/entries";
    const params = req.query;
    const limit = params.limit;

    let apiResponse: AxiosResponse;
    try {
        params.limit = undefined;
        apiResponse = await retry(
            () =>
                axios.get(publicUrl, {
                    responseType: "json",
                    params,
                }),
            { retryPolicy },
        );
    } catch (err: unknown) {
        if (err instanceof AxiosError) {
            const errCtx = {
                externalSystemName: "publicapis",
                cause: {
                    err,
                },
            } satisfies ExternalSystemError["errContext"];
            throw new ExternalSystemError(
                "System failed to fetch data, please try again.",
                errCtx,
            );
        }
        throw err;
    }

    let data = apiResponse.data as {
        count: number;
        entries: unknown[] | null;
    };

    if (limit) {
        data.entries = data.entries?.slice(0, limit) ?? null;
    }

    res.status(200).json({
        success: true,
        statusCode: 200,
        data: {
            message: "Data fetch was successfull from publicAPIs.",
            ...data,
            count: data.entries?.length ?? 0,
        },
    });
}
