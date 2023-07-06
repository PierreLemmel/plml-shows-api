import { Timestamp } from "firebase/firestore";
import { get } from "http";
import { useState } from "react";
import { getAudioClip } from "../api/audio";
import { AudioClipData, AudioClipInfo } from "../audio/audioControl";
import { IntervalCallbackProps, useInterval } from "../core/hooks";
import { Action, MinMax } from "../core/types/utils";
import { randomRange } from "../core/utils";
import { SceneInfo } from "../dmx/showControl";
import { getAleasAudioProvider, getAleasDurationProvider, getAleasSceneProvider } from "./aleas-providers";
import { AleasShow, AleasShowInfo } from "./aleas-setup";


export type AleasRuntimeState = "Stopped"|"BeforeShow"|"Show"|"AfterShow";

export interface AleasShowRun {

    show: AleasShowInfo;
    
    duration: number;
    scenes: AleasShowRunScene[];

    metadata: AleasShowRunMetadata;
}

export interface AleasShowRunMetadata {
    created: Timestamp;

    createdById: string;

    started?: Timestamp;
    ended?: Timestamp;

    stopped?: Timestamp;
}

export type AleasShowRunSceneType = "Intro"|"Outro"|"Scene"|"Blackout";

export interface AleasShowRunScene {
    type: AleasShowRunSceneType;
    scene: SceneInfo;
    timeWindow: TimeWindow;
    audio: AudioClipData|null;

    metadata: AleasShowRunSceneMetadata;
}

export interface AleasShowRunSceneMetadata {
    
    durationProvider?: string;
    sceneProvider?: string;
    audioProvider?: string;
    remark?: string;
}

export interface TimeWindow {
    startTime: number;
    duration: number;
    fadeIn: number;
    fadeOut: number;
}

export async function generateAleasShowRun(show: AleasShowInfo, userId: string): Promise<AleasShowRun> {
    
    const scenes = await generateScenes(show);
    return {
        
        show,
        duration: show.generation.showDuration,
        scenes: scenes,
        metadata: {
            created: Timestamp.now(),
            createdById: userId
        }
    }
}

async function generateScenes(showInfo: AleasShowInfo): Promise<AleasShowRunScene[]> {
    
    const {
        generation: {
            showDuration,
            blackoutDuration,
            splitThreshold,
            intro: {
                scene: introSceneName,
                audio: introAudio,
                duration: introDuration,
                fadeDuration: introFadeDuration,
            },
            outro: {
                scene: outroSceneName,
                audio: outroAudio,
                duration: outroDuration,
                fadeDuration: outroFadeDuration,
            },
        },
        providers: {
            audio: audioProviders,
            scenes: sceneProviders,
            durations: durationProviders
        }
    } = showInfo;
    
    let time = 0;
    let remaining = showDuration;
    
    const scenes: AleasShowRunScene[] = [];

    const introTimeWindow = createTimeWindow(time, introDuration, introFadeDuration);
    const [introClipCollection, introClipName] = introAudio.split("/");
    const introAudioClip = await getAudioClip(introClipCollection, introClipName);
    const introRunScene: AleasShowRunScene = {
        type: "Intro",
        scene: showInfo.show.scenes.find(s => s.name === introSceneName)!,
        timeWindow: introTimeWindow,
        audio: introAudioClip,
        metadata: {}
    }
    
    scenes.push(introRunScene);
    time += introTimeWindow.duration + blackoutDuration;
    remaining -= introTimeWindow.duration + blackoutDuration;



    const outroTimeWindow = createTimeWindowFromEnd(outroDuration, outroFadeDuration, showDuration);
    const [outroClipCollection, outroClipName] = outroAudio.split("/");
    const outroAudioClip = await getAudioClip(outroClipCollection, outroClipName);
    const outroRunScene: AleasShowRunScene = {
        type: "Outro",
        scene: showInfo.show.scenes.find(s => s.name === outroSceneName)!,
        timeWindow: outroTimeWindow,
        audio: outroAudioClip,
        metadata: {}
    }
    
    time += outroTimeWindow.duration;
    remaining -= outroTimeWindow.duration + blackoutDuration;

    const durationProvider = getAleasDurationProvider(durationProviders);
    const sceneProvider = getAleasSceneProvider(sceneProviders);
    const audioProvider = getAleasAudioProvider(audioProviders);

    let done = false;
    while (!done) {

        let attemps = 0;
        const MAX_ATTEMPS = 100;
        let durationResult;
        do {
            durationResult = durationProvider.nextValue();
        }
        while (durationResult.value.duration > remaining && attemps++ < MAX_ATTEMPS);

        if (attemps >= MAX_ATTEMPS) {
            throw new Error(`Could not find a duration that fits in the remaining time (${remaining})`);
        }

        if (remaining < splitThreshold) {
            done = true;
        }
        
        const audioResult = audioProvider.nextValue();
        const sceneResult = sceneProvider.nextValue();

        const timeWindow = {
            startTime: time,
            ...durationResult.value
        }

        const newScene: AleasShowRunScene = {
            type: "Scene",
            scene: sceneResult.value,
            timeWindow: timeWindow,
            audio: audioResult.value,
            metadata: {
                durationProvider: durationResult.info.provider,
                sceneProvider: sceneResult.info.provider,
                audioProvider: audioResult.info.provider
            }
        }

        scenes.push(newScene);

        time += timeWindow.duration + blackoutDuration;
        remaining -= timeWindow.duration + blackoutDuration;

        if (remaining < splitThreshold) {
            done = true;
        }
    }
    
    scenes.push(outroRunScene);

    return scenes;
}


function createTimeWindow(startTime: number, duration: MinMax, fadeDurationMM: MinMax) {
    
    return {
        startTime,
        duration: randomRange(duration.min, duration.max),
        fadeIn: randomRange(fadeDurationMM.min, fadeDurationMM.max),
        fadeOut: randomRange(fadeDurationMM.min, fadeDurationMM.max)
    }
}

function createTimeWindowFromEnd(durationMM: MinMax, fadeDurationMM: MinMax, totalDuration: number) {
    const duration = randomRange(durationMM.min, durationMM.max);

    return {
        startTime: totalDuration - duration,
        duration,
        fadeIn: randomRange(fadeDurationMM.min, fadeDurationMM.max),
        fadeOut: randomRange(fadeDurationMM.min, fadeDurationMM.max)
    }
}

export interface AleasRuntime {
    run: AleasShowRun;

    state: AleasRuntimeState;
    currentScene: AleasShowRunScene|null;
    sceneMaster: number;

    currentTime: number;

    play: Action;
    startShow: Action;
    stopShow: Action;
    stop: Action;
}

export function useAleasRuntime(run: AleasShowRun|null): AleasRuntime|null {

    const [state, setState] = useState<AleasRuntimeState>("Stopped");
    const [currentScene, setCurrentScene] = useState<AleasShowRunScene|null>(null);
    const [time, setTime] = useState<number>(0);
    const [sceneMaster, setSceneMaster] = useState<number>(1);

    const play = () => setState("BeforeShow")
    const startShow = () => setState("Show");
    const stopShow = () => setState("BeforeShow");
    const stop = () => setState("Stopped");

    useInterval((props: IntervalCallbackProps) => {
        const { time } = props;

        setTime(time);
    }, 1000 / 30, [])

    if (!run) {
        return null;
    }

    return {
        run,

        state,

        currentScene,
        currentTime: time,
        sceneMaster,

        play,
        startShow,
        stopShow,
        stop
    }
}

