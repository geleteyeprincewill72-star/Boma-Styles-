/**
 * AURA MODULAR BACKEND SERVICE ABSTRACTION LAYER
 * Post & Social Feed Service
 */

import { 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  updateDoc,
  increment
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../utils/firebase';
import { FeedPost } from '../types';
import { authService } from './authService';

export interface IPostService {
  getPosts(count?: number): Promise<FeedPost[]>;
  listenToPosts(callback: (posts: FeedPost[]) => void): () => void;
  createPost(post: FeedPost): Promise<void>;
  likePost(postId: string): Promise<void>;
  addComment(postId: string, comment: { authorName: string; text: string; authorAvatar?: string }): Promise<void>;
  deletePost(postId: string): Promise<void>;
}

class FirebasePostService implements IPostService {
  async getPosts(count: number = 50): Promise<FeedPost[]> {
    try {
      const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'), limit(count));
      const snap = await getDocs(q);
      const posts: FeedPost[] = [];
      snap.forEach(d => {
        posts.push({ id: d.id, ...d.data() } as FeedPost);
      });
      return posts;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'posts');
      return [];
    }
  }

  listenToPosts(callback: (posts: FeedPost[]) => void): () => void {
    const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'), limit(60));
    return onSnapshot(q, (snapshot) => {
      const posts: FeedPost[] = [];
      snapshot.forEach(d => {
        posts.push({ id: d.id, ...d.data() } as FeedPost);
      });
      callback(posts);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'posts');
    });
  }

  async createPost(post: FeedPost): Promise<void> {
    const user = authService.getCurrentUser();
    try {
      const postWithUid = {
        ...post,
        authorUid: user?.uid || '',
        timestamp: post.timestamp || Date.now()
      };
      await setDoc(doc(db, 'posts', post.id), postWithUid);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `posts/${post.id}`);
    }
  }

  async likePost(postId: string): Promise<void> {
    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        likes: increment(1)
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `posts/${postId}`);
    }
  }

  async addComment(postId: string, comment: { authorName: string; text: string; authorAvatar?: string }): Promise<void> {
    try {
      const postRef = doc(db, 'posts', postId);
      const newComment = {
        id: `c_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        authorName: comment.authorName,
        text: comment.text,
        authorAvatar: comment.authorAvatar || '',
        timestamp: Date.now()
      };
      // Fetch current comments to append securely
      const snap = await getDocs(query(collection(db, 'posts')));
      const currentPost = snap.docs.find(d => d.id === postId)?.data();
      const existingComments = currentPost?.comments || [];
      await updateDoc(postRef, {
        comments: [...existingComments, newComment],
        commentsCount: increment(1)
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `posts/${postId}`);
    }
  }

  async deletePost(postId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'posts', postId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `posts/${postId}`);
    }
  }
}

export const postService = new FirebasePostService();
