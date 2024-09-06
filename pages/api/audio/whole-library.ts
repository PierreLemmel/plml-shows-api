import { CollectionInfo, getWholeLibrairy, WholeLibrairyInfo } from '@/lib/services/api/audio';
import type { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse<WholeLibrairyInfo>) => {
	
    const librairy = await getWholeLibrairy();
    res.status(200).json(librairy);
}

export default handler;