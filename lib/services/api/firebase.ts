import { initializeApp } from "firebase/app";
import { collection, doc, DocumentData, getDoc, deleteDoc, getDocs, getFirestore, initializeFirestore, setDoc, updateDoc, WithFieldValue } from "firebase/firestore";
import { getDownloadURL, getStorage, list, ref, uploadBytes, UploadMetadata } from "firebase/storage";
import { getAuth, signInWithPopup, GoogleAuthProvider, User } from "firebase/auth"
import { createContext, useContext, useEffect, useState } from "react";

interface FirebaseProps {
    app: ReturnType<typeof initializeApp>;
    db: ReturnType<typeof getFirestore>;
    storage: ReturnType<typeof getStorage>;
    auth: ReturnType<typeof getAuth>;
}

export const firebasePlmlOptions = {
    authDomain: "plml-shows.firebaseapp.com",
    databaseUrl: "https://plml-shows-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "plml-shows",
    storageBucket: "plml-shows.appspot.com",
} as const;

let firebase: FirebaseProps|null = null;
function getFirebase(): FirebaseProps {

    if(!firebase) {
        const {
            authDomain,
            databaseUrl,
            projectId,
            storageBucket
        } = firebasePlmlOptions;

        const firebaseConfig = {
            apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
            authDomain,
            databaseUrl,
            projectId,
            storageBucket,
            messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
        };

        const app = initializeApp(firebaseConfig);

        initializeFirestore(app, {
            ignoreUndefinedProperties: true
        })
        const db = getFirestore(app);
        const storage = getStorage(app);
        const auth = getAuth(app);

        firebase = {
            app, db, storage, auth
        }
    };

    return firebase;
}


export async function documentExists(path: string) {
    const { db } = getFirebase();
    const firedoc = await getDoc(doc(db, path));

    return firedoc.exists();
}

export async function getDocument<T>(path: string) {
    const { db } = getFirebase();
    const firedoc = await getDoc(doc(db, path));
    
    return <T> firedoc.data();
}

export async function setDocument<T extends WithFieldValue<DocumentData>>(path: string, data: Partial<T>, merge: boolean = true) {
    const { db } = getFirebase();
    
    await setDoc(
        doc(db, path),
        data,
        { merge }
    );
}

export async function updateDocument<T extends WithFieldValue<DocumentData>>(path: string, values: Partial<T>) {
    const { db } = getFirebase();
    
    const entries = Object.entries(values);

    if (entries.length < 1) {
        throw "updateDocument requires at least two values";
    }
    
    const [firstField, firstValue] = entries[0];

    const moreFieldsAndValues: unknown[] = new Array((entries.length - 1) * 2);

    for (let i = 0; i < entries.length - 1; i++) {
        const [field, value] = entries[i + 1];

        moreFieldsAndValues[i * 2] = field;
        moreFieldsAndValues[i * 2 + 1] = value;
    }

    await updateDoc(
        doc(db, path),
        firstField,
        firstValue,
        ...moreFieldsAndValues
    );
}

export async function deleteDocument(path: string) {
    const { db } = getFirebase();
    await deleteDoc(doc(db, path));
}

export async function renameDocument<T extends WithFieldValue<DocumentData>>(oldPath: string, newPath: string, deleteOld: boolean = true) {

    const data = await getDocument<T>(oldPath);
    await setDocument<T>(newPath, data);

    if (deleteOld) {
        await deleteDocument(oldPath);
    }
}

export async function renameDocumentIfNeeded<T extends WithFieldValue<DocumentData>>(oldPath: string, newPath: string, deleteOld: boolean = true) {

    if (!firebasePathesAreEquivalent(oldPath, newPath)) {
        await renameDocument<T>(oldPath, newPath, deleteOld)
    }
}

export async function listDocuments(path: string) {
    const { db } = getFirebase();

    const col = collection(db, path);
    const docRefs = await getDocs(col);

    const ids = docRefs.docs.map(doc => doc.id);

    return ids;
}


export async function listFiles(folder: string) {
    const { storage } = getFirebase();
    
    const folderRef = ref(storage, folder);
    const result = await list(folderRef);

    return result.items;
}

export interface UploadFileResult {
    path: string;
    fileName: string;
    downloadUrl: string;
}

export async function uploadFile(folder: string, data: Blob|Uint8Array|Buffer, name: string): Promise<UploadFileResult> {
    const { storage } = getFirebase();
    
    const fileName = name;
    const path = folder + '/' + fileName;

    const fileRef = ref(storage, path);
    
    await uploadBytes(fileRef, data);

    const downloadUrl = await getDownloadURL(fileRef);

    return {
        path,
        fileName,
        downloadUrl
    }
}


export interface AuthContextProps {
    user: User|null;
    initialized: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps>({
    user: null,
    initialized: false,
    signInWithGoogle: async () => {},
    signOut: async () => {},
});

export const useNewAuth = () => {
    const { auth } = getFirebase();

    const [user, setUser] = useState<User|null>(null);
    const [initialized, setInitialized] = useState<boolean>(false);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(newUser => {
            setUser(newUser);
            setInitialized(true);
        });
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
        initialized,
        signInWithGoogle,
        signOut,
    };

    return value;
};

export function useAuth() {
    return useContext(AuthContext);
}

export function toFirebaseKey(input: string) {
    return input.replace(/\s/g, "").toLowerCase();
}

export function firebasePathesAreEquivalent(lhs: string, rhs: string) {
    return lhs.toLowerCase() === rhs.toLowerCase();
}

function sanitizeNestedArraysForFirestore_inPlace(obj: any) {
    for (const key in obj) {
        if (Array.isArray(obj[key])) {
            obj[key] = JSON.stringify(obj[key]);
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            sanitizeNestedArraysForFirestore_inPlace(obj[key]);
        }
    }
}
export function sanitizeNestedArraysForFirestore(obj: any): any {
    
    const clone = structuredClone(obj);
    sanitizeNestedArraysForFirestore_inPlace(clone);
    return clone;
}