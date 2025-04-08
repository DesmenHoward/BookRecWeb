import { create } from 'zustand';
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { firestore } from '../firebase/config';

interface FirebaseState {
  getDocument: (collectionName: string, documentId: string) => Promise<any>;
  setDocument: (collectionName: string, documentId: string, data: any) => Promise<void>;
  updateDocument: (collectionName: string, documentId: string, data: any) => Promise<void>;
  deleteDocument: (collectionName: string, documentId: string) => Promise<void>;
}

export const useFirebaseStore = create<FirebaseState>(() => ({
  getDocument: async (collectionName: string, documentId: string) => {
    try {
      const docRef = doc(firestore, collectionName, documentId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
      console.error('Error getting document:', error);
      throw error;
    }
  },

  setDocument: async (collectionName: string, documentId: string, data: any) => {
    try {
      const docRef = doc(firestore, collectionName, documentId);
      await setDoc(docRef, data);
    } catch (error) {
      console.error('Error setting document:', error);
      throw error;
    }
  },

  updateDocument: async (collectionName: string, documentId: string, data: any) => {
    try {
      const docRef = doc(firestore, collectionName, documentId);
      await updateDoc(docRef, data);
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  },

  deleteDocument: async (collectionName: string, documentId: string) => {
    try {
      const docRef = doc(firestore, collectionName, documentId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  },
}));
