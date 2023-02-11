import { NextApiRequest, NextApiResponse } from "next";
import { isDev, isValidAdminToken } from "../services/api";

export function withAuth(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) {

    return async (req: NextApiRequest, res: NextApiResponse) => {

        if (!isDev()) {

            const token = <string> req.headers['plml-api-token'];
            
            if (!isValidAdminToken(token)) {
                res.status(401).send('Unauthorized');
            }
        }

        await handler(req, res);
    }
}