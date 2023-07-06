import { withAuth } from '@/lib/middlewares/withauth';
import { generateId } from '@/lib/services/core/utils';
import type { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse<string>) => {

	const result = generateId();
	res.status(200).json(result);
}

export default withAuth(handler);