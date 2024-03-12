import { randomUUID } from "crypto";
import { backOff } from "exponential-backoff";
import { Timestamp } from "firebase/firestore";
import { CreateChatCompletionRequestMessage } from "openai/resources/chat";
import { createOpenAI } from "../../api/openai";
import { flattenArray } from "../../core/arrays";
import { randomRange } from "../../core/utils";

export type CompletionsData = {
    model: 'gpt-4' | 'gpt-3.5-turbo' | 'text-davinci-003';
    completions: CompletionData[];
}
  
export type CompletionData = {
    prompt: string,
    system?: string,
    n?: number,
    repetitions?: number,
    enabled: boolean
}

export interface TextGenResult {
    generated: Timestamp;
    model: string;
    data: string[];
}

function cleanTexts(reviews: string[]) {

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

export async function batchGenerateCompletions(input: CompletionsData): Promise<TextGenResult> {
    
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

    const { model, completions } = input;

	const openai = createOpenAI();

    const results: string[][] = [];

    let attempts = 0;
    let failures = 0;

    log(`Generating elements`);

    const user = `plml-${randomUUID()}`

    for (let i=0; i < completions.length; i++) {
        
        const data = completions[i];

        const {
            prompt,
            repetitions = 1,
            n = 1,
            enabled,
            system
        } = data;
        
        if (!enabled) {
            log(`Skipping prompt: '${prompt}'`)
            continue;
        }

        log(`Generating elements for prompt: '${prompt}'`);

        for (let j = 0; j < repetitions; j++) {

            attempts++;
            log(`   Generating ${j + 1}/${repetitions}`);

            try {
                await backOff(async () => {

                    const systemMessage: CreateChatCompletionRequestMessage|undefined = system !== undefined ? {
                        content: system,
                        role: 'system'
                    } : undefined;

                    const userMessage: CreateChatCompletionRequestMessage = {
                        content: prompt,
                        role: 'user'
                    }

                    const openaiResult = await openai.chat.completions.create({
                        stream: false,
                        model: 'gpt-4',
                        messages: systemMessage !== undefined ? [systemMessage, userMessage] : [userMessage],
                        temperature: randomRange(0.65, 0.95),
                        max_tokens: 1000,
                        top_p: 1,
                        frequency_penalty: randomRange(0.0, 0.10),
                        presence_penalty: randomRange(0.0, 0.10),
                        n,
                        user
                    });
        
                    const { choices } = openaiResult;

                    results.push(choices.map(choice => choice.message.content!));
                    
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

    const generatedElements = cleanTexts(flattenArray(results));

    const totalTime = Date.now() - startTime;

    log('End of generation');
    log(`   Ellapsed ${totalTime / 1000}` );
    log(`   ${attempts} attempts`);
    log(`   ${attempts - failures} sucess`);
    log(`   ${failures} failures`);
    log(`   ${generatedElements.length} elements generated`);

    const result: TextGenResult = {
        generated: Timestamp.now(),
        data: generatedElements,
        model
    }

    return result;
}