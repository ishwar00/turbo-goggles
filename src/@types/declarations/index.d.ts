import { CarbonUser } from "@prisma/client";

declare global {
    namespace Express {
        export interface Request {
            user: CarbonUser;
        }
    }
}
