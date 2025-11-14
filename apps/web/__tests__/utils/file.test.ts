/**
 * @fileoverview Tests for file utilities
 */

import {
  formatFileSize,
  getFileExtension,
  getFileNameWithoutExtension,
  isValidFileType,
  isValidFileSize,
  getMimeType,
  fileToBase64,
  base64ToFile,
  downloadText,
  downloadJSON,
  downloadCSV,
  readFileAsText,
  readFileAsArrayBuffer,
  getFileCategory,
  isImageFile,
  isDocumentFile,
  isVideoFile,
  isAudioFile,
  generateUniqueFilename,
  sanitizeFilename,
  chunkFile,
  calculateFileHash,
  FileCategory,
} from '@/lib/utils/file';

describe('File Utilities', () => {
  describe('formatFileSize', () => {
    it('should format bytes', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(500)).toBe('500 Bytes');
      expect(formatFileSize(1023)).toBe('1023 Bytes');
    });

    it('should format kilobytes', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(5120)).toBe('5 KB');
    });

    it('should format megabytes', () => {
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(5242880)).toBe('5 MB');
    });

    it('should format gigabytes', () => {
      expect(formatFileSize(1073741824)).toBe('1 GB');
    });

    it('should respect decimal places', () => {
      expect(formatFileSize(1536, 0)).toBe('2 KB');
      expect(formatFileSize(1536, 1)).toBe('1.5 KB');
      expect(formatFileSize(1536, 2)).toBe('1.5 KB');
    });
  });

  describe('getFileExtension', () => {
    it('should extract extension', () => {
      expect(getFileExtension('file.txt')).toBe('txt');
      expect(getFileExtension('document.pdf')).toBe('pdf');
      expect(getFileExtension('image.jpg')).toBe('jpg');
    });

    it('should handle multiple dots', () => {
      expect(getFileExtension('file.name.txt')).toBe('txt');
    });

    it('should return lowercase', () => {
      expect(getFileExtension('FILE.TXT')).toBe('txt');
    });

    it('should handle no extension', () => {
      expect(getFileExtension('file')).toBe('');
    });
  });

  describe('getFileNameWithoutExtension', () => {
    it('should remove extension', () => {
      expect(getFileNameWithoutExtension('file.txt')).toBe('file');
      expect(getFileNameWithoutExtension('document.pdf')).toBe('document');
    });

    it('should handle multiple dots', () => {
      expect(getFileNameWithoutExtension('file.name.txt')).toBe('file.name');
    });

    it('should handle no extension', () => {
      expect(getFileNameWithoutExtension('file')).toBe('file');
    });
  });

  describe('isValidFileType', () => {
    it('should validate allowed types', () => {
      expect(isValidFileType('file.jpg', ['jpg', 'png'])).toBe(true);
      expect(isValidFileType('file.png', ['jpg', 'png'])).toBe(true);
    });

    it('should reject disallowed types', () => {
      expect(isValidFileType('file.pdf', ['jpg', 'png'])).toBe(false);
    });

    it('should be case insensitive', () => {
      expect(isValidFileType('file.JPG', ['jpg', 'png'])).toBe(true);
    });
  });

  describe('isValidFileSize', () => {
    it('should validate size', () => {
      expect(isValidFileSize(1000, 2000)).toBe(true);
      expect(isValidFileSize(2000, 2000)).toBe(true);
      expect(isValidFileSize(3000, 2000)).toBe(false);
    });
  });

  describe('getMimeType', () => {
    it('should return MIME type for images', () => {
      expect(getMimeType('jpg')).toBe('image/jpeg');
      expect(getMimeType('png')).toBe('image/png');
      expect(getMimeType('gif')).toBe('image/gif');
    });

    it('should return MIME type for documents', () => {
      expect(getMimeType('pdf')).toBe('application/pdf');
      expect(getMimeType('docx')).toContain('document');
    });

    it('should return MIME type for text', () => {
      expect(getMimeType('txt')).toBe('text/plain');
      expect(getMimeType('json')).toBe('application/json');
    });

    it('should return default for unknown', () => {
      expect(getMimeType('unknown')).toBe('application/octet-stream');
    });

    it('should be case insensitive', () => {
      expect(getMimeType('JPG')).toBe('image/jpeg');
    });
  });

  describe('fileToBase64', () => {
    it('should convert file to base64', async () => {
      const file = new File(['test content'], 'test.txt', {
        type: 'text/plain',
      });

      const base64 = await fileToBase64(file);

      expect(base64).toContain('data:');
      expect(base64).toContain('base64');
    });
  });

  describe('base64ToFile', () => {
    it('should convert base64 to file', () => {
      const base64 = 'data:text/plain;base64,dGVzdCBjb250ZW50';

      const file = base64ToFile(base64, 'test.txt');

      expect(file.name).toBe('test.txt');
      expect(file.type).toBe('text/plain');
    });

    it('should use custom MIME type', () => {
      const base64 = 'data:text/plain;base64,dGVzdA==';

      const file = base64ToFile(base64, 'test.txt', 'application/json');

      expect(file.type).toBe('application/json');
    });
  });

  describe('downloadText', () => {
    it('should create download link', () => {
      const createElementSpy = jest.spyOn(document, 'createElement');
      const appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation();
      const removeChildSpy = jest.spyOn(document.body, 'removeChild').mockImplementation();

      downloadText('test content', 'test.txt');

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(appendChildSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();

      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });
  });

  describe('downloadJSON', () => {
    it('should download JSON with formatting', () => {
      const spy = jest.spyOn(document.body, 'appendChild').mockImplementation();

      downloadJSON({ test: 'data' }, 'test.json');

      spy.mockRestore();
    });
  });

  describe('downloadCSV', () => {
    it('should download CSV', () => {
      const spy = jest.spyOn(document.body, 'appendChild').mockImplementation();

      downloadCSV(
        [
          ['Name', 'Age'],
          ['John', '30'],
        ],
        'test.csv'
      );

      spy.mockRestore();
    });
  });

  describe('readFileAsText', () => {
    it('should read file as text', async () => {
      const file = new File(['test content'], 'test.txt', {
        type: 'text/plain',
      });

      const text = await readFileAsText(file);

      expect(text).toBe('test content');
    });
  });

  describe('readFileAsArrayBuffer', () => {
    it('should read file as array buffer', async () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });

      const buffer = await readFileAsArrayBuffer(file);

      expect(buffer).toBeInstanceOf(ArrayBuffer);
    });
  });

  describe('FileCategory', () => {
    it('should have all categories', () => {
      expect(FileCategory.IMAGE).toContain('jpg');
      expect(FileCategory.DOCUMENT).toContain('pdf');
      expect(FileCategory.TEXT).toContain('txt');
      expect(FileCategory.ARCHIVE).toContain('zip');
      expect(FileCategory.AUDIO).toContain('mp3');
      expect(FileCategory.VIDEO).toContain('mp4');
    });
  });

  describe('getFileCategory', () => {
    it('should detect image files', () => {
      expect(getFileCategory('photo.jpg')).toBe('IMAGE');
      expect(getFileCategory('logo.png')).toBe('IMAGE');
    });

    it('should detect document files', () => {
      expect(getFileCategory('report.pdf')).toBe('DOCUMENT');
      expect(getFileCategory('data.xlsx')).toBe('DOCUMENT');
    });

    it('should detect text files', () => {
      expect(getFileCategory('notes.txt')).toBe('TEXT');
      expect(getFileCategory('data.json')).toBe('TEXT');
    });

    it('should detect archive files', () => {
      expect(getFileCategory('archive.zip')).toBe('ARCHIVE');
    });

    it('should detect audio files', () => {
      expect(getFileCategory('song.mp3')).toBe('AUDIO');
    });

    it('should detect video files', () => {
      expect(getFileCategory('movie.mp4')).toBe('VIDEO');
    });

    it('should return UNKNOWN for unrecognized files', () => {
      expect(getFileCategory('file.xyz')).toBe('UNKNOWN');
    });
  });

  describe('isImageFile', () => {
    it('should detect images', () => {
      expect(isImageFile('photo.jpg')).toBe(true);
      expect(isImageFile('logo.png')).toBe(true);
      expect(isImageFile('doc.pdf')).toBe(false);
    });
  });

  describe('isDocumentFile', () => {
    it('should detect documents', () => {
      expect(isDocumentFile('report.pdf')).toBe(true);
      expect(isDocumentFile('photo.jpg')).toBe(false);
    });
  });

  describe('isVideoFile', () => {
    it('should detect videos', () => {
      expect(isVideoFile('movie.mp4')).toBe(true);
      expect(isVideoFile('photo.jpg')).toBe(false);
    });
  });

  describe('isAudioFile', () => {
    it('should detect audio', () => {
      expect(isAudioFile('song.mp3')).toBe(true);
      expect(isAudioFile('photo.jpg')).toBe(false);
    });
  });

  describe('generateUniqueFilename', () => {
    it('should generate unique filename', () => {
      const filename1 = generateUniqueFilename('test.txt');
      const filename2 = generateUniqueFilename('test.txt');

      expect(filename1).not.toBe(filename2);
      expect(filename1).toContain('test');
      expect(filename1).toContain('.txt');
    });

    it('should preserve extension', () => {
      const filename = generateUniqueFilename('document.pdf');

      expect(filename).toMatch(/\.pdf$/);
    });
  });

  describe('sanitizeFilename', () => {
    it('should remove invalid characters', () => {
      expect(sanitizeFilename('file name.txt')).toBe('file_name.txt');
      expect(sanitizeFilename('file@name#.txt')).toBe('file_name_.txt');
    });

    it('should convert to lowercase', () => {
      expect(sanitizeFilename('FILE.TXT')).toBe('file.txt');
    });

    it('should remove multiple underscores', () => {
      expect(sanitizeFilename('file___name.txt')).toBe('file_name.txt');
    });

    it('should remove leading/trailing underscores', () => {
      expect(sanitizeFilename('_file_.txt')).toBe('file_.txt');
    });
  });

  describe('chunkFile', () => {
    it('should chunk file', () => {
      const file = new File(['0123456789'], 'test.txt');
      const chunks = Array.from(chunkFile(file, 3));

      expect(chunks.length).toBeGreaterThan(1);
      expect(chunks[0].size).toBeLessThanOrEqual(3);
    });

    it('should handle exact chunk size', () => {
      const file = new File(['012345'], 'test.txt');
      const chunks = Array.from(chunkFile(file, 3));

      expect(chunks).toHaveLength(2);
    });

    it('should handle file smaller than chunk size', () => {
      const file = new File(['01'], 'test.txt');
      const chunks = Array.from(chunkFile(file, 10));

      expect(chunks).toHaveLength(1);
    });
  });

  describe('calculateFileHash', () => {
    it('should calculate file hash', async () => {
      const file = new File(['test content'], 'test.txt');

      const hash = await calculateFileHash(file);

      expect(hash).toHaveLength(64); // SHA-256 produces 64 character hex string
      expect(hash).toMatch(/^[a-f0-9]+$/);
    });

    it('should produce same hash for same content', async () => {
      const file1 = new File(['test'], 'test1.txt');
      const file2 = new File(['test'], 'test2.txt');

      const hash1 = await calculateFileHash(file1);
      const hash2 = await calculateFileHash(file2);

      expect(hash1).toBe(hash2);
    });

    it('should produce different hash for different content', async () => {
      const file1 = new File(['test1'], 'test.txt');
      const file2 = new File(['test2'], 'test.txt');

      const hash1 = await calculateFileHash(file1);
      const hash2 = await calculateFileHash(file2);

      expect(hash1).not.toBe(hash2);
    });
  });
});

