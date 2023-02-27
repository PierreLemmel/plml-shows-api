import { randomUUID } from "crypto";
import { backOff } from "exponential-backoff";
import { Timestamp } from "firebase/firestore";
import { Configuration, OpenAIApi } from "openai";
import { getDocument, setDocument } from "./firebase";
import { flattenArray, randomRange } from "./helpers";

const reviewsDocPath = "billetreduc/reviews";
const staticReviewsDocPath = "billetreduc/static-reviews";
const completionsDocPath = "billetreduc/completions";
const billetReducSettingsPath = "billetreduc/settings";

export type ReviewsData = {
    reviews: string[];
    lastGeneration: Timestamp;
    lastGenerationMaxIndex: number;
}

export type StaticReviewsData = {
    reviews: string[];
    lastGeneration: Timestamp;
    lastGenerationMaxIndex: number;
}

type BilletReducSettings = {
    billetReducUrl: string;
}

export async function getBilletReducReviews(): Promise<ReviewsData> {
    const result  = await getDocument<ReviewsData>(reviewsDocPath);
    return result;
}

export async function getStaticBilletReducReviews(): Promise<StaticReviewsData> {
    const result  = await getDocument<ReviewsData>(staticReviewsDocPath);
    return result;
}

export async function getBilletReducSettings(): Promise<BilletReducSettings> {
    const result  = await getDocument<BilletReducSettings>(billetReducSettingsPath);
    return result;
}


export async function trimBilletReducReviews(): Promise<ReviewsData> {
    const oldReviews = await getDocument<ReviewsData>(reviewsDocPath);

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

    const result: ReviewsData = {
        ...oldReviews,
        reviews: oldReviews.reviews.map(cleanReview)
    }

    await setDocument<ReviewsData>(reviewsDocPath, result);

    return result;
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

export async function regenerateBilletReducData(fullyRegenerate: boolean): Promise<ReviewsData> {
    
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
    const { lastGenerationMaxIndex } = await getBilletReducReviews();
    const { model, completions } = completionData;

    const configuration = new Configuration({
		organization: process.env.OPENAI_ORGANIZATION_ID,
		apiKey: process.env.OPENAI_API_KEY,
	});

	const openai = new OpenAIApi(configuration);

    const results: string[][] = [];

    if (!fullyRegenerate) {
        const oldBrData = await getBilletReducReviews();
        results.push(oldBrData.reviews);
    }

    let attempts = 0;
    let failures = 0;

    let startIndex = fullyRegenerate ? 0 : lastGenerationMaxIndex;
    log(`Generating reviews, starting at index ${startIndex}`);

    const user = `plml-${randomUUID()}`

    for (let i=startIndex; i < completions.length; i++) {
        
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


	const reviews = {
        reviews: finalReviews,
        lastGeneration: Timestamp.now(),
        lastGenerationMaxIndex: completions.length
    };
	
    await setDocument<ReviewsData>(reviewsDocPath, reviews)

    return reviews;
}