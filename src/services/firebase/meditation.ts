import {
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';

export interface MeditationSession {
  id?: string;
  userId: string;
  sessionId: string; // From meditations.json
  title: string;
  category: string;
  duration: number; // minutes
  completedAt: Date;
  createdAt?: Date;
}

export interface MeditationStats {
  totalSessions: number;
  totalMinutes: number;
  thisWeek: number;
  thisMonth: number;
  favoriteCategory?: string;
}

/**
 * Log a completed meditation session
 */
export const logMeditationSession = async (
  session: Omit<MeditationSession, 'id' | 'createdAt'>
): Promise<string> => {
  try {
    const sessionsRef = collection(db, 'users', session.userId, 'meditation_sessions');
    const docRef = await addDoc(sessionsRef, {
      ...session,
      completedAt: Timestamp.fromDate(session.completedAt),
      createdAt: serverTimestamp(),
    });
    console.log('Meditation session logged:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error logging meditation:', error);
    throw error;
  }
};

/**
 * Get meditation sessions for today
 */
export const getTodayMeditations = async (
  userId: string
): Promise<MeditationSession[]> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const sessionsRef = collection(db, 'users', userId, 'meditation_sessions');
    const q = query(
      sessionsRef,
      where('completedAt', '>=', Timestamp.fromDate(today)),
      where('completedAt', '<', Timestamp.fromDate(tomorrow))
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      completedAt: doc.data().completedAt?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
    })) as MeditationSession[];
  } catch (error) {
    console.error('Error fetching today meditations:', error);
    throw error;
  }
};

/**
 * Get all meditation sessions
 */
export const getMeditationHistory = async (
  userId: string
): Promise<MeditationSession[]> => {
  try {
    const sessionsRef = collection(db, 'users', userId, 'meditation_sessions');
    const snapshot = await getDocs(sessionsRef);
    
    const sessions = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      completedAt: doc.data().completedAt?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
    })) as MeditationSession[];

    // Sort by completion date (most recent first)
    sessions.sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());
    
    return sessions;
  } catch (error) {
    console.error('Error fetching meditation history:', error);
    throw error;
  }
};

/**
 * Get meditation stats
 */
export const getMeditationStats = async (
  userId: string
): Promise<MeditationStats> => {
  try {
    const sessions = await getMeditationHistory(userId);
    
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const thisWeekSessions = sessions.filter(
      (s) => s.completedAt >= weekAgo
    );
    const thisMonthSessions = sessions.filter(
      (s) => s.completedAt >= monthAgo
    );

    const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);

    // Find favorite category
    const categoryCounts: Record<string, number> = {};
    sessions.forEach((s) => {
      categoryCounts[s.category] = (categoryCounts[s.category] || 0) + 1;
    });
    const favoriteCategory = Object.entries(categoryCounts).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0];

    return {
      totalSessions: sessions.length,
      totalMinutes,
      thisWeek: thisWeekSessions.length,
      thisMonth: thisMonthSessions.length,
      favoriteCategory,
    };
  } catch (error) {
    console.error('Error fetching meditation stats:', error);
    return {
      totalSessions: 0,
      totalMinutes: 0,
      thisWeek: 0,
      thisMonth: 0,
    };
  }
};

