import { getDocument } from "../api/firebase";
import { pathCombine } from "../core/files";
import { AleasAudioLibrariesCollection } from "./aleas-generation";

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