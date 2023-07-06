import { sum } from "@/lib/services/core/maths";
import { HasId, MinMax, Named } from "@/lib/services/core/types/utils";
import { generateId, randomElement, randomRange } from "@/lib/services/core/utils";
import { AudioClipCollection, AudioClipData } from "../audio/audioControl";
import { Scene, SceneInfo } from "../dmx/showControl";
import { AleasDuration, getRandomDuration } from "./aleas-setup";


export interface AleasProviderItem extends Named, HasId {
    readonly active: boolean;
    readonly weight: number;
    readonly canChain: boolean;
}

export interface ValueWithInfo<T> {
    value: T;
    info: {
        provider: string;
    }
}

export interface ProviderOptionsBase<T> {
    filter?: (p:T) => boolean
}

export interface AleasProvider<T> {
    readonly nextValue: () => ValueWithInfo<T>
}

function getProvider<T extends AleasProviderItem, U>(providers: T[], getValue: (elt: T) => U): AleasProvider<U> {

    const excludeMap: Map<string, string|undefined> = new Map();

    const rootId = generateId()

    const getValueFromProviders = (providers: T[], collId: string): ValueWithInfo<U> => {
        
        const excludedId = excludeMap.get(collId);
        const filtered = (excludedId !== undefined ?
            providers.filter(p => p.id !== excludedId) : 
            providers);
        
        const totalWeigth = sum(filtered.map(p => p.weight));

        const r = randomRange(0, totalWeigth);

        let addr = r;
        const provider = providers.find(p => {

            addr -= p.weight;
            return addr < 0;
        })!;

        excludeMap.set(collId, provider.canChain ? undefined : provider.id);

        const result = getValue(provider);
        return {
            value: result,
            info: {
                provider: provider.name
            }
        };
    }

    const nextValue = () => getValueFromProviders(providers, rootId);

    return {
        nextValue
    }
}

export interface AleasDurationItemInfo extends AleasProviderItem {
    duration: MinMax;
    fade: MinMax;
}

export interface AleasSceneItemInfo extends AleasProviderItem {
    scene: SceneInfo;
}


export type AleasAudioItemInfo = AleasProviderItem & (
    { type: "NoAudio"} |
    { 
        type: "FromCollection",
        collection: AudioClipCollection,
        volume: MinMax,
        duration: MinMax,
        fadeDuration: MinMax
    }
)

export function getAleasDurationProvider(providers: AleasDurationItemInfo[]): AleasProvider<AleasDuration> {

    const getRandomValue = (item: AleasDurationItemInfo) => getRandomDuration(item.duration, item.fade);
    const provider = getProvider(providers, getRandomValue);

    return provider;
}

export function getAleasAudioProvider(providers: AleasAudioItemInfo[]): AleasProvider<AudioClipData|null> {

    const getRandomValue = (item: AleasAudioItemInfo) => {

        if (item.type === "NoAudio") {
            return null;
        }
        else {
            const elts = Object.values(item.collection.clips);
            return randomElement(elts);
        }
    };
    const provider = getProvider(providers, getRandomValue);

    return provider;
}

export function getAleasSceneProvider(providers: AleasSceneItemInfo[]): AleasProvider<SceneInfo> {

    const getValue = (item: AleasSceneItemInfo) => item.scene;
    const provider = getProvider(providers, getValue);

    return provider;
}