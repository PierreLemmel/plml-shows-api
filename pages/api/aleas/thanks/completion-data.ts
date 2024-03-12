
import { getCompletionData } from "@/lib/services/aleas/misc/aleas-thanks";
import { CompletionsData } from "@/lib/services/generation/text/text-gen";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse<CompletionsData>) {
	
    if(req.method !== 'GET') {
        res.status(405).end();
    }

    const result = await getCompletionData();
	res.status(200).json(result);
}