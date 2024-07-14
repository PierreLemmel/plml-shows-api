import { saveAleasShow } from "@/lib/services/aleas/aleas-api";
import { AleasShow, generateAleasShow, GenerateAleasShowArgs } from "@/lib/services/aleas/aleas-generation";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse<AleasShow>) {
	
    if(req.method !== 'GET') {
        res.status(405).end();
    }

    const args = req.body as GenerateAleasShowArgs; 

    const result = await generateAleasShow(args);
    
    if (args.generation.save) { 
        await saveAleasShow(result);
    }
	res.status(200).json(result);
}