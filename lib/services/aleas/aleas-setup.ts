import { useState } from "react";
import { getAudioClipCollection } from "../api/audio";
import { useEffectAsync } from "../core/hooks";
import { HasId, MinMax, Named } from "../core/types/utils";
import { randomRange } from "../core/utils";
import { SceneInfo, ShowInfo } from "../dmx/showControl";
import { AleasAudioItemInfo, AleasDurationItemInfo, AleasProviderItem, AleasSceneItemInfo } from "./aleas-providers";

export interface IntroOutroSettings {
    scene: string;
    audio: string;

    duration: MinMax;
    fadeDuration: MinMax;

    volume: number;
}


export interface AleasDuration {
    duration: number;
    fadeIn: number;
    fadeOut: number;
}

export interface AleasGenerationSettings {
    showDuration: number;
    blackoutDuration: number;

    splitThreshold: number;

    intro: IntroOutroSettings;
    outro: IntroOutroSettings;
}

export type AleasAudioItemSettings = AleasProviderItem & ({
    type: "NoAudio"
}|{
    type: "FromCollection",
    collectionName: string,
    volume: MinMax,
    duration: MinMax,
    fadeDuration: MinMax
})

export interface AleasSceneItemSettings extends AleasProviderItem {
    sceneName: string;
}

export interface AleasDurationItemSettings extends AleasProviderItem {
    duration: MinMax;
    fade: MinMax;
}

export interface AleasProviderSettings {
    audio: AleasAudioItemSettings[];
    scenes: AleasSceneItemSettings[];
    durations: AleasDurationItemSettings[];
}

export interface AleasShow extends Named, HasId {

    showName: string;

    generation: AleasGenerationSettings;
    providers: AleasProviderSettings;
}

export interface AleasShowInfo extends Named, HasId {
    show: ShowInfo;

    generation: AleasGenerationInfo;
    providers: AleasProviderInfo;
}

export interface IntroOutroInfo {
    scene: string;
    audio: string;

    duration: MinMax;
    fadeDuration: MinMax;

    volume: number;
}

export interface AleasGenerationInfo {
    showDuration: number;
    blackoutDuration: number;
    
    splitThreshold: number;
    
    intro: IntroOutroInfo;
    outro: IntroOutroInfo;
}

export interface AleasProviderInfo {
    audio: AleasAudioItemInfo[];
    scenes: AleasSceneItemInfo[];
    durations: AleasDurationItemInfo[];
}

export function getRandomDuration(duration: MinMax, fade: MinMax): AleasDuration {

    const d = randomRange(duration.min, duration.max);
    const f1 = randomRange(fade.min, fade.max);
    const f2 = randomRange(fade.min, fade.max);

    return {
        duration: d,
        fadeIn: f1,
        fadeOut: f2
    }
}

function generateGenerationInfo(generation: AleasGenerationSettings): AleasGenerationInfo {
    
    const deepCopy = structuredClone(generation);
    return deepCopy;
}

async function generateProvidersInfo(providers: AleasProviderSettings, showInfo: ShowInfo): Promise<AleasProviderInfo> {

    const {
        audio: audioSettings,
        scenes: sceneSettings,
        durations: durationSettings
    } = providers;
    
    const audio: AleasAudioItemInfo[] = await Promise.all(audioSettings.map(async (item) => {
        const { name, id, active, canChain, weight } = item;

        if (item.type === "NoAudio") {
            return {
                name, id, active, canChain, weight,
                type: "NoAudio"
            }
        }
        else {
            const { collectionName, volume, duration, fadeDuration } = item;

            const collection = await getAudioClipCollection(collectionName);
            
            return {
                name, id, active, canChain, weight,
                collection, volume, duration, fadeDuration,
                type: "FromCollection",
            }
        }
    }));
    const scenes: AleasSceneItemInfo[] = sceneSettings
        .map((item) => {
            const scene = showInfo.scenes.find((scene) => scene.name === item.sceneName)!;

            return {
                item,
                scene
            }
        })
        .filter(({ scene }) => scene !== undefined)
        .map(({ item, scene }) => {
            const { name, id, active, canChain, weight } = item;
            return {
                name, id, active, canChain, weight,
                scene
            }
        });
    const durations: AleasDurationItemInfo[] = [...durationSettings];

    const result: AleasProviderInfo = {
        audio,
        scenes,
        durations
    }

    return result;
}

export  function useAleasShowInfo(aleasShow: AleasShow|null, showInfo: ShowInfo|null): AleasShowInfo|null {

    const [aleasShowInfo, setAleasShowInfo] = useState<AleasShowInfo|null>(null);

    useEffectAsync(async () => {
        const result = await generateAleasShowInfo(aleasShow, showInfo);
        setAleasShowInfo(result);
    }, [aleasShow, showInfo]);

    return aleasShowInfo;
}

async function generateAleasShowInfo(aleasShow: AleasShow|null, showInfo: ShowInfo|null): Promise<AleasShowInfo|null> {
    if (!aleasShow || !showInfo) {
        return null;
    }

    const {
        name,
        id,
        showName,
        generation,
        providers
    } = aleasShow;

    if (!showInfo) {
        return null;
    }

    if(showInfo.name !== showName) {
        throw new Error("Show name mismatch");
    }

    const generationInfo = generateGenerationInfo(generation);
    const providersInfo = await generateProvidersInfo(providers, showInfo);

    const result: AleasShowInfo = {
        show: showInfo,
        generation: generationInfo,
        providers: providersInfo,
        
        name, id
    }
    
    return result;
}