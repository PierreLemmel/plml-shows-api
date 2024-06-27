import { getDocument, sanitizeNestedArraysForFirestore, setDocument, toFirebaseKey } from "../api/firebase";
import { pathCombine } from "../core/files";
import { AleasAudioLibrariesCollection, AleasInputProjectionLibrariesCollection, AleasInputProjectionLibrary, AleasShow } from "./aleas-generation";

const pathToAudioLibrary = (library: string) => pathCombine(
    "aleas",
    "library",
    "audio",
    library
); 

export async function getAudioLibraryCollection(collection: string) {
    const path = pathToAudioLibrary(collection);
    return await getDocument<AleasAudioLibrariesCollection>(path);
}


const pathToInputProjectionLibrary = (library: string) => pathCombine(
    "aleas",
    "library",
    "inputs",
    library
);

export async function getInputProjectionLibraryCollection(collection: string) {
    const path = pathToInputProjectionLibrary(collection);
    return await getDocument<AleasInputProjectionLibrariesCollection>(path);
}

const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    return `${year}${month}${day}-${hours}${minutes}${seconds}`;
}

const pathToAleasShow = (lightingPlan: string, showName: string, docName: string) => pathCombine(
    "aleas",
    "shows",
    toFirebaseKey(lightingPlan),
    "shows",
    toFirebaseKey(showName),
    docName
);

export async function saveAleasShow(show: AleasShow) {

    const {
        generationInfo,
        scenes,
        ...otherShowElements
    } = show;

    const {
        params: {
            show: {
                showName,
                lightingPlan
            },
        },
        generatedAt
    } = generationInfo;

    const docName = `${showName} - ${formatDate(generatedAt)}`;

    const pathToShowDoc = pathToAleasShow(lightingPlan, showName, docName);
    const sanitizedScenes = structuredClone(scenes).map(sanitizeNestedArraysForFirestore);

    const data = {
        generationInfo,
        scenes: sanitizedScenes,
        ...otherShowElements
    }

    await setDocument(pathToShowDoc, data);
}