import { Timestamp } from "firebase/firestore";
import { CompletionsData, batchGenerateCompletions } from "../generation/text/text-gen";
import { getDocument, setDocument } from "./firebase";

const reviewsDocPath = "billetreduc/reviews";
const completionsDocPath = "billetreduc/completions";
const billetReducSettingsPath = "billetreduc/settings";

const pathToReviewCollection = (collection: string) => `${reviewsDocPath}/generated/${collection}`

interface ReviewsDocData {
    currentReview: string;
}

export interface ReviewsData {
    generated: Timestamp;
    model: string;
    reviews: string[];
}


interface BilletReducSettings {
    billetReducUrl: string;
}

export async function getBilletReducReviews(): Promise<ReviewsData> {
    const { currentReview }  = await getDocument<ReviewsDocData>(reviewsDocPath);

    const result = await getDocument<ReviewsData>(pathToReviewCollection(currentReview));
    return result;
}


export async function getBilletReducSettings(): Promise<BilletReducSettings> {
    const result  = await getDocument<BilletReducSettings>(billetReducSettingsPath);
    return result;
}




export async function getCompletionData(): Promise<CompletionsData> {
    return await getDocument<CompletionsData>(completionsDocPath);
}

export async function regenerateBilletReducData(collectionName: string): Promise<ReviewsData> {

    const completionData = await getCompletionData();

    const batchResult = await batchGenerateCompletions(completionData);

	const { generated, data, model } = batchResult;
    const result: ReviewsData = {
        generated,
        reviews: data,
        model
    }

    await setDocument<ReviewsDocData>(reviewsDocPath, { currentReview: collectionName });
    await setDocument<ReviewsData>(pathToReviewCollection(collectionName), result);

    return result;
}