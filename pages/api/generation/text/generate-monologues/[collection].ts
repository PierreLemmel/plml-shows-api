
import { formatAleasDate, getMonologueCompletionsData, saveMonologueLibrary } from "@/lib/services/aleas/aleas-api";
import { AleasMonologue, AleasMonologueLibrary } from "@/lib/services/aleas/aleas-generation";

import { splitArray } from "@/lib/services/core/arrays";
import { generateId } from "@/lib/services/core/utils";
import { batchGenerateCompletions, CompletionsData, TextGenResult } from "@/lib/services/generation/text/text-gen";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	
    if(req.method !== 'GET') {
        res.status(405).end();
    }

    const collection = <string> req.query["collection"];

    const {
        model,
        completions
    } = await getMonologueCompletionsData(collection);

    const chunkSize = 5;

    const chunks = splitArray(completions, chunkSize);
    const timestamp = formatAleasDate(new Date());
    const baseName = `${collection}-${timestamp}`

    const chunkResults: AleasMonologueLibrary[] = [];

    for (let i = 0; i < chunks.length; i++) {
        const input: CompletionsData = {
            model,
            completions: chunks[i]
        }

        const name = `${baseName}-${i.toString().padStart(2, '0')}`;
        const result = await batchGenerateCompletions(input)

        const monologues: AleasMonologue[] = result.data.map((text) => ({ text }));

        const chunkLib: AleasMonologueLibrary = {
            model,
            id: generateId(),
            name,
            shortName: name,
            monologues
        }
        
        chunkResults.push(chunkLib);

        await saveMonologueLibrary(chunkLib);
    }

    const mergedLibrary: AleasMonologueLibrary = {
        model,
        name: baseName,
        shortName: baseName,
        id: generateId(),
        monologues: chunkResults.flatMap((lib) => lib.monologues)
    }

    await saveMonologueLibrary(mergedLibrary);

	res.status(200).json(mergedLibrary);
}