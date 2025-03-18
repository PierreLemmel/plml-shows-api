
import { getInputProjectionLibraryCollection } from "@/lib/services/aleas/aleas-api";
import { setDocument } from "@/lib/services/api/firebase";
import { pathCombine } from "@/lib/services/core/files";
import { BatchGenerateVoiceResult, batchGenerateVoices, generateVoice, getAllAleasVoices } from "@/lib/services/generation/voices/voice-gen";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	
    if(req.method !== 'GET') {
        res.status(405).end();
    }

    const inputs: {
        name: string;
        content: string;
    }[] = [
        { name: "monologue", content: "un monologue !" },
        { name: "salutation", content: "nous allons saluer !" },
        { name: "charlotte", content: "Charlotte Finet" },
        { name: "luc", content: "Luc Mouret" },
        { name: "alice", content: "Alice Rey" },
        { name: "juliette", content: "Juliette Baron" },
        { name: "pierre", content: "Pierre Lemmel" },
        { name: "clemence", content: "Clémence Mollet" },
        { name: "dorine", content: "Dorine Bocquet" },
        { name: "gabriel", content: "Gabriel Touzelin" },
        { name: "kenan", content: "Kenan Philbert" },
        { name: "adeline", content: "Adeline Belloc" },
        { name: "romain", content: "Romain Guyot" },
    ]
    const elements: Parameters<typeof batchGenerateVoices>[0]["elements"] = inputs
        .map(elt => {
            
            const {
                name,
                content
            } = elt;

            return {
                category: "shared",
                textChunks: [
                    "Et maintenant",
                    content,
                ],
                name
            }
        })
        
    const params: Parameters<typeof batchGenerateVoices>[0] = {
        voices: getAllAleasVoices(),
        collection: "shared",
        elements,
        settings: {
            stability: [0.4, 0.7],
            similarity_boost: [0.25, 0.55],
            style: [0.3, 0.4],
            speed: [0.83, 1.0]
        },
        pauseDuration: [0.5, 0.95]
    }

    const result = await batchGenerateVoices(params);

    const path = pathCombine("/aleas/generation/voices", "shared");
    await setDocument<BatchGenerateVoiceResult>(path, result);
}