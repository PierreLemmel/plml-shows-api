import { withAuth } from '@/lib/middlewares/withauth';
import { regenerateThanksMessagesCollection, ThanksMessagesCollection } from '@/lib/services/aleas/misc/aleas-thanks';
import type { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse<ThanksMessagesCollection>) => {
	
	if(req.method !== 'POST' && !process.env.DEV) {
        res.status(405);
    }
    
	const collection = <string> req.query["collection"];

	const reviews = await regenerateThanksMessagesCollection(collection);
	res.status(200).json(reviews);
}

export default withAuth(handler);