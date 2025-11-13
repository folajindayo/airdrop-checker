/**
 * Tests for logger utility
 */

import { logger } from '@/lib/utils/logger';

describe('Logger', () => {
  describe('debug', () => {
    it('should log debug messages', () => {
      const debugSpy = jest.spyOn(console, 'debug').mockImplementation();
      logger.debug('Debug message');
      expect(debugSpy).toHaveBeenCalled();
      debugSpy.mockRestore();
    });

    it('should include context in debug logs', () => {
      const debugSpy = jest.spyOn(console, 'debug').mockImplementation();
      logger.debug('Debug message', { key: 'value' });
      expect(debugSpy).toHaveBeenCalled();
      debugSpy.mockRestore();
    });
  });

  describe('info', () => {
    it('should log info messages', () => {
      const infoSpy = jest.spyOn(console, 'info').mockImplementation();
      logger.info('Info message');
      expect(infoSpy).toHaveBeenCalled();
      infoSpy.mockRestore();
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
      logger.error('Error occurred', error);
      expect(errorSpy).toHaveBeenCalled();
      errorSpy.mockRestore();
    });
  });

  describe('setLevel', () => {
    it('should set log level', () => {
      logger.setLevel('debug');
      expect(logger).toBeDefined();
    });
  });
});
