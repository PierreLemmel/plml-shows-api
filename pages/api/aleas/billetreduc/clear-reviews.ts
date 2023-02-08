import { clearBilletReducReviews } from "@/services/billetreduc";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	
    if(req.method !== 'POST' && !process.env.DEV) {
        res.status(405).end();
    }

    const reviews = await clearBilletReducReviews();
	res.status(200).json(reviews);
}