/// Backend runs into unexpected 'state' because of bug
export class InternalBackendError extends Error {
    constructor(
        public errContext: Record<string, unknown>,
        public userMessage: string = "We ran into an unexpected internal system error. Please try again.",
    ) {
        super(
            "We ran into an unexpected internal system error. Please try again.",
        );
    }
}

/// When an external system fails
export class ExternalSystemError extends Error {
    constructor(
        public userMessage: string,
        public errContext: {
            externalSystemName: string;
            cause: Record<string, unknown>;
        },
    ) {
        super(
            `Task could not be completed as an external system(${errContext.externalSystemName}) failed.`,
        );
    }
}

export class BackendAPIErr extends Error {
    constructor(
        public userMessage: string,
        public statusCode: number,
        public errContext?: Record<string, unknown>,
    ) {
        super(userMessage);
    }
}
