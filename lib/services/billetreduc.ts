import { randomUUID } from "crypto";
import { backOff } from "exponential-backoff";
import { Timestamp } from "firebase/firestore";
import { Configuration, OpenAIApi } from "openai";
import { getDocument, setDocument } from "./firebase";
import { flattenArray, randomRange } from "./utils";

const reviewsDocPath = "billetreduc/reviews";
const staticReviewsDocPath = "billetreduc/static-reviews";
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

export interface StaticReviewsData {
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

export async function getStaticBilletReducReviews(): Promise<StaticReviewsData> {
    const result  = await getDocument<StaticReviewsData>(staticReviewsDocPath);

    return result;
}

export async function getBilletReducSettings(): Promise<BilletReducSettings> {
    const result  = await getDocument<BilletReducSettings>(billetReducSettingsPath);
    return result;
}


function trimBilletReducReviews(reviews: string[]) {

    const cleanReview = (input: string) => {

        let result = input;

        if (result.startsWith('"') && !result.startsWith('"Aléas"')) {
            result = result.substring(1);
        }

        if (result.endsWith('"')) {
            result = result.substring(0, result.length - 1);
        }

        return result.trim();
    }

    return reviews.map(cleanReview)
}


  
export type CompletionsData = {
    model: string;
    completions: CompletionData[];
}
  
export type CompletionData = {
    prompt: string,
    n?: number,
    repetitions?: number,
    enabled: boolean
}



export async function getCompletionData(): Promise<CompletionsData> {
    return await getDocument<CompletionsData>(completionsDocPath);
}

const addStaticReviews = process.env.ADD_STATIC_REVIEWS === "true";

export async function regenerateBilletReducData(collectionName: string): Promise<ReviewsData> {
    
    const startTime = Date.now();

    const log = (msg: any) => {
        const date = new Date();

        const hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();
        const milliseconds = date.getMilliseconds();

        console.log(`${hours}:${minutes}:${seconds}'${milliseconds} - ${msg}`);
    }

    const maxAttempts = 8;

    const completionData = await getCompletionData();
    const { model, completions } = completionData;

    const configuration = new Configuration({
		organization: process.env.OPENAI_ORGANIZATION_ID,
		apiKey: process.env.OPENAI_API_KEY,
	});

	const openai = new OpenAIApi(configuration);

    const results: string[][] = [];

    let attempts = 0;
    let failures = 0;

    log(`Generating reviews`);

    const user = `plml-${randomUUID()}`

    for (let i=0; i < completions.length; i++) {
        
        const data = completions[i];

        const { prompt, repetitions, n, enabled } = {
            repetitions: 1,
            n: 1,
            ...data
        };
        
        if (!enabled) {
            log(`Skipping prompt: '${prompt}'`)
            continue;
        }

        log(`Generating reviews for prompt: '${prompt}'`);

        for (let j = 0; j < repetitions; j++) {

            attempts++;
            log(`   Generating ${j + 1}/${repetitions}`);

            try {
                await backOff(async () => {

                    const completionResult = await openai.createCompletion({
                        prompt,
                        model,
                        temperature: randomRange(0.65, 0.95),
                        max_tokens: 1000,
                        top_p: 1,
                        frequency_penalty: randomRange(0.0, 0.10),
                        presence_penalty: randomRange(0.0, 0.10),
                        n,
                        user
                    });
        
                    const { choices } = completionResult.data;

                    results.push(choices.map(choice => choice.text!));
                    
                    log(`   Generated ${j + 1}/${repetitions}: ${choices.length} ${(choices.length > 1 ? 'results' : 'result')}`);
                }, {
                    startingDelay: 1000,
                    retry: (e, attemptNumber) => {
                        log(`   Request failed (${attemptNumber + 1}/${maxAttempts})`);

                        return attemptNumber < maxAttempts;
                    },
                });
    
            }
            catch (e) {
                failures++;

                log(`   Failed ${j + 1}/${repetitions}`);
                log(e);
            }
        }
    }

    const generatedReviews = flattenArray(results);

    const totalTime = Date.now() - startTime;

    log('End of generation');
    log(`   Ellapsed ${totalTime / 1000}` );
    log(`   ${attempts} attempts`);
    log(`   ${attempts - failures} sucess`);
    log(`   ${failures} failures`);
    log(`   ${generatedReviews} reviews generated`);

    let finalReviews = generatedReviews;
    if (addStaticReviews) {
        const staticReviews = await getStaticBilletReducReviews();
        finalReviews = finalReviews.concat(staticReviews.reviews);
    }

    finalReviews = trimBilletReducReviews(finalReviews)

	const reviews: ReviewsDocData = {
        currentReview: collectionName
    };
	
    const result: ReviewsData = {
        generated: Timestamp.now(),
        reviews: finalReviews,
        model
    }

    await setDocument<ReviewsDocData>(reviewsDocPath, reviews);
    await setDocument<ReviewsData>(pathToReviewCollection(collectionName), result);

    return result;
}