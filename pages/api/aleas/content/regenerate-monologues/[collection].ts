import { withAuth } from '@/lib/middlewares/withauth';
import { batchGenerateMonologues } from '@/lib/services/aleas/aleas-api';
import type { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	
	if(req.method !== 'POST' && !process.env.DEV) {
        res.status(405);
    }
    
	const collection = <string> req.query["collection"];

	const reviews = await batchGenerateMonologues(collection);
	res.status(200).json(reviews);
}

export default withAuth(handler);