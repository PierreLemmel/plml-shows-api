import { ElevenLabsClient } from 'elevenlabs';
import { env } from 'process';
import { RangeOrValue } from '../../aleas/aleas-generation';
import { getValue } from '../../aleas/aleas-generation-utils';
import { uploadFile } from '../../api/firebase';
import { pathCombine } from '../../core/files';

const client = new ElevenLabsClient({
    apiKey: env.ELEVENLABS_API_KEY,
});

export type AleasVoices = keyof typeof aleasVoices;

const aleasVoices = {
    "Audrey": "McVZB9hVxVSk3Equu8EH",
    "Daniel": "onwK4e9ZLuTAKqWW03F9",
    "Guillaume": "ohItIVrXTBI80RrUECOD",
    "Lily": "pFZP5JQG7iQjIQuC4Bku",
} as const;

export const getAllAleasVoices = () => Object.keys(aleasVoices) as AleasVoices[];

export type VoiceGenOptions = {
    text: string;
    settings: {
        stability: number;
        similarity_boost: number; 
        style: number;
        speed: number;
    },
    voice: AleasVoices;
    collection: string;
    name: string;
}

export const generateVoice = async (params: VoiceGenOptions) => {

    const {
        text,
        settings: {
            stability,
            similarity_boost,
            style,
            speed
        },
        voice,
        collection,
        name
    } = params

    const request: Parameters<typeof client.textToSpeech.convert>[1] = {
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
            stability,
            similarity_boost,
            style,
            speed,
            use_speaker_boost: true,
        },
        output_format: "mp3_44100_128",
        enable_logging: true,
    }

    const voiceId = aleasVoices[voice]

    const response = await client.textToSpeech.convertAsStream(voiceId, request)

    const chunks: Buffer[] = []
    for await (const chunk of response) {
        chunks.push(chunk)
    }

    const buffer = Buffer.concat(chunks)
    const uploaded = uploadFile(
        pathCombine("/aleas/voices", collection),
        buffer,
        `${name}.mp3`
    );

    return uploaded;
}

export type BatchGenerateVoicesOptions = {
    voices: AleasVoices[],
    collection: string;
    elements: {
        textChunks: string[];
        category: string;
        name: string;
    }[];
    settings: {
        stability: RangeOrValue;
        similarity_boost: RangeOrValue;
        style: RangeOrValue;
        speed: RangeOrValue;
    };
    pauseDuration: RangeOrValue;
}


export type BatchGenerateVoiceResultElement = {
    generationOptions: VoiceGenOptions;
    downloadUrl: string;
}

export type BatchGenerateVoiceResult = {
    elements: BatchGenerateVoiceResultElement[]
}

export const batchGenerateVoices = async (params: BatchGenerateVoicesOptions) => {

    const {
        voices,
        collection,
        elements,
        settings: {
            stability,
            similarity_boost,
            style,
            speed
        },
        pauseDuration
    } = params;

    const resultElts: BatchGenerateVoiceResultElement[] = []

    for (const elt of elements) {

        const {
            textChunks,
            category,
            name
        } = elt;

        for (let i = 0; i < voices.length; i++) {

            const fullName = pathCombine(
                category,
                `${name}-${i.toString().padStart(2, '0')}`
            )

            const text = textChunks.reduce((prev, chunk) => {
                const pause = getValue(pauseDuration);                

                return prev + ` <break time="${pause}s" />` + chunk
            })

            const settings = {
                stability: getValue(stability),
                similarity_boost: getValue(similarity_boost),
                style: getValue(style),
                speed: getValue(speed),
            }

            const voiceGenParams: VoiceGenOptions = {
                text,
                settings,
                voice: voices[i],
                collection,
                name: fullName
            }

            try {
                console.log(`Generating voice '${fullName}'`)
                const { downloadUrl } = await generateVoice(voiceGenParams);
                console.log(`Voice '${fullName}' generated`)

                resultElts.push({
                    generationOptions: voiceGenParams,
                    downloadUrl
                })
            }
            catch(e) {
                console.error(e);
                console.error(`Failed to generate voice '${fullName}'`)
                console.log(voiceGenParams);
            }
        }
    }

    return {
        elements: resultElts
    } satisfies BatchGenerateVoiceResult;
}