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