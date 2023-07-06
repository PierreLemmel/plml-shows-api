import { Timestamp } from "firebase/firestore";
import { useState } from "react";
import { AudioClipInfo } from "../audio/audioControl";
import { useInterval } from "../core/hooks";
import { Action } from "../core/types/utils";
import { SceneInfo } from "../dmx/showControl";
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

export interface AleasShowRunScene {
    scene: SceneInfo;
    timeWindow: TimeWindow;
    audio: AudioClipInfo|null;
}

export interface TimeWindow {
    startTime: number;
    duration: number;
    fadeIn: number;
    fadeOut: number;
}

export interface AleasRuntimeProps {
    state: AleasRuntimeState;

    play: Action;
    startShow: Action;
    stopShow: Action;
    stop: Action;
}

export function useAleasRuntime(show: AleasShow): AleasRuntimeProps {

    const [state, setState] = useState<AleasRuntimeState>("Stopped");

    const play = () => {
        
    }

    const startShow = () => {
    }

    const stopShow = () => {
    }

    const stop = () => {
    }

    useInterval(() => {
        console.log("Hey")
    }, 1000 / 30, [])

    return {
        state,
        play,
        startShow,
        stopShow,
        stop
    }
}