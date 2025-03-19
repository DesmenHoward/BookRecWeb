import { create } from 'zustand';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { auth, firestore, storage } from '../firebase/config';

interface FirebaseState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  
  // Auth actions
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  
  // Firestore actions
  addDocument: <T>(collectionName: string, data: T) => Promise<string>;
  getDocuments: <T>(collectionName: string) => Promise<T[]>;
  getDocument: <T>(collectionName: string, docId: string) => Promise<T | null>;
  updateDocument: <T>(collectionName: string, docId: string, data: Partial<T>) => Promise<void>;
  deleteDocument: (collectionName: string, docId: string) => Promise<void>;
  queryDocuments: <T>(collectionName: string, field: string, operator: any, value: any) => Promise<T[]>;
  
  // Storage actions
  uploadFile: (path: string, file: Blob) => Promise<string>;
  getFileUrl: (path: string) => Promise<string>;
  deleteFile: (path: string) => Promise<void>;
}

export const useFirebaseStore = create<FirebaseState>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,
  
  // Auth actions
  signUp: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      set({ user: userCredential.user, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  
  signIn: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      set({ user: userCredential.user, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  
  signOut: async () => {
    set({ isLoading: true, error: null });
    try {
      await firebaseSignOut(auth);
      set({ user: null, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  
  // Firestore actions
  addDocument: async <T>(collectionName: string, data: T) => {
    set({ isLoading: true, error: null });
    try {
      const docRef = await addDoc(collection(firestore, collectionName), data as any);
      set({ isLoading: false });
      return docRef.id;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  
  getDocuments: async <T>(collectionName: string) => {
    set({ isLoading: true, error: null });
    try {
      const querySnapshot = await getDocs(collection(firestore, collectionName));
      const documents = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as T[];
      set({ isLoading: false });
      return documents;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  
  getDocument: async <T>(collectionName: string, docId: string) => {
    set({ isLoading: true, error: null });
    try {
      const docRef = doc(firestore, collectionName, docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        set({ isLoading: false });
        return { id: docSnap.id, ...docSnap.data() } as T;
      } else {
        set({ isLoading: false });
        return null;
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  
  updateDocument: async <T>(collectionName: string, docId: string, data: Partial<T>) => {
    set({ isLoading: true, error: null });
    try {
      const docRef = doc(firestore, collectionName, docId);
      await updateDoc(docRef, data as any);
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  
  deleteDocument: async (collectionName: string, docId: string) => {
    set({ isLoading: true, error: null });
    try {
      const docRef = doc(firestore, collectionName, docId);
      await deleteDoc(docRef);
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  
  queryDocuments: async <T>(collectionName: string, field: string, operator: any, value: any) => {
    set({ isLoading: true, error: null });
    try {
      const q = query(collection(firestore, collectionName), where(field, operator, value));
      const querySnapshot = await getDocs(q);
      const documents = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as T[];
      set({ isLoading: false });
      return documents;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  
  // Storage actions
  uploadFile: async (path: string, file: Blob) => {
    set({ isLoading: true, error: null });
    try {
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      set({ isLoading: false });
      return downloadURL;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  
  getFileUrl: async (path: string) => {
    set({ isLoading: true, error: null });
    try {
      const storageRef = ref(storage, path);
      const downloadURL = await getDownloadURL(storageRef);
      set({ isLoading: false });
      return downloadURL;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  
  deleteFile: async (path: string) => {
    set({ isLoading: true, error: null });
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  }
}));

// Set up auth state listener
onAuthStateChanged(auth, (user) => {
  useFirebaseStore.setState({ user });
});