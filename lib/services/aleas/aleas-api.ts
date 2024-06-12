import { getDocument } from "../api/firebase";
import { pathCombine } from "../core/files";
import { AleasAudioLibrariesCollection, AleasInputProjectionLibrariesCollection, AleasInputProjectionLibrary } from "./aleas-generation";

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