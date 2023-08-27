import { ClientOptions, OpenAI } from "openai";

export function createOpenAI() {
    const configuration: ClientOptions = {
		organization: process.env.OPENAI_ORGANIZATION_ID,
		apiKey: process.env.OPENAI_API_KEY,
	};

	const openai = new OpenAI(configuration);

    return openai;
}