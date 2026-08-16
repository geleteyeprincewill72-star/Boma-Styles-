# Aura Firebase Production Configuration & Setup Guide

This document details the configuration for connecting the Aura application to the existing Firebase project (`aura-8fda0`), hardened security rules, user profile lifecycle, and backend abstraction layer.

---

## 1. Firebase Project Details

- **Project ID**: `aura-8fda0`
- **Application ID**: `1:956931503441:web:cdbb90bfe42a46fe760f70`
- **Auth Domain**: `aura-8fda0.firebaseapp.com`
- **Database ID**: `(default)`
- **Storage Bucket**: `aura-8fda0.firebasestorage.app`
- **Verified Admin Email**: `geleteyeprincewill72@gmail.com`

---

## 2. Firebase Services Status & Sunsetting Notice

> **Important Architecture Clarification**:  
> **Firebase Studio** is being sunset as an IDE/tooling feature by Google Cloud, but **Firebase core production services** (Authentication, Firestore, Firebase Storage, and Security Rules) remain fully supported and active.  
> Aura uses the production Firebase Web SDK v11 alongside a modular **Backend Abstraction Layer** (`/src/services/`) so that any underlying database or auth provider can be transitioned without altering UI components.

---

## 3. Authentication & User Profile Lifecycle

1. **Supported Providers**:
   - Email & Password (`createUserWithEmailAndPassword`, `signInWithEmailAndPassword`)
   - Google Sign-In (`signInWithPopup` via `GoogleAuthProvider`)
2. **Profile Creation**:
   - On initial registration, a user document is created at `/users/{uid}` with:
     - `uid`, `email`, `username`, `displayName`, `avatar`, `role: "user"`, `publicKey`, `createdAt`.
   - **Role Escalation Protection**: The default assigned role is strictly `"user"`. Only the authenticated owner matching `geleteyeprincewill72@gmail.com` or documents listed in `/admins/{uid}` can hold administrative privileges.
3. **Session Persistence**:
   - State is driven authoritatively by `onAuthStateChanged`, completely eliminating vulnerable client-side storage role overrides.

---

## 4. Firestore Security Rules Architecture

The application enforces strict Firestore Security Rules in `firestore.rules`:

- **Default Safety Gate**: `match /{document=**} { allow read, write: if false; }`
- **Role Escalation Prevention**: Users cannot update their own `role` field.
- **Private AI History**: `/ai_threads/{userId}/messages/{messageId}` is accessible only by the authenticated owner (`request.auth.uid == userId`) or admin.
- **Chat Access Isolation**: `/chats/{chatId}` and sub-messages are restricted strictly to conversation members (`request.auth.uid in resource.data.members`).
- **Payment & Admin Protection**: `/payment_config/{configId}` and `/admins/{adminId}` are write-restricted to verified admins.

---

## 5. Message Retention & Auto-Purge

Chat rooms support configurable retention periods:
- **Keep Forever** (`retentionDays: 0`)
- **30 Days** (`retentionDays: 30`)
- **90 Days** (Default, `retentionDays: 90`)
- **1 Year** (`retentionDays: 365`)

Expired messages are pruned by the `messageService.purgeExpiredMessages()` pipeline.

---

## 6. Private Local Storage & Permission Management

Aura implements a two-tier storage architecture:
1. **Cloud Synced Storage**: Firestore & Firebase Storage for cross-device feeds, user profiles, and active chats.
2. **Device Private Storage**: IndexedDB sandbox (`AuraDeviceSandboxDB`) for offline draft posts, temp AI context, unposted video compositions, and hardware permission rationales.
