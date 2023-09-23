
import { getThanksMessagesCollection, ThanksMessagesCollection } from "@/lib/services/aleas/misc/aleas-thanks";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse<ThanksMessagesCollection>) {
	
    if(req.method !== 'GET') {
        res.status(405).end();
    }

    const collection = <string> req.query["collection"];

    const result = await getThanksMessagesCollection(collection);
	res.status(200).json(result);
}