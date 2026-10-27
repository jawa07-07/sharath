/**
 * Firebase Client Integration for MonsterMentor AI
 * Provides Google Auth, Firestore persistence for authenticated users,
 * and graceful fallback to Guest Mode when Firebase is not yet provisioned.
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
  Auth
} from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  getDocs,
  deleteDoc,
  getDocFromServer
} from 'firebase/firestore';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

let firebaseApp: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let firestoreInstance: Firestore | null = null;
let isConfigured = false;

// Check if Firebase config exists in global or localStorage or env
function getFirebaseConfig(): any | null {
  try {
    const storedConfig = localStorage.getItem('monstermentor_firebase_config');
    if (storedConfig) {
      return JSON.parse(storedConfig);
    }
  } catch (e) {
    // ignore
  }

  // Check if standard Vite env vars are present
  const apiKey = (import.meta as any).env?.VITE_FIREBASE_API_KEY;
  const projectId = (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID;

  if (apiKey && projectId) {
    return {
      apiKey,
      authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
      projectId,
      storageBucket: `${projectId}.appspot.com`,
      messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
      appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID || '1:123456789:web:abcdef',
      firestoreDatabaseId: (import.meta as any).env?.VITE_FIREBASE_DATABASE_ID || '(default)',
    };
  }

  return null;
}

export function initFirebase() {
  if (firebaseApp) return { app: firebaseApp, auth: authInstance, db: firestoreInstance, isConfigured };

  const config = getFirebaseConfig();
  if (config && config.apiKey && config.projectId) {
    try {
      if (!getApps().length) {
        firebaseApp = initializeApp(config);
      } else {
        firebaseApp = getApps()[0];
      }
      authInstance = getAuth(firebaseApp);
      firestoreInstance = getFirestore(firebaseApp, config.firestoreDatabaseId || '(default)');
      isConfigured = true;

      // Validate connection as per Firestore guidelines
      testFirestoreConnection(firestoreInstance);
    } catch (err) {
      console.warn('Firebase initialization error:', err);
      isConfigured = false;
    }
  } else {
    isConfigured = false;
  }

  return { app: firebaseApp, auth: authInstance, db: firestoreInstance, isConfigured };
}

async function testFirestoreConnection(db: Firestore) {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client offline or rules check: Please check Firebase configuration.');
    }
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const auth = authInstance;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo:
        auth?.currentUser?.providerData?.map((p) => ({
          providerId: p.providerId,
          email: p.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Google Auth sign in
export async function loginWithGoogle(): Promise<User | null> {
  const { auth, isConfigured: ready } = initFirebase();
  if (!ready || !auth) {
    throw new Error('FIREBASE_NOT_CONFIGURED');
  }

  const provider = new GoogleAuthProvider();
  const credential = await signInWithPopup(auth, provider);
  return credential.user;
}

// Sign out
export async function logoutUser(): Promise<void> {
  const { auth } = initFirebase();
  if (auth) {
    await signOut(auth);
  }
}

// Subscribe to auth state changes
export function subscribeToAuth(callback: (user: User | null) => void): () => void {
  const { auth, isConfigured: ready } = initFirebase();
  if (!ready || !auth) {
    callback(null);
    return () => {};
  }

  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
}

// Save Custom Firebase Config (from user settings modal)
export function saveFirebaseConfig(configJson: string): boolean {
  try {
    const parsed = JSON.parse(configJson);
    if (!parsed.apiKey || !parsed.projectId) {
      throw new Error('Config missing apiKey or projectId');
    }
    localStorage.setItem('monstermentor_firebase_config', JSON.stringify(parsed));
    // Reset instances to reload
    firebaseApp = null;
    authInstance = null;
    firestoreInstance = null;
    initFirebase();
    return true;
  } catch (e) {
    console.error('Invalid Firebase configuration JSON:', e);
    return false;
  }
}

export function removeCustomFirebaseConfig(): void {
  localStorage.removeItem('monstermentor_firebase_config');
  firebaseApp = null;
  authInstance = null;
  firestoreInstance = null;
  isConfigured = false;
}

export function getIsFirebaseConfigured(): boolean {
  initFirebase();
  return isConfigured;
}
