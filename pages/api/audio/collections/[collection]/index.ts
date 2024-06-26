import { CollectionInfo, getAudioClipCollection, listCollections } from '@/lib/services/api/audio';
import { AudioClipCollection } from '@/lib/services/audio/audioControl';
import type { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse<AudioClipCollection>) => {
	
    const name = <string> req.query["collection"];

    const collection = await getAudioClipCollection(name);
    res.status(200).json(collection);
}

export default handler;