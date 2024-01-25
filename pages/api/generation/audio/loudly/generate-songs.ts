import { withAuth } from '@/lib/middlewares/withauth';
import { importAudioClip } from '@/lib/services/api/audio';
import { MinMax } from '@/lib/services/core/types/utils';
import { getCorrespondingLoudlyGenre } from '@/lib/services/generation/audio/loudly';
import generateLoudlySongs, { LoudlyGenerationOptions } from '@/lib/services/generation/audio/loudly-api';
import type { NextApiRequest, NextApiResponse } from 'next';

const parseQueryParamAsNumber = (param: string | string[] | undefined): number|undefined => {
    if (!param || Array.isArray(param)) {
        return undefined;
    }
    else {
        return parseInt(param);
    }
}

const parseQueryParamAsString = (param: string | string[] | undefined): string|undefined => {
    if (!param || Array.isArray(param)) {
        return undefined;
    }
    else {
        return param;
    }

}

const parseMinMaxOrNumberFromQuery = (query: NextApiRequest["query"], key: string): MinMax|number|undefined => {
    const numberVal = parseQueryParamAsNumber(query[key]);
    if (numberVal) {
        return numberVal;
    }
    
    const min = parseQueryParamAsNumber(query[`min-${key}`]);
    const max = parseQueryParamAsNumber(query[`max-${key}`]);
    if (min && max) {
        return { min, max };
    }

    return undefined;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	
	if(req.method !== 'POST' && !process.env.DEV) {
        res.status(405);
    }
    
    const query = req.query;

    const rawGenre = parseQueryParamAsString(query.genre);
    const count = parseQueryParamAsNumber(query.count);
    const duration = parseMinMaxOrNumberFromQuery(query, 'duration');
    const bpm = parseMinMaxOrNumberFromQuery(query, 'bpm');
    
    if (!rawGenre) {
        res.status(400).json({ error: 'Genre is required' });
        return;
    }

    const genre = getCorrespondingLoudlyGenre(rawGenre);
    if (!genre) {
        res.status(400).json({ error: 'Invalid genre' });
        return;
    }

    const options: LoudlyGenerationOptions = {
        genre,
        count,
        duration,
        bpm
    }
    const generationResult = await generateLoudlySongs(options);

    generationResult.forEach(async (gr) => {

        const { name, info, downloadUrl } = gr;
        const response = await fetch(downloadUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.blob();

        await importAudioClip(data, name, info);
    });
	
	res.status(200).json(generationResult);
}

export default withAuth(handler);