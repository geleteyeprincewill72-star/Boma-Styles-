/**
 * AURA MODULAR BACKEND SERVICE ABSTRACTION LAYER
 * User & Profile Management Service
 */

import { doc, getDoc, updateDoc, collection, getDocs, setDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../utils/firebase';
import { UserProfile, authService } from './authService';

export interface IUserService {
  getProfile(uid: string): Promise<UserProfile | null>;
  updateProfile(uid: string, updates: Partial<Omit<UserProfile, 'uid' | 'role' | 'createdAt'>>): Promise<void>;
  searchUsers(searchQuery: string): Promise<UserProfile[]>;
  followUser(followerId: string, targetId: string): Promise<void>;
  unfollowUser(followerId: string, targetId: string): Promise<void>;
  isFollowing(followerId: string, targetId: string): Promise<boolean>;
}

class FirebaseUserService implements IUserService {
  async getProfile(uid: string): Promise<UserProfile | null> {
    return authService.getUserProfile(uid);
  }

  async updateProfile(uid: string, updates: Partial<Omit<UserProfile, 'uid' | 'role' | 'createdAt'>>): Promise<void> {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.uid !== uid) {
      throw new Error("Unauthorized profile modification attempt.");
    }

    try {
      const userRef = doc(db, 'users', uid);
      // Strip forbidden keys to prevent role manipulation
      const sanitized: any = { ...updates };
      delete sanitized.role;
      delete sanitized.uid;
      delete sanitized.createdAt;

      await updateDoc(userRef, sanitized);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
    }
  }

  async searchUsers(searchQuery: string): Promise<UserProfile[]> {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      const q = searchQuery.toLowerCase();
      const results: UserProfile[] = [];
      snapshot.forEach(docSnap => {
        const u = docSnap.data() as UserProfile;
        if (u.username?.toLowerCase().includes(q) || u.displayName?.toLowerCase().includes(q)) {
          results.push(u);
        }
      });
      return results;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'users');
      return [];
    }
  }

  async followUser(followerId: string, targetId: string): Promise<void> {
    try {
      const followId = `${followerId}_${targetId}`;
      await setDoc(doc(db, 'follows', followId), {
        followerId,
        targetId,
        timestamp: Date.now()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `follows/${followerId}_${targetId}`);
    }
  }

  async unfollowUser(followerId: string, targetId: string): Promise<void> {
    try {
      const followId = `${followerId}_${targetId}`;
      await deleteDoc(doc(db, 'follows', followId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `follows/${followerId}_${targetId}`);
    }
  }

  async isFollowing(followerId: string, targetId: string): Promise<boolean> {
    try {
      const followId = `${followerId}_${targetId}`;
      const snap = await getDoc(doc(db, 'follows', followId));
      return snap.exists();
    } catch {
      return false;
    }
  }
}

export const userService = new FirebaseUserService();
