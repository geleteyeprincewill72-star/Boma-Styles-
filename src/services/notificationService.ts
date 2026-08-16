/**
 * AURA MODULAR BACKEND SERVICE ABSTRACTION LAYER
 * Notification Service
 */

import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  updateDoc 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../utils/firebase';
import { authService } from './authService';

export interface AuraNotification {
  id: string;
  recipientId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'system' | 'p2p_transfer';
  postId?: string;
  chatId?: string;
  messageText?: string;
  read: boolean;
  timestamp: number;
}

export interface INotificationService {
  getNotifications(userId: string): Promise<AuraNotification[]>;
  listenToNotifications(userId: string, callback: (notifications: AuraNotification[]) => void): () => void;
  markAsRead(notificationId: string): Promise<void>;
  sendNotification(notification: Omit<AuraNotification, 'id' | 'timestamp' | 'read'>): Promise<void>;
}

class FirebaseNotificationService implements INotificationService {
  async getNotifications(userId: string): Promise<AuraNotification[]> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('recipientId', '==', userId),
        orderBy('timestamp', 'desc')
      );
      const snap = await getDocs(q);
      const list: AuraNotification[] = [];
      snap.forEach(d => list.push(d.data() as AuraNotification));
      return list;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'notifications');
      return [];
    }
  }

  listenToNotifications(userId: string, callback: (notifications: AuraNotification[]) => void): () => void {
    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    return onSnapshot(q, (snap) => {
      const list: AuraNotification[] = [];
      snap.forEach(d => list.push(d.data() as AuraNotification));
      callback(list);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'notifications');
    });
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      const ref = doc(db, 'notifications', notificationId);
      await updateDoc(ref, { read: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `notifications/${notificationId}`);
    }
  }

  async sendNotification(notification: Omit<AuraNotification, 'id' | 'timestamp' | 'read'>): Promise<void> {
    const notifId = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    try {
      const fullNotif: AuraNotification = {
        ...notification,
        id: notifId,
        read: false,
        timestamp: Date.now()
      };
      await setDoc(doc(db, 'notifications', notifId), fullNotif);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `notifications/${notifId}`);
    }
  }
}

export const notificationService = new FirebaseNotificationService();
