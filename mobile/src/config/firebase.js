import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAuGWTQjsVrt7PpNAGuxTtBx8-D8Qb41h8',
  authDomain: 'mindmirror-2425.firebaseapp.com',
  projectId: 'mindmirror-2425',
  storageBucket: 'mindmirror-2425.firebasestorage.app',
  messagingSenderId: '150657961068',
  appId: '1:150657961068:web:3ec5d35e0f18cf1ebd1c49',
  measurementId: 'G-RHWGJELVWH',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
