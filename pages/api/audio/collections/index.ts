import { CollectionInfo, listCollections } from '@/lib/services/api/audio';
import type { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse<CollectionInfo[]>) => {
	
    const librairies = await listCollections();
    res.status(200).json(librairies);
}

export default handler;