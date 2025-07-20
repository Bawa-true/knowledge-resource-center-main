import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// File validation utilities
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'video/mp4',
  'video/avi',
  'video/quicktime',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'application/zip',
  'application/x-rar-compressed'
];

export const MAX_FILE_SIZE = 300 * 1024 * 1024; // 300MB

export function validateFile(file: File): { isValid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { isValid: false, error: `File size exceeds ${formatFileSize(MAX_FILE_SIZE)}` };
  }

  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return { isValid: false, error: 'File type not supported' };
  }

  return { isValid: true };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getFileIcon(file: File): string {
  const type = file.type;
  if (type.includes('video')) return 'video';
  if (type.includes('image')) return 'image';
  if (type.includes('pdf')) return 'pdf';
  if (type.includes('zip') || type.includes('rar')) return 'archive';
  if (type.includes('powerpoint') || type.includes('presentation')) return 'presentation';
  if (type.includes('word') || type.includes('document')) return 'document';
  return 'file';
}

export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop();
  return `${timestamp}-${random}.${extension}`;
}
