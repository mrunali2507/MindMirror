import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Save a reflection entry with sentiment data
 */
export const saveReflection = async (userId, reflectionData) => {
  const reflectionsRef = collection(db, 'users', userId, 'reflections');
  const docRef = await addDoc(reflectionsRef, {
    ...reflectionData,
    createdAt: serverTimestamp(),
  });

  // Increment total reflections
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const current = userSnap.data().totalReflections || 0;
    await updateDoc(userRef, { totalReflections: current + 1 });
  }

  return docRef.id;
};

/**
 * Get reflections for a user, ordered by date (newest first)
 */
export const getReflections = async (userId, count = 30) => {
  const reflectionsRef = collection(db, 'users', userId, 'reflections');
  const q = query(reflectionsRef, orderBy('createdAt', 'desc'), limit(count));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

/**
 * Get user profile data
 */
export const getUserProfile = async (userId) => {
  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

/**
 * Update the user's emotional baseline
 */
export const updateBaseline = async (userId, baselineScore) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    baselineScore,
    baselineCalculated: true,
  });
};

/**
 * Save a drift analysis entry
 */
export const saveDriftAnalysis = async (userId, driftData) => {
  const driftRef = collection(db, 'users', userId, 'drift_analysis');
  const docRef = await addDoc(driftRef, {
    ...driftData,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

/**
 * Get the latest drift analysis
 */
export const getLatestDrift = async (userId) => {
  const driftRef = collection(db, 'users', userId, 'drift_analysis');
  const q = query(driftRef, orderBy('createdAt', 'desc'), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const d = snapshot.docs[0];
  return { id: d.id, ...d.data() };
};

/**
 * Get a random reflection prompt
 */
export const getRandomPrompt = async () => {
  const promptsRef = collection(db, 'prompts');
  const snapshot = await getDocs(promptsRef);
  if (snapshot.empty) {
    // Fallback prompts if Firestore is empty
    const fallbacks = [
      'How are you feeling right now?',
      'What made you feel stressed today?',
      'What gave you energy today?',
      'What is one thing you are grateful for?',
      'Describe your mood in one word and explain why.',
      'What challenged you today?',
      'What moment brought you joy today?',
      'What would you like to let go of?',
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
  const prompts = snapshot.docs.map((d) => d.data().text);
  return prompts[Math.floor(Math.random() * prompts.length)];
};
