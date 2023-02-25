import { withAuth } from '@/lib/middlewares/withauth';
import runPendingMigrations, { MigrationResult } from '@/lib/services/migrations';
import type { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse<MigrationResult>) => {
	
	if(req.method !== 'POST' && !process.env.DEV) {
        res.status(405);
    }

	const result = await runPendingMigrations();
	res.status(200).json(result);
}

export default withAuth(handler);