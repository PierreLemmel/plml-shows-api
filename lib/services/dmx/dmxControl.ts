import { createContext, Dispatch, useCallback, useContext, useMemo, useRef, useState } from "react";
import { useInterval } from "../core/hooks";
import { createArray, doNothing, returnZero } from "../core/utils";
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

    cleanTargets: () => void;
    clear: () => void;

    targets: ReadonlyArray<number>;
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

export function useNewDmxControl(): DmxControlProps {

    const [master, setMaster] = useState<number>(1.0);
    const [blackout, setBlackout] = useState<boolean>(false);
    const [fade, setFade] = useState<number>(0.0);

    const [lastUpdate, setLastUpdate] = useState<number>(0);

    const targets = useMemo(() => createArray(512, 0), []);
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

        if (fade > 0) {

            const d = 255 * ((deltaTime / 1000) / fade);

            for (let i = minVal; i < maxVal; i++) {
            
                const target = master * targets[i];
    
                const val = values[i];
                values[i] = val > target ? Math.max(target, val - d) : Math.min(target, val + d);
            }
        }
        else {
            for (let i = minVal; i < maxVal; i++) {

                values[i] = master * targets[i];
            }
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
        
        if (writeInterface.state === "Opened") {
            writeInterface.sendFrame(output);
        }

    }, 1000 / refreshRate, [writeState], writeState === "Opened");

    const getValue = useCallback<GetDmxChan>((i: number) => Math.round(values[i]), [values]);
    const getTarget = useCallback<GetDmxChan>((i: number) => Math.round(targets[i]), [targets]);
    const setTarget = useCallback<SetDmxChan>((i: number, val: number) => {
        
        const bounds = boundsRef.current;

        if (i < bounds.min) {
            bounds.min = i;
        }

        if ((i + 1) > bounds.max) {
            bounds.max = i + 1;
        }

        return targets[i] = Math.round(val);
    }, [targets]);

    const cleanTargets = useCallback(() => {
        const { min, max } = boundsRef.current;

        for (let i = min; i < max; i++) {
            targets[i] = 0;
        }
    }, [targets])

    const clear = useCallback(() => {
        targets.fill(0);
        values.fill(0);
        output.fill(0);

        boundsRef.current.min = 513;
        boundsRef.current.max = 0;
    }, [targets, values, output]);

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

        cleanTargets,
        clear,

        targets,
        values,

        writer
    }
}


export const DmxControlContext = createContext<DmxControlProps>({
    master: 0,
    setMaster: doNothing,
    blackout: false,
    setBlackout: doNothing,
    fade: 0,
    setFade: doNothing,
    getValue: returnZero,
    getTarget: returnZero,
    setTarget: doNothing,
    cleanTargets: doNothing,
    clear: doNothing,
    targets: [],
    values: [],
    writer: {
        canOpen: true,
        canClose: false,
        state: "Undetected"
    }
});

export function useDmxControl() {
    return useContext<DmxControlProps>(DmxControlContext);
}