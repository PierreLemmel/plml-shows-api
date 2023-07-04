import { sum } from "@/lib/services/core/maths";
import { HasId, MinMax, Named } from "@/lib/services/core/types/utils";
import { generateId, randomElement, randomRange } from "@/lib/services/core/utils";
import { type } from "os";
import { useCallback, useMemo, useRef } from "react";
import { AudioClipCollection, AudioClipData } from "../audio/audioControl";
import { Scene } from "../dmx/showControl";
import { AleasDuration, getRandomDuration } from "./aleas-setup";


export interface AleasProviderItem extends Named, HasId {
    readonly active: boolean;
    readonly weight: number;
    readonly canChain: boolean;
}


export interface AleasProvider<T> {
    readonly nextValue: () => T;
}

export function useAleasProvider<T extends AleasProviderItem, U>(providers: T[], getValue: (elt: T) => U): AleasProvider<U> {

    const excludeMapRef = useRef<Map<string, string|undefined>>(new Map());

    const rootId = useMemo(generateId, []);

    const getValueFromProviders = useCallback((providers: T[], collId: string): U => {
        
        const excludeMap = excludeMapRef.current;

        const excludedId = excludeMap.get(collId);
        const filtered = excludedId !== undefined ?
            providers.filter(p => p.id !== excludedId) : 
            providers;
        
        const totalWeigth = sum(filtered.map(p => p.weight));

        const r = randomRange(0, totalWeigth);

        let addr = r;
        const provider = providers.find(p => {

            addr -= p.weight;
            return addr < 0;
        })!;

        excludeMap.set(collId, provider.canChain ? undefined : provider.id);

        const result = getValue(provider);
        return result;
    }, [getValue])

    const nextValue = () => getValueFromProviders(providers, rootId);

    return {
        nextValue
    }
}

export interface AleasDurationItem extends AleasProviderItem {
    duration: MinMax;
    fade: MinMax;
}

export interface AleasSceneItem extends AleasProviderItem {
    scene: Scene;
}

export type AudioItemType = "FromCollection"|"NoAudio";
interface AleasAudioItemBase<T extends AudioItemType> extends AleasProviderItem {
    type: T;
}

export interface NoAudioItem extends AleasAudioItemBase<"NoAudio"> {

}
export interface AleasAudioCollectionItem extends AleasAudioItemBase<"FromCollection"> {
    collection: AudioClipCollection;
}

export type AleasAudioItem = NoAudioItem|AleasAudioCollectionItem;

export function useAleasDurationProvider(providers: AleasDurationItem[]): AleasProvider<AleasDuration> {

    const getRandomValue = useCallback((item: AleasDurationItem) => getRandomDuration(item.duration, item.fade), []);
    const provider = useAleasProvider(providers, getRandomValue);

    return provider;
}

export function useAleasAudioProvider(providers: AleasAudioItem[]): AleasProvider<AudioClipData|null> {

    const getRandomValue = useCallback((item: AleasAudioItem) => {

        if (item.type === "NoAudio") {
            return null;
        }
        else {
            const elts = Object.values(item.collection.clips);
            return randomElement(elts);
        }
    }, []);
    const provider = useAleasProvider(providers, getRandomValue);

    return provider;
}

export function useAleasSceneProvider(providers: AleasSceneItem[]): AleasProvider<Scene> {

    const getValue = useCallback((item: AleasSceneItem) => item.scene, []);
    const provider = useAleasProvider(providers, getValue);

    return provider;
}