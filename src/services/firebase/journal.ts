// Firebase Journal Service
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';

export interface JournalEntry {
  id?: string;
  userId: string;
  title?: string;
  content: string;
  mood?: 'great' | 'good' | 'okay' | 'bad' | 'terrible';
  tags?: string[];
  date: string; // YYYY-MM-DD format
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

/**
 * Create a new journal entry
 */
export const createJournalEntry = async (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const entriesRef = collection(db, 'users', entry.userId, 'journal');
    const docRef = await addDoc(entriesRef, {
      ...entry,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Create journal entry error:', error);
    throw new Error('Failed to create journal entry');
  }
};

/**
 * Get all journal entries for a user
 */
export const getJournalEntries = async (userId: string, limitCount?: number): Promise<JournalEntry[]> => {
  try {
    const entriesRef = collection(db, 'users', userId, 'journal');
    let q = query(entriesRef, orderBy('date', 'desc'));
    
    if (limitCount) {
      q = query(q, limit(limitCount));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JournalEntry));
  } catch (error) {
    console.error('Get journal entries error:', error);
    throw new Error('Failed to get journal entries');
  }
};

/**
 * Get journal entry for a specific date
 */
export const getJournalEntryByDate = async (userId: string, date: string): Promise<JournalEntry | null> => {
  try {
    const entriesRef = collection(db, 'users', userId, 'journal');
    const q = query(entriesRef, where('date', '==', date));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as JournalEntry;
  } catch (error) {
    console.error('Get journal entry by date error:', error);
    throw new Error('Failed to get journal entry');
  }
};

/**
 * Get a single journal entry
 */
export const getJournalEntry = async (userId: string, entryId: string): Promise<JournalEntry | null> => {
  try {
    const entryDoc = await getDoc(doc(db, 'users', userId, 'journal', entryId));
    if (entryDoc.exists()) {
      return { id: entryDoc.id, ...entryDoc.data() } as JournalEntry;
    }
    return null;
  } catch (error) {
    console.error('Get journal entry error:', error);
    throw new Error('Failed to get journal entry');
  }
};

/**
 * Update a journal entry
 */
export const updateJournalEntry = async (userId: string, entryId: string, updates: Partial<JournalEntry>) => {
  try {
    const entryRef = doc(db, 'users', userId, 'journal', entryId);
    await updateDoc(entryRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Update journal entry error:', error);
    throw new Error('Failed to update journal entry');
  }
};

/**
 * Delete a journal entry
 */
export const deleteJournalEntry = async (userId: string, entryId: string) => {
  try {
    await deleteDoc(doc(db, 'users', userId, 'journal', entryId));
  } catch (error) {
    console.error('Delete journal entry error:', error);
    throw new Error('Failed to delete journal entry');
  }
};

/**
 * Get journal entry count for a user
 */
export const getJournalEntryCount = async (userId: string): Promise<number> => {
  try {
    const entriesRef = collection(db, 'users', userId, 'journal');
    const snapshot = await getDocs(entriesRef);
    return snapshot.size;
  } catch (error) {
    console.error('Get journal entry count error:', error);
    return 0;
  }
};

/**
 * Check if user has journaled today
 */
export const hasJournaledToday = async (userId: string): Promise<boolean> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const entry = await getJournalEntryByDate(userId, today);
    return entry !== null;
  } catch (error) {
    console.error('Has journaled today error:', error);
    return false;
  }
};

