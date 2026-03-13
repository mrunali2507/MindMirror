import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

/**
 * Register a new user and create their Firestore profile
 */
export const register = async (email, password, displayName) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Update auth profile
  await updateProfile(user, { displayName });

  // Create Firestore user document
  await setDoc(doc(db, 'users', user.uid), {
    email,
    displayName,
    createdAt: serverTimestamp(),
    baselineScore: null,
    baselineCalculated: false,
    totalReflections: 0,
  });

  return user;
};

/**
 * Sign in with email and password
 */
export const login = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

/**
 * Sign out the current user
 */
export const logout = async () => {
  await signOut(auth);
};

/**
 * Get the current authenticated user
 */
export const getCurrentUser = () => auth.currentUser;

/**
 * Listen for auth state changes
 */
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};
