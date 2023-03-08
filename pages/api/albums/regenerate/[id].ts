import { withAuth } from '@/lib/middlewares/withauth';
import { Album, regenerateAlbum } from '@/lib/services/photos';
import type { NextApiRequest, NextApiResponse } from 'next'

const handler = async (req: NextApiRequest, res: NextApiResponse<Album|string>) => {
    if (req.method === "POST" || process.env.DEV) {
        const id = <string> req.query["id"];
        
        const album = await regenerateAlbum(id)

        res.status(200).json(album);
    }
    else {
        res.status(400).json("Invalid request");
    }
}

export default withAuth(handler);