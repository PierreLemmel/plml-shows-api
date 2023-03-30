import { createContext, Dispatch, SetStateAction, useCallback, useContext, useMemo, useState } from "react";
import { Velocity } from "../core/mathf";
import { createArray } from "../core/utils";

export interface DmxControler {

    master: number;
    setMaster: Dispatch<number>;
    blackout: boolean;
    setBlackout: Dispatch<boolean>;

    targets: number[];
    velocities: Velocity[];
    values: number[];
    output: Buffer;
}

export interface DmxTrack {

}

export function useDmxControler(): DmxControler {

    const [master, setMaster] = useState<number>(1.0);
    const [blackout, setBlackout] = useState<boolean>(false);

    const targets = useMemo(() => createArray(512, 0), []);
    const velocities = useMemo(() => createArray(512, Velocity.zero), []);
    const values = useMemo(() => createArray(512, 0), []);
    const output = useMemo(() => Buffer.alloc(512), []);

    const startTime = useMemo(() => new Date().getTime(), []);

    const updateValues = useCallback(() => {

        

    }, []);

    return {
        master,
        setMaster,
        blackout,
        setBlackout,

        targets,
        velocities,
        values,
        output
    }
}

export const DmxControlContext = createContext<DmxControler|null>(null);

export function useDmxControlContext() {
    return useContext<DmxControler|null>(DmxControlContext);
}