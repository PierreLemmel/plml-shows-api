import { Timestamp } from "firebase/firestore";
import { AudioClipData, AudioClipInfo, AudioClipCollection } from "../audio/audioControl";
import { pathCombine } from "../core/files";
import { generateId } from "../core/utils";
import { getDocument, setDocument, uploadFile } from "./firebase";


export async function importAudioClip(file: File, name: string, clipInfo: AudioClipInfo) {
    name = name.trim();
    const { source } = clipInfo;
    
    const collectionPath = pathCombine("audio", source)
    const collection = await getDocument<AudioClipCollection>(collectionPath);
    if (collection.clips[name]) {
        throw `An audio clip called '${name}' already exists`;
    }

    const folderPath = pathCombine('audio', source);
    const { downloadUrl } = await uploadFile(folderPath, file, name);

    const data: AudioClipData = {
        id: generateId(8),
        name: name,
        url: downloadUrl,
        created: Timestamp.now(),
        info: clipInfo
    }

    const newClips = {
        ...collection.clips,
        [name]: data
    }

    await setDocument<AudioClipCollection>(collectionPath, newClips);
}