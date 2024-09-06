import { SceneData, GenerateAleasShowArgs, AleasShowScene, generateOutroSceneForTest } from "@/lib/services/aleas/aleas-generation";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse<AleasShowScene>) {
	
    if(req.method !== 'GET') {
        res.status(405).end();
    }

    const args = req.body as GenerateAleasShowArgs;

    const sceneData = await generateOutroSceneForTest(args);
    const scene: AleasShowScene = {
        ...sceneData,
        name: "Intro",
        displayName: `Test - Intro`
    }

	res.status(200).json(scene);
}