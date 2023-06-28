import { DependencyList, useEffect, useMemo, useRef } from "react";
import { currentTime } from "./utils";

export const useEffectAsync = (effect: () => Promise<void>, deps?: DependencyList): void => {
    deps ||= [];
    
    useEffect(() => {
        (async () => {
            await effect();
        })();
    }, deps); // eslint-disable-line react-hooks/exhaustive-deps
}

export interface IntervalCallbackProps {
    time: number;
    deltaTime: number;
    startTime: number;
    ellapsed: number;
}

export type IntervalCallback = (props: IntervalCallbackProps) => void;

export const useInterval = (callback: IntervalCallback, ms: number, deps?: DependencyList, condition?: boolean): void => {

    deps ||= [];
    const startTime = useMemo(() => currentTime(), deps); // eslint-disable-line react-hooks/exhaustive-deps

    const currentTimeRef = useRef<number>(currentTime())

    useEffect(() => {

        if (condition !== false) {
            const interval = setInterval(() => {

                const time = currentTime();
    
                const deltaTime = time - currentTimeRef.current;
                const ellapsed = time - startTime;
    
                currentTimeRef.current = time;
    
                const props = { time, deltaTime, startTime, ellapsed };
    
                callback(props);
            }, ms);
    
            return () => clearInterval(interval);
        }
        
    }, [ms, condition, startTime, ...deps])  // eslint-disable-line react-hooks/exhaustive-deps
}


export const useTimeout = (callback: () => void, ms: number, deps?: DependencyList, condition?: boolean): void => {

    deps ||= [];

    useEffect(() => {

        if (condition !== false) {
            const timeout = setTimeout(() => callback(), ms);
            return () => clearTimeout(timeout);
        }
        
    }, [ms, condition, ...deps]) // eslint-disable-line react-hooks/exhaustive-deps
}