import { Timestamp } from "firebase/firestore";
import {
  AudioClipData,
  AudioClipInfo,
  AudioClipCollection,
} from "../audio/audioControl";
import { pathCombine } from "../core/files";
import { generateId, stringToKey } from "../core/utils";

import { UploadFileResult, getDocument, setDocument, uploadFile, listDocuments } from "./firebase";


const pathToAudioCollection = (collection: string) => pathCombine("audio", collection.toLowerCase());

const pathToAudioFile = (file: string) => pathCombine("audio", file.toLowerCase());


export async function importAudioClip(data: File|Blob|Uint8Array, name: string, clipInfo: AudioClipInfo, fileUploadMethod: (folder: string, data: Blob|Uint8Array|Buffer, name: string) => Promise<UploadFileResult> = uploadFile) {
  	name = name.trim();
  	const { source } = clipInfo;

  	const collectionPath = pathToAudioCollection(source)
  	const collection = await getDocument<AudioClipCollection>(collectionPath);

  	if (collection.clips[name]) {
      	throw `An audio clip called '${name}' already exists`;
  	}

  	const folderPath = pathToAudioFile(source);

  	const { downloadUrl } = await uploadFile(folderPath, data, name);

	const key = stringToKey(name);

  	const audioClipData: AudioClipData = {
    	id: generateId(),
      	name: name,
		key,
      	url: downloadUrl,
      	created: Timestamp.now(),
      	info: clipInfo
  	}

  	const newClips = {
        ...collection.clips,
        [key]: audioClipData
    }

    await setDocument<AudioClipCollection>(collectionPath, { clips: newClips });
}

export async function getAudioClipCollection(name: string): Promise<AudioClipCollection> {
    const path = pathCombine("audio", name.toLowerCase());
    const result = await getDocument<AudioClipCollection>(path);

    return result;
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


export async function getAudioClip(
	collectionName: string,
	clipName: string
): Promise<AudioClipData> {
	const collection = await getAudioClipCollection(collectionName);
	const clipKey = stringToKey(clipName);
	return collection.clips[clipKey];
}

export type CollectionInfo = {
	name: string;
}

export async function listCollections(): Promise<CollectionInfo[]> {
	const docs = await listDocuments("audio");
	const librairies = docs.map(doc => ({ name: doc }));

	return librairies;
}

export type WholeLibrairyInfo = {
	collections: AudioClipCollection[];
}

export async function getWholeLibrairy(): Promise<WholeLibrairyInfo> {

	const collections = await listCollections();

	const collectionPromises = collections.map(async collection => {
		const collectionData = await getAudioClipCollection(collection.name);
		return collectionData;
	});

	const data = await Promise.all(collectionPromises)
	return { collections: data }
}