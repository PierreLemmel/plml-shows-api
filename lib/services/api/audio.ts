import { Timestamp } from "firebase/firestore";

export interface AudioClipData {
    id: string;
    name: string;
    url: string;
    created: Timestamp;

    info: AudioClipInfo;
}

export interface AudioClipInfo {
    duration: number;
    tempo: number;
    signature: string;
    source: string;
    author: string;

    categories: string[];
    tags: string[];
}

