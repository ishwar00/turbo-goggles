import { log } from "console";

export async function waitFor(milliSec: number): Promise<void> {
    return new Promise((resolve, _) => {
        setTimeout(() => resolve(), milliSec);
    });
}

type RetryConfig = {
    // how many times fn should be executed before giving up.
    MaxExecCount?: number;
    // in milliseconds
    delayBetweenRetry?: number;
    retryPolicy?: (err: unknown) => boolean;
};

const defaultRetryConfig = {
    MaxExecCount: 3,
    delayBetweenRetry: 1000,
    retryPolicy: (_) => true,
} satisfies Required<RetryConfig>;

export async function retry<Fn extends (...args: any[]) => any>(
    fn: Fn,
    config: RetryConfig = defaultRetryConfig,
): Promise<Awaited<ReturnType<Fn>>> {
    const {
        MaxExecCount: execCount,
        delayBetweenRetry,
        retryPolicy,
    } = {
        ...defaultRetryConfig,
        ...config,
    };

    const _retry = async (retryLeft: number): Promise<Awaited<ReturnType<Fn>>> => {
        log(`Executing attempt: ${execCount - retryLeft + 1}.`);
        try {
            return await fn();
        } catch (err: unknown) {
            if (!retryPolicy(err)) throw err;

            await waitFor(delayBetweenRetry);
            return _retry(retryLeft - 1);
        }
    };

    return await _retry(execCount);
}
