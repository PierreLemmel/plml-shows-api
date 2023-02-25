import { getDocument, setDocument } from "../firebase";

const completionsDocPath = "billetreduc/completions";

type CompletionsDataV1 = {
    model: string;
    completions: CompletionDataV1[];
}
  
type CompletionDataV1 = {
    prompt: string,
    n?: number,
    repetitions?: number
}


type CompletionsDataV2 = {
    model: string;
    completions: CompletionDataV2[];
}
  
type CompletionDataV2 = CompletionDataV1 | {
    enabled: boolean
}


async function addEnabledToCompletions() {
    
    const completionsDataV1 = await getDocument<CompletionsDataV1>(completionsDocPath);

    const completionsV2: CompletionDataV2[] = completionsDataV1.completions.map(c => {
        return {
            ...c,
            enabled: true
        }
    })

    await setDocument<CompletionsDataV2>(completionsDocPath, {
        completions: completionsV2
    });
}

export default addEnabledToCompletions;