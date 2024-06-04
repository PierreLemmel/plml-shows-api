import { getAudioClip } from '@/lib/services/api/audio';
import { AudioClipData } from '@/lib/services/audio/audioControl';
import type { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse<AudioClipData>) => {
	
    const collectionName = <string> req.query["collection"];
    const clipName = <string> req.query["clip"];

    const result = await getAudioClip(collectionName, clipName);
    
    res.status(200).json(result);
}

export default handler;