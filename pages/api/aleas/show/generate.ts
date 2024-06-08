import { AleasShow, generateAleasShow, GenerateAleasShowArgs, getAleasSceneTemplates } from "@/lib/services/aleas/aleas-generation";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse<AleasShow>) {
	
    if(req.method !== 'GET') {
        res.status(405).end();
    }

    const args = req.body as GenerateAleasShowArgs;

    const templates = await getAleasSceneTemplates(args.show.lightingPlan);

    const result = await generateAleasShow(args, templates);
	res.status(200).json(result);
}