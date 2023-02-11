import { withAuth } from "@/lib/middlewares/withauth";
import { clearBilletReducReviews } from "@/lib/services/billetreduc";
import { NextApiRequest, NextApiResponse } from "next";

async function handler(req: NextApiRequest, res: NextApiResponse) {
	
    if(req.method !== 'POST' && !process.env.DEV) {
        res.status(405).end();
    }

    const reviews = await clearBilletReducReviews();
	res.status(200).json(reviews);
}

export default withAuth(handler);