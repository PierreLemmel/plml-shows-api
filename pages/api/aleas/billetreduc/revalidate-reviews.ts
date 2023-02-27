import { withAuth } from '@/lib/middlewares/withauth';
import type { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	
	if(req.method !== 'POST' && !process.env.DEV) {
        res.status(405);
    }

	await res.revalidate('/billetreduc');
    res.status(200);
}

export default withAuth(handler);