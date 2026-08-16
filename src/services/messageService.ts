/**
 * AURA MODULAR BACKEND SERVICE ABSTRACTION LAYER
 * Messaging Service with Retention Policy Engine
 * 
 * Supports:
 * - 1:1 and Group (Circle) chats
 * - End-to-end payload handling
 * - Automatic retention enforcement (Keep forever, 30 days, 90 days, 365 days)
 */

import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  orderBy, 
  onSnapshot, 
  updateDoc, 
  where,
  deleteDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../utils/firebase';
import { authService } from './authService';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  mediaUrl?: string;
  mediaType?: string;
  timestamp: number;
  readBy?: string[];
}

export interface ChatConversation {
  id: string;
  name?: string;
  type: 'direct' | 'group';
  members: string[];
  lastMessage?: string;
  lastMessageTime?: number;
  lastMessageSender?: string;
  retentionDays?: number; // 0 = Forever, 30 = 30 Days, 90 = 90 Days, 365 = 1 Year
  createdAt: number;
}

export interface IMessageService {
  createOrGetDirectChat(targetUserId: string, targetName: string): Promise<string>;
  getConversations(userId: string): Promise<ChatConversation[]>;
  listenToConversations(userId: string, callback: (chats: ChatConversation[]) => void): () => void;
  sendMessage(chatId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<void>;
  listenToMessages(chatId: string, callback: (messages: ChatMessage[]) => void): () => void;
  setRetentionPolicy(chatId: string, retentionDays: number): Promise<void>;
  purgeExpiredMessages(chatId: string, retentionDays: number): Promise<number>;
}

class FirebaseMessageService implements IMessageService {
  async createOrGetDirectChat(targetUserId: string, targetName: string): Promise<string> {
    const user = authService.getCurrentUser();
    if (!user) throw new Error("Authentication required to start chat.");

    const members = [user.uid, targetUserId].sort();
    const chatId = `dm_${members[0]}_${members[1]}`;

    try {
      const chatRef = doc(db, 'chats', chatId);
      await setDoc(chatRef, {
        id: chatId,
        name: targetName,
        type: 'direct',
        members,
        retentionDays: 90, // Default 90 days policy
        createdAt: Date.now()
      }, { merge: true });

      return chatId;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `chats/${chatId}`);
      return chatId;
    }
  }

  async getConversations(userId: string): Promise<ChatConversation[]> {
    try {
      const q = query(collection(db, 'chats'), where('members', 'array-contains', userId));
      const snap = await getDocs(q);
      const list: ChatConversation[] = [];
      snap.forEach(d => list.push(d.data() as ChatConversation));
      return list;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'chats');
      return [];
    }
  }

  listenToConversations(userId: string, callback: (chats: ChatConversation[]) => void): () => void {
    const q = query(collection(db, 'chats'), where('members', 'array-contains', userId));
    return onSnapshot(q, (snap) => {
      const list: ChatConversation[] = [];
      snap.forEach(d => list.push(d.data() as ChatConversation));
      callback(list);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'chats');
    });
  }

  async sendMessage(chatId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<void> {
    const msgId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const fullMsg: ChatMessage = {
      ...message,
      id: msgId,
      timestamp: Date.now()
    };

    try {
      const msgRef = doc(db, 'chats', chatId, 'messages', msgId);
      await setDoc(msgRef, fullMsg);

      // Update parent chat summary
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        lastMessage: message.text || '[Media Attachment]',
        lastMessageTime: fullMsg.timestamp,
        lastMessageSender: message.senderName
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `chats/${chatId}/messages/${msgId}`);
    }
  }

  listenToMessages(chatId: string, callback: (messages: ChatMessage[]) => void): () => void {
    const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('timestamp', 'asc'));
    return onSnapshot(q, (snap) => {
      const msgs: ChatMessage[] = [];
      snap.forEach(d => msgs.push(d.data() as ChatMessage));
      callback(msgs);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, `chats/${chatId}/messages`);
    });
  }

  async setRetentionPolicy(chatId: string, retentionDays: number): Promise<void> {
    try {
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, { retentionDays });
      if (retentionDays > 0) {
        await this.purgeExpiredMessages(chatId, retentionDays);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `chats/${chatId}`);
    }
  }

  async purgeExpiredMessages(chatId: string, retentionDays: number): Promise<number> {
    if (!retentionDays || retentionDays <= 0) return 0;

    const cutoffTime = Date.now() - (retentionDays * 24 * 60 * 60 * 1000);
    let purgedCount = 0;

    try {
      const q = query(collection(db, 'chats', chatId, 'messages'), where('timestamp', '<', cutoffTime));
      const snap = await getDocs(q);
      for (const d of snap.docs) {
        await deleteDoc(d.ref);
        purgedCount++;
      }
      return purgedCount;
    } catch (err) {
      console.warn("Message retention purge notice:", err);
      return 0;
    }
  }
}

export const messageService = new FirebaseMessageService();
