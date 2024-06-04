import { CollectionInfo, getAudioClipCollection, listCollections } from '@/lib/services/api/audio';
import { AudioClipCollection, AudioClipData } from '@/lib/services/audio/audioControl';
import type { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse<AudioClipData[]>) => {
	
    const name = <string> req.query["collection"];

    const collection = await getAudioClipCollection(name);
    const clips: AudioClipData[] = [];
    for (const clipName in collection.clips) {
        clips.push(collection.clips[clipName]);
    }
    res.status(200).json(clips);
}

export default handler;