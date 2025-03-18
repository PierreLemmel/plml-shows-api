
import { getInputProjectionLibraryCollection } from "@/lib/services/aleas/aleas-api";
import { setDocument } from "@/lib/services/api/firebase";
import { splitArray } from "@/lib/services/core/arrays";
import { pathCombine } from "@/lib/services/core/files";
import { generateId } from "@/lib/services/core/utils";
import { batchGenerateCompletions, CompletionsData, TextGenResult } from "@/lib/services/generation/text/text-gen";
import { BatchGenerateVoiceResult, batchGenerateVoices, generateVoice, getAllAleasVoices } from "@/lib/services/generation/voices/voice-gen";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	
    if(req.method !== 'GET') {
        res.status(405).end();
    }

    const collectionId = <string> req.query["collection"];

    const collection = await getInputProjectionLibraryCollection(collectionId);
    const elements: Parameters<typeof batchGenerateVoices>[0]["elements"] = collection
        .libraries
        .map(lib => {
            
            const category = lib.key;

            return lib.elements.map((elt, i) => {

                const uncaptitalized = elt[0].toLowerCase() + elt.slice(1);
                const name = `${category}-${i.toString().padStart(2, '0')}`;

                return {
                    category,
                    textChunks: [
                        "Et maintenant",
                        uncaptitalized + " !",
                    ],
                    name
                }
            })
        })
        .flat()
    
    const params: Parameters<typeof batchGenerateVoices>[0] = {
        voices: getAllAleasVoices(),
        collection: collectionId,
        elements,
        settings: {
            stability: [0.4, 0.7],
            similarity_boost: [0.25, 0.55],
            style: [0.3, 0.4],
            speed: [0.83, 1.0]
        },
        pauseDuration: [0.7, 1.2]
    }

    const result = await batchGenerateVoices(params);

    const path = pathCombine("/aleas/generation/voices", collectionId);
    await setDocument<BatchGenerateVoiceResult>(path, result);
	res.status(200).json({ result });
}