/**
 * AURA MODULAR BACKEND SERVICE ABSTRACTION LAYER
 * Authentication Service (Firebase Auth with Future Supabase / Appwrite Fallback)
 */

import { 
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as fbSignOut,
  onAuthStateChanged as fbOnAuthStateChanged,
  sendPasswordResetEmail as fbSendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../utils/firebase';
import { generateSigningKeyPair } from '../utils/crypto';

export interface UserProfile {
  uid: string;
  email: string;
  username: string;
  displayName: string;
  avatar: string;
  bio?: string;
  role: 'user' | 'creator' | 'moderator' | 'admin';
  publicKey: string;
  createdAt: number;
  isVerified?: boolean;
}

export interface IAuthService {
  signUpWithEmail(email: string, password: string, username: string, displayName?: string): Promise<UserProfile>;
  signInWithEmail(email: string, password: string): Promise<UserProfile>;
  signInWithGoogle(): Promise<UserProfile>;
  signOut(): Promise<void>;
  getCurrentUser(): FirebaseUser | null;
  getUserProfile(uid: string): Promise<UserProfile | null>;
  onAuthStateChange(callback: (user: FirebaseUser | null, profile: UserProfile | null) => void): () => void;
  sendPasswordReset(email: string): Promise<void>;
}

class FirebaseAuthService implements IAuthService {
  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userRef = doc(db, 'users', uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        return snap.data() as UserProfile;
      }
      return null;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `users/${uid}`);
      return null;
    }
  }

  private async ensureUserProfile(user: FirebaseUser, fallbackUsername?: string, fallbackDisplayName?: string): Promise<UserProfile> {
    const existing = await this.getUserProfile(user.uid);
    if (existing) {
      return existing;
    }

    const { publicKey } = await generateSigningKeyPair();
    const generatedUsername = fallbackUsername || user.displayName?.toLowerCase().replace(/[^a-z0-9]/g, '') || `peer_${user.uid.slice(0, 6)}`;
    const displayName = fallbackDisplayName || user.displayName || fallbackUsername || 'Aura Peer';
    const avatar = user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`;

    // Secure Role Initialization: Users are strictly 'user' role by default.
    // Admin check: Only if authenticated email matches verified admin email
    const isAdminEmail = user.email === 'geleteyeprincewill72@gmail.com';
    const role = isAdminEmail ? 'admin' : 'user';

    const newProfile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      username: generatedUsername,
      displayName,
      avatar,
      bio: 'Aura Sovereign Peer Node',
      role,
      publicKey,
      createdAt: Date.now(),
      isVerified: isAdminEmail
    };

    try {
      await setDoc(doc(db, 'users', user.uid), newProfile);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
    }

    return newProfile;
  }

  async signUpWithEmail(email: string, password: string, username: string, displayName?: string): Promise<UserProfile> {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    return await this.ensureUserProfile(cred.user, username, displayName);
  }

  async signInWithEmail(email: string, password: string): Promise<UserProfile> {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const profile = await this.getUserProfile(cred.user.uid);
    if (profile) return profile;
    return await this.ensureUserProfile(cred.user);
  }

  async signInWithGoogle(): Promise<UserProfile> {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const cred = await signInWithPopup(auth, provider);
    return await this.ensureUserProfile(cred.user);
  }

  async signOut(): Promise<void> {
    await fbSignOut(auth);
  }

  async sendPasswordReset(email: string): Promise<void> {
    await fbSendPasswordResetEmail(auth, email);
  }

  onAuthStateChange(callback: (user: FirebaseUser | null, profile: UserProfile | null) => void): () => void {
    return fbOnAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const profile = await this.getUserProfile(fbUser.uid);
          callback(fbUser, profile);
        } catch {
          callback(fbUser, null);
        }
      } else {
        callback(null, null);
      }
    });
  }
}

export const authService = new FirebaseAuthService();
