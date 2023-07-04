import { useState } from "react";
import { useInterval } from "../core/hooks";
import { Action } from "../core/types/utils";
import { AleasShow } from "./aleas-setup";


export type AleasRuntimeState = "Stopped"|"BeforeShow"|"Show"|"AfterShow";

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