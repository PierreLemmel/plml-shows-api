import { HasId, MinMax, Named } from "../core/types/utils";
import { randomRange } from "../core/utils";
import { AleasAudioItem, AleasDurationItem, AleasProviderItem, AleasSceneItem } from "./providers";

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
}|{ type: "FromCollection", collectionName: string })

export interface AleasSceneItemSettings extends AleasProviderItem {
    sceneName: string;
}

export type AleasDurationItemSettings = AleasProviderItem & ({
    type: "NoAudio"
}|{ type: "FromCollection", collectionName: string })

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