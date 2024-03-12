import { Timestamp } from "firebase/firestore";
import { useEffect, useMemo } from "react";
import { useEffectAsync } from "../core/hooks";
import { resample } from "../core/maths";

export interface SpectrumData {
    spectrum: number[];
    duration: number;
}

export async function getSpectrumData(src: ArrayBuffer, sampleSize?: number): Promise<SpectrumData> {
    
    const defaultSampleSize = 2000;

    const ctx: AudioContext = new AudioContext();

    const audioData = await ctx.decodeAudioData(src);
    const arr = audioData.getChannelData(0);

    const spectrum = resample(arr, sampleSize ?? defaultSampleSize);

    return {
        spectrum,
        duration: audioData.duration
    };
}

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
    author?: string;
    start?: number;
    end?: number;
    markers?: { [key: string]: number };
    categories: string[];
    tags: string[];
}

export interface AudioClipCollection {
    name: string;
    clips: {
        [key: string]: AudioClipData;
    }
}

export function useRealtimeAudio(audioData: AudioClipData|undefined, isPlaying: boolean, volume: number) {

    const audioElt = useMemo<HTMLAudioElement|null>(() => audioData ? new Audio(audioData.url):null, [audioData]);

    useEffect(() => {
        const capturedAudioElt = audioElt;

        return () => {
            capturedAudioElt?.pause();
        }
    }, [audioElt])

    useEffectAsync(async () => {
        if (audioElt) {

            if (isPlaying) {
                await audioElt.play();
            }
            else {
                await audioElt.pause();
            }
        }
    }, [audioElt, isPlaying]);

    useEffect(() => {
        if (audioElt) {
            audioElt.volume = volume;
        }
    }, [audioElt, volume]);
}