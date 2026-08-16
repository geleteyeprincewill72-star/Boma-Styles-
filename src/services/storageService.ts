/**
 * AURA MODULAR BACKEND SERVICE ABSTRACTION LAYER
 * Storage Service (Firebase Storage + Private Local Storage Adapter)
 */

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../utils/firebase';
import { authService } from './authService';
import { deviceStorageService } from './deviceStorageService';

export interface StorageUploadOptions {
  folder?: string;
  maxSizeBytes?: number; // default 25MB
  allowedMimeTypes?: string[];
  isPrivateLocalOnly?: boolean;
}

export interface IStorageService {
  uploadFile(file: File | Blob, fileName: string, options?: StorageUploadOptions): Promise<string>;
  saveLocalDraftAsset(id: string, fileData: string): Promise<string>;
}

const DEFAULT_MAX_SIZE = 25 * 1024 * 1024; // 25 MB

class FirebaseStorageService implements IStorageService {
  async uploadFile(file: File | Blob, fileName: string, options?: StorageUploadOptions): Promise<string> {
    const user = authService.getCurrentUser();
    if (!user) throw new Error("Authentication required for cloud storage upload.");

    const maxSize = options?.maxSizeBytes || DEFAULT_MAX_SIZE;
    if (file.size > maxSize) {
      throw new Error(`File exceeds maximum size limit of ${Math.round(maxSize / (1024 * 1024))}MB.`);
    }

    if (options?.allowedMimeTypes && options.allowedMimeTypes.length > 0) {
      const mime = file.type;
      const isAllowed = options.allowedMimeTypes.some(t => {
        if (t.endsWith('/*')) {
          const prefix = t.split('/')[0];
          return mime.startsWith(prefix);
        }
        return mime === t;
      });
      if (!isAllowed) {
        throw new Error(`Unsupported file type: ${mime}`);
      }
    }

    // If client requested private device storage only
    if (options?.isPrivateLocalOnly) {
      const localId = `local_${Date.now()}_${fileName}`;
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onload = async () => {
          await deviceStorageService.saveDraft(localId, reader.result);
          resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    // Cloud Storage under scoped user path: /users/{uid}/[folder]/[timestamp]_[fileName]
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const folder = options?.folder || 'media';
    const storagePath = `users/${user.uid}/${folder}/${Date.now()}_${cleanFileName}`;

    try {
      const fileRef = ref(storage, storagePath);
      const snapshot = await uploadBytes(fileRef, file, {
        contentType: file.type || 'application/octet-stream',
        customMetadata: {
          uploadedBy: user.uid,
          originalName: fileName
        }
      });
      return await getDownloadURL(snapshot.ref);
    } catch (err: any) {
      console.warn("Storage upload notice (falling back to device storage):", err?.message || err);
      // Seamless fallback to base64 device persistence
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }
  }

  async saveLocalDraftAsset(id: string, fileData: string): Promise<string> {
    await deviceStorageService.saveDraft(id, fileData);
    return fileData;
  }
}

export const storageService = new FirebaseStorageService();
