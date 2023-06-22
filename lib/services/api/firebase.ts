import { initializeApp } from "firebase/app";
import { collection, doc, DocumentData, getDoc, getDocs, getFirestore, setDoc, WithFieldValue } from "firebase/firestore";
import { getStorage, list, ref } from "firebase/storage";
import { getAuth, signInWithPopup, GoogleAuthProvider, User } from "firebase/auth"
import { createContext, useContext, useEffect, useState } from "react";


const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: "plml-shows.firebaseapp.com",
    databaseURL: "https://plml-shows-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "plml-shows",
    storageBucket: "plml-shows.appspot.com",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export async function getDocument<T>(path: string) {
    const firedoc = await getDoc(doc(db, path));

    return <T> firedoc.data();
}

export async function setDocument<T extends WithFieldValue<DocumentData>>(path: string, data: Partial<T>, merge: boolean = true) {
    await setDoc(
        doc(db, path),
        data,
        { merge }
    );
}


export async function listDocuments(path: string) {
    const col = collection(db, path);
    const docRefs = await getDocs(col);

    const ids = docRefs.docs.map(doc => doc.id);

    return ids;
}


export async function listFiles(folder: string) {
    
    const folderRef = ref(storage, folder);
    const result = await list(folderRef);

    return result.items;
}


export interface AuthContextProps {
    user: User|null;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps>({
    user: null,
    signInWithGoogle: async () => {},
    signOut: async () => {},
});

export const UseNewAuth = () => {

    const [user, setUser] = useState<User|null>(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(setUser);
        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
    };

    const signOut = async () => {
        await auth.signOut();
    };

    const value: AuthContextProps = {
        user,
        signInWithGoogle,
        signOut,
    };

    return value;
};

export function useAuth() {
    return useContext(AuthContext);
}