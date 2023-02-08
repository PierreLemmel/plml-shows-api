import { getStaticBilletReducReviews, StaticReviewsData } from "@/services/billetreduc";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse<StaticReviewsData>) {
	
    if(req.method !== 'GET') {
        res.status(405).end();
    }

    const result = await getStaticBilletReducReviews();
	res.status(200).json(result);
}