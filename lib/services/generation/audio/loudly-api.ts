import { Timestamp } from "firebase/firestore";
import { env } from "process";
import { AudioClipData, AudioClipInfo } from "../../audio/audioControl";
import { urlCombine } from "../../core/files";
import { MinMax } from "../../core/types/utils";
import { delay, generateId, randomRange, sequence } from "../../core/utils";
import { LoudlyGenre, LoudlyKey } from "./loudly";

export type LoudlyGenerationOptions = {
    genre: LoudlyGenre;
    count?: number;
    duration?: MinMax|number;
    bpm?: MinMax|number;
};


type LoudlyCredentials = {
    url: string;
    apiKey: string;
}

const getLoudlyApiCredentials = (): LoudlyCredentials => {
    
    const url = env.LOUDLY_API_URL;
    const apiKey = env.LOUDLY_API_KEY;

    if (!url || !apiKey) {
        throw new Error('Missing Loudly API credentials');
    }

    return { url, apiKey };
};

type LoudlyAPI = {
    [endpoint: string]: string
}

const loudlyMusicApi: LoudlyAPI = {
    getSongs: '/b2b/songs',
    getGenres: '/b2b/ai/genres',
    getTags: 'b2b/songs/tags',
    createSong: 'b2b/ai/songs',
} as const;

type CreateLoudlySongRequest = {
    genre: LoudlyGenre;
    duration?: number;
    energy?: string;
    bpm?: number;
    key_root?: LoudlyKey;
    key_quality?: string;
}

type CreateLoudlySongResponse = {
    id: string;
    title: string;
    duration: number;
    music_file_path: string;
    xml_file_path: string;
    wave_form_file_path: string;
    created_at: string;
    bpm: number;
    key: {
        id: number;
        name: LoudlyKey;
        active: boolean;
    }
}

const getValueForMinMaxOrNumber = (input: number|MinMax|undefined): number|undefined => {
    if (typeof input === 'number') {
        return input;
    }
    else if (input) {
        return randomRange(input.min, input.max);
    }
    else {
        return undefined;
    }
}

type GeneratedLoudlySongResult = {
    downloadUrl: string;
    name: string;
    info: AudioClipInfo;
}

export async function generateLoudlySongs(options: LoudlyGenerationOptions): Promise<GeneratedLoudlySongResult[]> {

    const {
        count = 1,
        genre,
        duration,
        bpm
    } = options;

    const {
        url: baseUrl,
        apiKey
    } = getLoudlyApiCredentials();

    const url = urlCombine(baseUrl, loudlyMusicApi.createSong);
    
    const tasks = sequence(count).map(async (i) => {
        try {
            console.log(`Generating song ${i + 1} of ${count}`);

            const formData = new FormData();
            formData.append('genre', genre);
            formData.append('duration', getValueForMinMaxOrNumber(duration)?.toString() ?? '');
            formData.append('bpm', getValueForMinMaxOrNumber(bpm)?.toString() ?? '');

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    accept: 'application/json',
                    'API-KEY': apiKey,
                    contentType: 'multiform/form-data'
                },
                body: formData
            })
            console.log(`Generated song ${i + 1} of ${count}`);

            const result = await response.json() as CreateLoudlySongResponse;

            const info: AudioClipInfo = {
                duration: result.duration,
                tempo: result.bpm,
                signature: "4 / 4",
                source: "Loudly",
                categories: [],
                tags: []
            }

            return {
                downloadUrl: result.music_file_path,
                name: result.title,
                info,
            } satisfies GeneratedLoudlySongResult;
        }
        catch (err) {
            console.error(`Failed to generate song ${i + 1}`);
            console.error(err);

            throw err;
        }
    });

    const result = await Promise.all(tasks);

    return result;
}

export default generateLoudlySongs;