import { useEffect } from "react";
import { HasId, MinMax, Named } from "../core/types/utils";
import { randomRange } from "../core/utils";
import { SceneInfo, ShowInfo, useShowInfo } from "../dmx/showControl";
import { AleasAudioItemInfo, AleasDurationItemInfo, AleasProviderItem, AleasSceneItemInfo } from "./aleas-providers";

export interface IntroOutroSettings {
    scene: string;
    audio: string;

    duration: MinMax;
    fadeDuration: MinMax;
}


export interface AleasDuration {
    duration: number;
    fadeIn: number;
    fadeOut: number;
}

export interface AleasGenerationSettings {
    showDuration: number;
    blackoutDuration: number;
}

export type AleasAudioItemSettings = AleasProviderItem & ({
    type: "NoAudio"
}|{
    type: "FromCollection",
    collectionName: string,
    volume: MinMax
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
    scenesInfo: SceneInfo[];

    generation: AleasGenerationInfo;
    providers: AleasProviderInfo;
}

export interface AleasGenerationInfo {
    showDuration: number;
    blackoutDuration: number;
}

export interface AleasProviderInfo {
    audio: AleasAudioItemInfo[];
    scenes: AleasSceneItemInfo[];
    duration: AleasDurationItemInfo[];
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
    
    const {
        showDuration,
        blackoutDuration
    } = generation;

    return {
        showDuration,
        blackoutDuration
    }
}

function generateProvidersInfo(providers: AleasProviderSettings): AleasProviderInfo {

    const audio: AleasAudioItemInfo[] = [];
    const scenes: AleasSceneItemInfo[] = [];
    const duration: AleasDurationItemInfo[] = [];

    const result: AleasProviderInfo = {
        audio,
        scenes,
        duration
    }

    return result;
}

export function useAleasShowInfo(aleasShow: AleasShow|null, showInfo: ShowInfo|null): AleasShowInfo|null {

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
    const providersInfo = generateProvidersInfo(providers);

    const result: AleasShowInfo = {
        show: showInfo,
        generation: generationInfo,
        providers: providersInfo,
        scenesInfo: showInfo.scenes,
        name, id
    }
    
    return result;
}