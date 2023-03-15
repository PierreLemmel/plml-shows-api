import { Timestamp } from "@firebase/firestore";
import { getCompletionData } from "../billetreduc";
import { getDocument, setDocument } from "../firebase";

interface OldReviewsData {
    reviews: string[];
    lastGeneration: Timestamp;
    lastGenerationMaxIndex: number;
}

interface NewReviewsData {
    currentReview: string;
}

interface NewReviewData {
    generated: Timestamp;
    model: string;
    reviews: string[];
}

const originalCompletion = "davinci-001"
const reviewsPath = "billetreduc/reviews";


async function multipleReviewsDataSet() {
    const { lastGeneration, lastGenerationMaxIndex, reviews } = await getDocument<OldReviewsData>(reviewsPath);

    const { model } = await getCompletionData();

    const newReview: NewReviewData = {
        generated: lastGeneration,
        model,
        reviews
    }

    await setDocument<NewReviewData>(`${reviewsPath}/generated/${originalCompletion}`, newReview);

    const newReviews: NewReviewsData = { currentReview: originalCompletion }
    await setDocument<NewReviewsData>(reviewsPath, newReviews, false);
}

export default multipleReviewsDataSet;