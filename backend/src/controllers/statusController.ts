import { Request, Response } from 'express';

export function getStatus(_req: Request, res: Response) {
  res.json({ status: 'OK', message: 'Prism backend is running.' });
}
