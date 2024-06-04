import axios from 'axios';
import { getAudioClip } from '@/lib/services/api/audio';
import { AudioClipData } from '@/lib/services/audio/audioControl';
import type { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	
    const collectionName = <string> req.query["collection"];
    const clipName = <string> req.query["clip"];

    const clip = await getAudioClip(collectionName, clipName);
    
    const { url } = clip;
    
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename=${clipName}.mp3`);

    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    });

    response.data.pipe(res);
}

export default handler;