import { Timestamp } from "firebase/firestore";
import { get } from "http";
import { use, useCallback, useEffect, useMemo, useState } from "react";
import { getAudioClip } from "../api/audio";
import { AudioClipData, AudioClipInfo, useRealtimeAudio } from "../audio/audioControl";
import { IntervalCallbackProps, useInterval } from "../core/hooks";
import { Action, MinMax } from "../core/types/utils";
import { randomRange } from "../core/utils";
import { Scene, SceneInfo, toScene, useRealtimeScene, useShowContext } from "../dmx/showControl";
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
    audio: {
        data: AudioClipData,
        window: TimeWindow
    }|null;

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
        audio: {
            data: introAudioClip,
            window: introTimeWindow
        },
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
        audio: {
            data: outroAudioClip,
            window: outroTimeWindow,
        },
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
            durationResult = durationProvider.nextValue({});
        }
        while (durationResult.value.duration > remaining && attemps++ < MAX_ATTEMPS);

        if (attemps >= MAX_ATTEMPS) {
            throw new Error(`Could not find a duration that fits in the remaining time (${remaining})`);
        }

        if (remaining < splitThreshold) {
            done = true;
        }
        
        const audioResult = audioProvider.nextValue({
            duration: durationResult.value.duration
        });
        const sceneResult = sceneProvider.nextValue({});

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

    currentAudio: AudioClipData|null;
    audioVolume: number;

    currentTime: number;
    setCurrentTime: (time: number) => void;

    play: Action;
    startShow: Action;
    stopShow: Action;
    stop: Action;
}

type IsInTimeWindowResult = { isBetween: true, factor: number } | { isBetween: false};
function isInTimeWindow(time: number, window: TimeWindow): IsInTimeWindowResult {

    if (time >= window.startTime && time <= window.startTime + window.duration) {

        let factor = 1;
        if (time < window.startTime + window.fadeIn) {
            factor = (time - window.startTime) / window.fadeIn;
        }
        else {
            const startOfFadeOut = window.startTime + window.duration - window.fadeOut;
            if (time > startOfFadeOut) {
                factor = 1 - (time - startOfFadeOut) / window.fadeOut;
            }
        }

        return {
            isBetween: true,
            factor
        };
    }
    else {
        return { isBetween: false };
    }
}

export function useAleasRuntime(run: AleasShowRun|null): AleasRuntime|null {

    const showControl = useShowContext();    

    const [state, setState] = useState<AleasRuntimeState>("Stopped");
    
    const [currentScene, setCurrentScene] = useState<AleasShowRunScene|null>(null);
    const [sceneMaster, setSceneMaster] = useState<number>(1);
    
    const [currentAudio, setCurrentAudio] = useState<AudioClipData|null>(null);
    const [audioVolume, setAudioVolume] = useState<number>(1);
    
    const [time, setTime] = useState<number>(0);
    const setCurrentTime = useCallback((time: number) => {

    }, [])

    useRealtimeScene(currentScene?.scene ?? null, true, sceneMaster);

    const realTimeAudio = useMemo<AudioClipData|undefined>(() => currentScene?.audio ? currentScene.audio.data : undefined, [currentScene]);
    useRealtimeAudio(realTimeAudio, true, audioVolume);

    const play = () => setState("BeforeShow")
    const startShow = () => setState("Show");
    const stopShow = () => setState("BeforeShow");
    const stop = () => setState("Stopped");

    const scenes = useMemo(() => run ? run.scenes : [], [run]);

    useInterval((props: IntervalCallbackProps) => {
        const { ellapsed } = props;

        const t = ellapsed / 1000;

        const findCurrScene = scenes.map(s => ({
            sceneInWindow: isInTimeWindow(t, s.timeWindow),
            scene: s
        })).find(s => s.sceneInWindow.isBetween) as { sceneInWindow: { isBetween: true, factor: number }, scene: AleasShowRunScene }|undefined;

        const currScene = findCurrScene?.scene || null;
        const sMaster = findCurrScene?.sceneInWindow.factor || 0;
        

        setCurrentScene(currScene);
        setSceneMaster(sMaster);

        if (currScene?.audio) {

            const audioInWindow = isInTimeWindow(t, currScene.audio.window);
            if (audioInWindow.isBetween) {
                setCurrentAudio(currScene.audio.data);
                setAudioVolume(audioInWindow.factor);
            }
        }
        else {
            setCurrentAudio(null);
        }

        setTime(ellapsed / 1000);
    }, 1000 / 30, [scenes, state], state === "Show");

    if (!run) {
        return null;
    }

    return {
        run,

        state,

        currentScene,
        currentTime: time,
        setCurrentTime,

        currentAudio,
        audioVolume,
        sceneMaster,

        play,
        startShow,
        stopShow,
        stop
    }
}