import { SceneData, GenerateAleasShowArgs, generateSceneFromTemplate, AleasShowScene } from "@/lib/services/aleas/aleas-generation";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse<AleasShowScene>) {
	
    if(req.method !== 'GET') {
        res.status(405).end();
    }

    const {
        args,
        template
    } = req.body as {
        args: GenerateAleasShowArgs;
        template: string;
    };

    const sceneData = await generateSceneFromTemplate(args, template);
    const scene: AleasShowScene = {
        ...sceneData,
        name: template,
        displayName: `Test - ${template}`
    }

	res.status(200).json(scene);
}