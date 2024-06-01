import { CollectionInfo, getAudioClipCollection, listCollections } from '@/lib/services/api/audio';
import { AudioClipCollection } from '@/lib/services/audio/audioControl';
import type { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse<AudioClipCollection>) => {
	
    const collection = await getAudioClipCollection();
    res.status(200).json(collection);
}

export default handler;