import { createContext, useContext } from "react";
import { resample } from "../core/maths";
import { notImplemented } from "../core/utils";


export async function getSpectrumData(src: ArrayBuffer, sampleSize?: number): Promise<number[]> {
    
    const defaultSampleSize = 2000;

    const ctx: AudioContext = new AudioContext();


    const buffer = await ctx.decodeAudioData(src);
    const arr = buffer.getChannelData(0);

    const result = resample(arr, sampleSize ?? defaultSampleSize);

    return result;
}