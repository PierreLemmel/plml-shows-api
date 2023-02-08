import { initializeApp } from "firebase/app";
import { doc, DocumentData, getDoc, getFirestore, setDoc, WithFieldValue } from "firebase/firestore";


const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: "plml-shows.firebaseapp.com",
    databaseURL: "https://plml-shows-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "plml-shows",
    storageBucket: "plml-shows.appspot.com",
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function getDocument<T>(path: string) {
    const firedoc = await getDoc(doc(db, path));

    return <T> firedoc.data();
}

export async function setDocument<T extends WithFieldValue<DocumentData>>(path: string, data: Partial<T>) {
    await setDoc(
        doc(db, path),
        data,
        { merge: true }
    );
}