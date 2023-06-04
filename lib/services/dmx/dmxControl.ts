import { createContext, Dispatch, useCallback, useContext, useMemo, useRef, useState } from "react";
import { useInterval } from "../core/hooks";
import { smoothDamp, Velocity } from "../core/mathf";
import { createArray } from "../core/utils";
import { DmxWriteInterfaceState } from "./dmx512";
import { useEnttecOpenDmx } from "./enttecOpenDmx";

export type GetDmxChan = (i: number) => number;
export type SetDmxChan = (i: number, val: number) => void;

export interface DmxControlProps {

    master: number;
    setMaster: Dispatch<number>;
    blackout: boolean;
    setBlackout: Dispatch<boolean>;
    fade: number;
    setFade: Dispatch<number>;

    getValue: GetDmxChan;
    getTarget: GetDmxChan;
    setTarget: SetDmxChan;

    clear: () => void;

    targets: ReadonlyArray<number>;
    velocities: ReadonlyArray<Readonly<Velocity>>;
    values: ReadonlyArray<number>;

    writer: DmxWriter;
}

export interface DmxTrack {

}

interface ControlProps {
    master: number;
    blackout: boolean;
    fade: number;
}

export interface DmxWriter {
    canOpen: boolean;
    canClose: boolean;

    state: DmxWriteInterfaceState;

    open?(): void;
    close?(): void;
}

export function useDmxControl(): DmxControlProps {

    const [master, setMaster] = useState<number>(1.0);
    const [blackout, setBlackout] = useState<boolean>(false);
    const [fade, setFade] = useState<number>(0.0);

    const [lastUpdate, setLastUpdate] = useState<number>(0);

    const targets = useMemo(() => createArray(512, 0), []);
    const velocities = useMemo(() => createArray(512, Velocity.zero), []);
    const values = useMemo(() => createArray(512, 0), []);
    const output = useMemo(() => Buffer.alloc(512), []);

    const controlRef = useRef<ControlProps>({ master, blackout, fade });
    controlRef.current = { master, blackout, fade };

    const boundsRef = useRef({ min: 513, max: 0 })

    const writeInterface = useEnttecOpenDmx();

    const { state: writeState } = writeInterface;

    useInterval((props) => {
        
        const { deltaTime, time } = props;
        const { master, blackout, fade } = controlRef.current;

        const bounds = boundsRef.current;

        const {
            min: minVal,
            max: maxVal
        } = bounds;

        for (let i = minVal; i < maxVal; i++) {
            
            const target = master * targets[i];

            values[i] = smoothDamp(values[i], target, velocities[i], fade, Number.MAX_VALUE, deltaTime / 1000);
        }

        if (!blackout) {
            for (let i = 0; i < maxVal; i++) {
                const uint8 = Math.round(values[i]);
                output.writeUInt8(uint8, i);
            }
        }
        else {
            output.fill(0);
        }

        setLastUpdate(time);

    }, 1000 / 30, []);

    const { refreshRate } = {
        refreshRate: 1000,
        ...writeInterface
    }

    useInterval(() => {

        (async () => {
            if (writeInterface.state === "Opened") {
                await writeInterface.sendFrame(output);
            }
        })();
        

    }, 1000 / refreshRate, [writeState], writeState === "Opened");

    const getValue = useCallback<GetDmxChan>((i: number) => Math.round(values[i]), []);
    const getTarget = useCallback<GetDmxChan>((i: number) => Math.round(targets[i]), []);
    const setTarget = useCallback<SetDmxChan>((i: number, val: number) => {
        
        const bounds = boundsRef.current;

        if (i < bounds.min) {
            bounds.min = i;
        }

        if ((i + 1) > bounds.max) {
            bounds.max = i + 1;
        }
        
        return targets[i] = Math.round(val);
    }, []);

    const clear = useCallback(() => {
        targets.fill(0);
        velocities.fill(Velocity.zero());
        values.fill(0);
        output.fill(0);

        boundsRef.current.min = 513;
        boundsRef.current.max = 0;
    }, []);

    const { open, close } = {
        open: undefined,
        close: undefined,
        ...writeInterface
    }

    const writer: DmxWriter = {
        state: writeState,
        canOpen: open !== undefined,
        canClose: close !== undefined,
        open,
        close
    }

    return {
        master,
        setMaster,
        blackout,
        setBlackout,
        fade,
        setFade,

        getValue,
        getTarget,
        setTarget,

        clear,

        targets,
        velocities,
        values,

        writer
    }
}

export const DmxControlContext = createContext<DmxControlProps|null>(null);

export function useDmxControlContext() {
    return useContext<DmxControlProps|null>(DmxControlContext);
}