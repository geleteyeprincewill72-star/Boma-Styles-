/**
 * AURA MODULAR BACKEND SERVICE ABSTRACTION LAYER
 * Device Storage & Private Local Persistence
 * 
 * Provides sandbox-isolated client-side device persistence for:
 * - Draft posts and video compositions
 * - Offline cached feeds and assets
 * - Temporary AI generation contexts
 * - Private device-level preferences & permissions state
 */

export interface DevicePermissionState {
  camera: 'prompt' | 'granted' | 'denied';
  microphone: 'prompt' | 'granted' | 'denied';
  photos: 'prompt' | 'granted' | 'denied';
  notifications: 'prompt' | 'granted' | 'denied';
}

const DB_NAME = 'AuraDeviceSandboxDB';
const DB_VERSION = 1;
const STORE_DRAFTS = 'drafts';
const STORE_CACHE = 'cache';
const STORE_AI_PROMPTS = 'temp_ai';

class DeviceStorageService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        return reject(new Error('IndexedDB is not supported in this environment'));
      }

      const req = indexedDB.open(DB_NAME, DB_VERSION);

      req.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_DRAFTS)) {
          db.createObjectStore(STORE_DRAFTS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_CACHE)) {
          db.createObjectStore(STORE_CACHE, { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains(STORE_AI_PROMPTS)) {
          db.createObjectStore(STORE_AI_PROMPTS, { keyPath: 'id' });
        }
      };

      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    return this.dbPromise;
  }

  // --- Local Drafts Management ---
  async saveDraft(id: string, data: any): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_DRAFTS, 'readwrite');
        const store = tx.objectStore(STORE_DRAFTS);
        const req = store.put({ id, data, updatedAt: Date.now() });
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      localStorage.setItem(`aura_draft_${id}`, JSON.stringify(data));
    }
  }

  async getDraft(id: string): Promise<any | null> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_DRAFTS, 'readonly');
        const store = tx.objectStore(STORE_DRAFTS);
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result ? req.result.data : null);
        req.onerror = () => resolve(null);
      });
    } catch {
      const local = localStorage.getItem(`aura_draft_${id}`);
      return local ? JSON.parse(local) : null;
    }
  }

  async deleteDraft(id: string): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(STORE_DRAFTS, 'readwrite');
      tx.objectStore(STORE_DRAFTS).delete(id);
    } catch {
      localStorage.removeItem(`aura_draft_${id}`);
    }
  }

  // --- Temporary AI Prompts & Memory Cache ---
  async saveTempAiSession(sessionId: string, messages: any[]): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(STORE_AI_PROMPTS, 'readwrite');
      tx.objectStore(STORE_AI_PROMPTS).put({ id: sessionId, messages, timestamp: Date.now() });
    } catch {
      sessionStorage.setItem(`aura_ai_temp_${sessionId}`, JSON.stringify(messages));
    }
  }

  async clearAllTempAiData(): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(STORE_AI_PROMPTS, 'readwrite');
      tx.objectStore(STORE_AI_PROMPTS).clear();
    } catch {
      sessionStorage.clear();
    }
  }

  // --- Permissions Tracking & Explanations ---
  getPermissionState(permission: keyof DevicePermissionState): 'prompt' | 'granted' | 'denied' {
    const val = localStorage.getItem(`aura_perm_${permission}`);
    return (val as any) || 'prompt';
  }

  setPermissionState(permission: keyof DevicePermissionState, state: 'prompt' | 'granted' | 'denied') {
    localStorage.setItem(`aura_perm_${permission}`, state);
  }
}

export const deviceStorageService = new DeviceStorageService();
