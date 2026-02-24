import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Express middleware that generates a unique requestId (UUID v4)
 * for each incoming request and attaches it to the request object.
 * This requestId is used for tracing and logging throughout the request lifecycle.
 */
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const requestId = uuidv4();
  (req as any).requestId = requestId;
  next();
}
