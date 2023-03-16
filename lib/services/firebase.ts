import { initializeApp } from "firebase/app";
import { collection, doc, DocumentData, getDoc, getDocs, getFirestore, setDoc, WithFieldValue } from "firebase/firestore";
import { getStorage, list, ref, getDownloadURL, getMetadata } from "firebase/storage";


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
const storage = getStorage(app);

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