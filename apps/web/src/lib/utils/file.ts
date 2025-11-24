/**
 * @fileoverview File utility functions
 * 
 * Provides utilities for file operations, validation, and formatting
 */

/**
 * Format file size to human-readable string
 */
export function formatFileSize(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  const match = filename.match(/\.([^.]+)$/);
  return match ? match[1].toLowerCase() : '';
}

/**
 * Get filename without extension
 */
export function getFileNameWithoutExtension(filename: string): string {
  return filename.replace(/\.[^.]+$/, '');
}

/**
 * Validate file type
 */
export function isValidFileType(
  filename: string,
  allowedTypes: string[]
): boolean {
  const extension = getFileExtension(filename);
  return allowedTypes.includes(extension);
}

/**
 * Validate file size
 */
export function isValidFileSize(size: number, maxSize: number): boolean {
  return size <= maxSize;
}

/**
 * Get MIME type from extension
 */
export function getMimeType(extension: string): string {
  const mimeTypes: Record<string, string> = {
    // Images
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    ico: 'image/x-icon',

    // Documents
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',

    // Text
    txt: 'text/plain',
    csv: 'text/csv',
    html: 'text/html',
    css: 'text/css',
    js: 'text/javascript',
    json: 'application/json',
    xml: 'application/xml',

    // Archives
    zip: 'application/zip',
    rar: 'application/x-rar-compressed',
    '7z': 'application/x-7z-compressed',
    tar: 'application/x-tar',
    gz: 'application/gzip',

    // Audio
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    m4a: 'audio/mp4',

    // Video
    mp4: 'video/mp4',
    avi: 'video/x-msvideo',
    mov: 'video/quicktime',
    wmv: 'video/x-ms-wmv',
    flv: 'video/x-flv',
    webm: 'video/webm',
  };

  return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
}

/**
 * Convert File to base64
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Convert base64 to File
 */
export function base64ToFile(
  base64: string,
  filename: string,
  mimeType?: string
): File {
  const arr = base64.split(',');
  const mime = mimeType || arr[0].match(/:(.*?);/)?.[1] || '';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
}

/**
 * Download file from URL
 */
export function downloadFile(url: string, filename: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Download blob as file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  downloadFile(url, filename);
  URL.revokeObjectURL(url);
}

/**
 * Download text as file
 */
export function downloadText(text: string, filename: string, mimeType = 'text/plain'): void {
  const blob = new Blob([text], { type: mimeType });
  downloadBlob(blob, filename);
}

/**
 * Download JSON as file
 */
export function downloadJSON(data: unknown, filename: string): void {
  const text = JSON.stringify(data, null, 2);
  downloadText(text, filename, 'application/json');
}

/**
 * Download CSV as file
 */
export function downloadCSV(data: string[][], filename: string): void {
  const csv = data.map((row) => row.join(',')).join('\n');
  downloadText(csv, filename, 'text/csv');
}

/**
 * Read file as text
 */
export async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Read file as array buffer
 */
export async function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Read file as data URL
 */
export async function readFileAsDataURL(file: File): Promise<string> {
  return fileToBase64(file);
}

/**
 * Compress image file
 */
export async function compressImage(
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  } = {}
): Promise<File> {
  const { maxWidth = 1920, maxHeight = 1080, quality = 0.8 } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        let { width, height } = img;

        // Calculate new dimensions
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Could not compress image'));
              return;
            }

            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });

            resolve(compressedFile);
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error('Could not load image'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Get image dimensions
 */
export async function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
        });
      };

      img.onerror = () => reject(new Error('Could not load image'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * File type categories
 */
export const FileCategory = {
  IMAGE: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico'],
  DOCUMENT: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'],
  TEXT: ['txt', 'csv', 'html', 'css', 'js', 'json', 'xml'],
  ARCHIVE: ['zip', 'rar', '7z', 'tar', 'gz'],
  AUDIO: ['mp3', 'wav', 'ogg', 'm4a'],
  VIDEO: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'],
} as const;

/**
 * Get file category
 */
export function getFileCategory(
  filename: string
): keyof typeof FileCategory | 'UNKNOWN' {
  const extension = getFileExtension(filename);

  for (const [category, extensions] of Object.entries(FileCategory)) {
    if (extensions.includes(extension)) {
      return category as keyof typeof FileCategory;
    }
  }

  return 'UNKNOWN';
}

/**
 * Check if file is an image
 */
export function isImageFile(filename: string): boolean {
  return getFileCategory(filename) === 'IMAGE';
}

/**
 * Check if file is a document
 */
export function isDocumentFile(filename: string): boolean {
  return getFileCategory(filename) === 'DOCUMENT';
}

/**
 * Check if file is a video
 */
export function isVideoFile(filename: string): boolean {
  return getFileCategory(filename) === 'VIDEO';
}

/**
 * Check if file is audio
 */
export function isAudioFile(filename: string): boolean {
  return getFileCategory(filename) === 'AUDIO';
}

/**
 * Generate unique filename
 */
export function generateUniqueFilename(originalFilename: string): string {
  const extension = getFileExtension(originalFilename);
  const nameWithoutExt = getFileNameWithoutExtension(originalFilename);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);

  return `${nameWithoutExt}-${timestamp}-${random}.${extension}`;
}

/**
 * Sanitize filename
 */
export function sanitizeFilename(filename: string): string {
  // Remove or replace invalid characters
  return filename
    .replace(/[^a-z0-9._-]/gi, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '')
    .toLowerCase();
}

/**
 * Chunk file for upload
 */
export function* chunkFile(
  file: File,
  chunkSize: number
): Generator<Blob, void, unknown> {
  let offset = 0;

  while (offset < file.size) {
    const chunk = file.slice(offset, offset + chunkSize);
    yield chunk;
    offset += chunkSize;
  }
}

/**
 * Calculate file hash (MD5)
 */
export async function calculateFileHash(file: File): Promise<string> {
  const buffer = await readFileAsArrayBuffer(file);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Copy file to clipboard
 */
export async function copyFileToClipboard(file: File): Promise<void> {
  if (!navigator.clipboard || !navigator.clipboard.write) {
    throw new Error('Clipboard API not supported');
  }

  const items = [new ClipboardItem({ [file.type]: file })];
  await navigator.clipboard.write(items);
}

/**
 * Paste file from clipboard
 */
export async function pasteFileFromClipboard(): Promise<File | null> {
  if (!navigator.clipboard || !navigator.clipboard.read) {
    throw new Error('Clipboard API not supported');
  }

  const items = await navigator.clipboard.read();

  for (const item of items) {
    for (const type of item.types) {
      if (type.startsWith('image/')) {
        const blob = await item.getType(type);
        return new File([blob], 'pasted-image.png', { type });
      }
    }
  }

  return null;
}

