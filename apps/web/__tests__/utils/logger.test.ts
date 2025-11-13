/**
 * Tests for logger utility
 */

import { Logger } from '@/lib/utils/logger';

describe('Logger', () => {
  let logger: Logger;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    logger = new Logger('test');
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('debug', () => {
    it('should log debug messages', () => {
      logger.debug('Debug message');
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should include context in debug logs', () => {
      logger.debug('Debug message', { key: 'value' });
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('info', () => {
    it('should log info messages', () => {
      logger.info('Info message');
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('warn', () => {
    it('should log warning messages', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      logger.warn('Warning message');
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });

  describe('error', () => {
    it('should log error messages', () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      logger.error('Error message');
      expect(errorSpy).toHaveBeenCalled();
      errorSpy.mockRestore();
    });

    it('should log error objects', () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Test error');
      logger.error('Error occurred', { error });
      expect(errorSpy).toHaveBeenCalled();
      errorSpy.mockRestore();
    });
  });
});

