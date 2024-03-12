import { Timestamp } from "firebase/firestore";
import {
  AudioClipData,
  AudioClipInfo,
  AudioClipCollection,
} from "../audio/audioControl";
import { pathCombine } from "../core/files";
import { generateId } from "../core/utils";
import {
  getDocument,
  setDocument,
  uploadFile,
  documentExists,
} from "./firebase";

const pathToAudioCollection = (collection: string) => pathCombine("audio", collection.toLowerCase());

const pathToAudioFile = (file: string) => pathCombine("audio", file.toLowerCase());

export async function importAudioClip(
  file: File,
  name: string,
  clipInfo: AudioClipInfo
) {
  name = name.trim();
  const { source } = clipInfo;

  const collectionPath = pathToAudioCollection(source);
  const collection = await getDocument<AudioClipCollection>(collectionPath);

  if (collection.clips[name]) {
    throw `An audio clip called '${name}' already exists`;
  }

  const folderPath = pathToAudioFile(source);
  const { downloadUrl } = await uploadFile(folderPath, file, name);

  const data: AudioClipData = {
    id: generateId(),
    name: name,
    url: downloadUrl,
    created: Timestamp.now(),
    info: clipInfo,
  };

  const newClips = {
    ...collection.clips,
    [name]: data,
  };

  await setDocument<AudioClipCollection>(collectionPath, { clips: newClips });
}


export async function updateAudioClipInfo(
  collectionName: string,
  clipName: string,
  updatedStart: number,
  updatedEnd: number,
  markers?: Map<string, number>
) {
  const collection = await getAudioClipCollection(collectionName);
  const existingClip = collection.clips[clipName];

  const updatedMarkers = markers ? 
    Object.fromEntries(markers.entries()) :
    undefined;

  if (existingClip) {
    const updatedInfo = {
      ...existingClip.info,
      start: updatedStart,
      end: updatedEnd,
      markers: updatedMarkers,
    };

    const updatedClipData = {
      ...existingClip,
      info: updatedInfo,
    };

    const updatedClips = {
      ...collection.clips,
      [clipName]: updatedClipData,
    };

    const collectionPath = pathToAudioCollection(collectionName);
    await setDocument<AudioClipCollection>(collectionPath, {
      clips: updatedClips,
    });
  } else {
    throw `Audio clip '${clipName}' not found in collection '${collectionName}'`;
  }
}

export async function getAudioClipCollection(
  name: string
): Promise<AudioClipCollection> {
  const path = pathToAudioCollection(name);
  const result = await getDocument<AudioClipCollection>(path);

  return result;
}

export async function getAudioClip(
  collectionName: string,
  clipName: string
): Promise<AudioClipData> {
  const collection = await getAudioClipCollection(collectionName);
  return collection.clips[clipName];
}
