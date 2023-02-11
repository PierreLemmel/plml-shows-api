import { withAuth } from '@/lib/middlewares/withauth';
import { regenerateBilletReducData, ReviewsData } from '@/lib/services/billetreduc';
import type { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse<ReviewsData>) => {
	
	if(req.method !== 'POST' && !process.env.DEV) {
        res.status(405);
    }

	const regenerate = req.query.regenerate === "true"

	const reviews = await regenerateBilletReducData(regenerate);
	res.status(200).json(reviews);
}

export default withAuth(handler);