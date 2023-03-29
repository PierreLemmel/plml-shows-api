import { getBytes, getDownloadURL } from "firebase/storage";
import imageSize from "image-size";
import { getDocument, listDocuments, listFiles, setDocument } from "./firebase";


export interface Album {
    title: string;
    id: string;
    photos: Photo[];
}

export interface Photo {
    name: string;
    url: string;
    width?: number;
    height?: number;
}

const albumPath = (albumId: string) => `albums/${albumId}`

export async function listAlbums(): Promise<string[]> {
    const ids = await listDocuments('albums');
    return ids;
}

export async function getAlbum(albumId: string) : Promise<Album> {
    const album = await getDocument<Album>(albumPath(albumId))
    return album;
}

export async function regenerateAlbum(albumId: string) {
    const { title } = await getDocument<Album>(albumPath(albumId))

    const files = await listFiles(albumPath(albumId));

    const photos: Photo[] = await Promise.all(files.map(async (file) => {
        const { name } = file;

        const url = await getDownloadURL(file);
        const data = await getBytes(file)
        
        const { width, height } = imageSize(Buffer.from(data));

        return { name, url, width, height }
    }))

    const album = {
        title,
        id: albumId,
        photos
    }
    
    await setDocument<Album>(albumPath(albumId), album)

    return album;
}