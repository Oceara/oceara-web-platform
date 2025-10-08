/**
 * Request Logger Middleware
 * Comprehensive request/response logging
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export interface RequestWithLog extends Request {
  requestId?: string;
  startTime?: number;
}

/**
 * Request ID middleware
 */
export const requestId = (req: RequestWithLog, res: Response, next: NextFunction) => {
  req.requestId = uuidv4();
  res.setHeader('X-Request-ID', req.requestId);
  next();
};

/**
 * Request logger middleware
 */
export const requestLogger = (req: RequestWithLog, res: Response, next: NextFunction) => {
  req.startTime = Date.now();

  // Log request
  logger.info({
    type: 'REQUEST',
    requestId: req.requestId,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: (req as any).user?.id,
    body: sanitizeBody(req.body),
    query: req.query,
    params: req.params
  });

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - req.startTime!;
    
    const logData = {
      type: 'RESPONSE',
      requestId: req.requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('content-length'),
      userId: (req as any).user?.id
    };

    if (res.statusCode >= 500) {
      logger.error(logData);
    } else if (res.statusCode >= 400) {
      logger.warn(logData);
    } else {
      logger.info(logData);
    }
  });

  next();
};

/**
 * Sanitize request body (remove sensitive data)
 */
function sanitizeBody(body: any): any {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'privateKey'];
  const sanitized = { ...body };

  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  }

  return sanitized;
}
