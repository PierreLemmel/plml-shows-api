import { async } from "@firebase/util";
import { Timestamp } from "firebase/firestore";
import { getDocument, setDocument } from "../../api/firebase";
import { pathCombine } from "../../core/files";
import { batchGenerateCompletions, CompletionsData } from "../../generation/text/text-gen";


const thanksPath = pathCombine("aleas", "messages", "thanks");
const completionsDocPath = pathCombine(thanksPath, "completions");
const collectionsDocPath = pathCombine(thanksPath, "collections");
const generatedCollectionsPath = pathCombine(collectionsDocPath, "generated");

interface ThanksMessagesCollectionRoot {
    currentCollections: string[];
}

export interface ThanksMessagesCollection {
    generated: Timestamp;
    model: string;
    messages: string[];
}


export async function getCompletionData() {
    return await getDocument<CompletionsData>(completionsDocPath);
}

export async function regenerateThanksMessagesCollection(collectionName: string): Promise<ThanksMessagesCollection> {

    const completionData = await getCompletionData();

    const batchResult = await batchGenerateCompletions(completionData);

	const { generated, data, model } = batchResult;
    const result: ThanksMessagesCollection = {
        generated,
        messages: data,
        model
    }

    await setDocument<ThanksMessagesCollectionRoot>(collectionsDocPath, { currentCollections: [collectionName] });

    const pathToMessagesCollection = pathCombine(generatedCollectionsPath, collectionName);
    await setDocument<ThanksMessagesCollection>(pathToMessagesCollection, result);

    return result;
}

export async function getThanksMessages(): Promise<ThanksMessagesCollection[]> {

    const { currentCollections } = await getDocument<ThanksMessagesCollectionRoot>(collectionsDocPath);

    const result = await Promise.all(currentCollections.map(getThanksMessagesCollection));
    
    return result;
}

export async function getThanksMessagesCollection(collectionName: string) : Promise<ThanksMessagesCollection> {
    const pathToMessagesCollection = pathCombine(generatedCollectionsPath, collectionName);
    return await getDocument<ThanksMessagesCollection>(pathToMessagesCollection);
}