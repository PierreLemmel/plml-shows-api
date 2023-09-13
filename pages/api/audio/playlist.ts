import type { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	
	if(req.method === 'POST') {
        
        console.log(req);
        res.status(200);

    }
    else {
        res.status(405);
    }
}

export default handler;