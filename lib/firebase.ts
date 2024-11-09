import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, sendPasswordResetEmail, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { addDoc, collection, deleteDoc, doc, DocumentData, getDoc, getDocs, getFirestore, query, QueryConstraint, QueryDocumentSnapshot, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { getStorage, uploadString, getDownloadURL, ref, deleteObject } from "firebase/storage";
import toast from "react-hot-toast";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};
const app = initializeApp(firebaseConfig);

export default app;
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Funciones de autenticación

export const SignIn = async (user: { email: string; password: string }) => {
  return await signInWithEmailAndPassword(auth, user.email, user.password);
};

export const createUser = async (user: { email: string; password: string }) => {
  return await createUserWithEmailAndPassword(auth, user.email, user.password);
};

export const updateUser = async (user: { displayName?: string | null | undefined; photoURL?: string | null | undefined }) => {
  if (auth.currentUser) return updateProfile(auth.currentUser, user);
};

export const sendResetEmail = async (email: string) => {
  return await sendPasswordResetEmail(auth, email);
};

export const signOutAccount = () => {
  localStorage.removeItem("user");
  return auth.signOut();
};

// Funciones de base de datos

export const getCollection = async <T = DocumentData>(collectionName: string, queryArray?: QueryConstraint[]): Promise<T[]> => {
  const ref = collection(db, collectionName);
  const q = queryArray ? query(ref, ...queryArray) : query(ref);
  return (await getDocs(q)).docs.map((doc: QueryDocumentSnapshot) => ({
    id: doc.id,
    ...doc.data(),
  } as T));
};

export const getDocument = async <T = DocumentData>(path: string): Promise<T | undefined> => {
  const docSnapshot = await getDoc(doc(db, path));
  return docSnapshot.exists() ? (docSnapshot.data() as T) : undefined;
};

export const addDocument = async <T>(path: string, data: T): Promise<void> => {
  const dataWithTimestamp = { ...data, createdAt: serverTimestamp() };
  await addDoc(collection(db, path), dataWithTimestamp);
};

export const setDocument = async <T>(path: string, data: T): Promise<void> => {
  const dataWithTimestamp = { ...data, createdAt: serverTimestamp() };
  await setDoc(doc(db, path), dataWithTimestamp);
};

export const updateDocument = async <T>(path: string, data: Partial<T>): Promise<void> => {
  await updateDoc(doc(db, path), data);
};

export const deleteDocument = async (path: string): Promise<void> => {
  await deleteDoc(doc(db, path));
};

// Funciones de almacenamiento

export const uploadBase64 = async (path: string, base64: string): Promise<string> => {
  await uploadString(ref(storage, path), base64, "data_url");
  return await getDownloadURL(ref(storage, path));
};

export const deleteImage = async (path: string): Promise<void> => {
  const imageRef = ref(storage, path);
  try {
    await deleteObject(imageRef);
  } catch (error) {
    toast.error(`Error al eliminar la imagen de Storage: ${error}`);
    throw new Error("No se pudo eliminar la imagen");
  }
};
