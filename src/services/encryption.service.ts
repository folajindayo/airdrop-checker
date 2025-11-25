import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import logger from '../utils/logger';
import { AppError } from '../utils/errors';

/**
 * Validation schema for request
 */
const requestSchema = z.object({
  id: z.string().uuid(),
  data: z.record(z.unknown()),
  timestamp: z.number().int().positive(),
});

/**
 * Service layer for business logic
 */
export class FeatureService {
  private cache: Map<string, any>;

  constructor() {
    this.cache = new Map();
  }

  /**
   * Process data with validation and error handling
   */
  async process(input: z.infer<typeof requestSchema>): Promise<any> {
    try {
      // Check cache first
      const cacheKey = `${input.id}:${input.timestamp}`;
      if (this.cache.has(cacheKey)) {
        logger.debug('Cache hit', { cacheKey });
        return this.cache.get(cacheKey);
      }

      // Process logic here
      const result = await this.performOperation(input);
      
      // Update cache
      this.cache.set(cacheKey, result);
      
      return result;
    } catch (error) {
      logger.error('Processing failed', { error, input });
      throw new AppError('Processing failed', 500, { cause: error });
    }
  }

  private async performOperation(input: any): Promise<any> {
    // Simulate async operation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: input.data,
          processedAt: Date.now(),
        });
      }, 10);
    });
  }

  /**
   * Clear cache entries
   */
  clearCache(): void {
    this.cache.clear();
    logger.info('Cache cleared');
  }
}

/**
 * Controller middleware
 */
export const featureController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validated = requestSchema.parse(req.body);
    const service = new FeatureService();
    const result = await service.process(validated);
    
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export default featureController;
