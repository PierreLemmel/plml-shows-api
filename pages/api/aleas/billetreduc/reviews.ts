import { getBilletReducReviews, ReviewsData } from "@/services/billetreduc";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse<ReviewsData>) {
	
    if(req.method !== 'GET') {
        res.status(405).end();
    }

    const result = await getBilletReducReviews();
	res.status(200).json(result);
}