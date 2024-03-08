import { Dispatch } from "react";
import { createArray } from "../core/arrays";
import { DmxWriteInterfaceState } from "./dmx512";
import { createEnttecOpenDmxWriter } from "./enttecOpenDmx";

export type GetDmxChan = (i: number) => number;
export type SetDmxChan = (i: number, val: number) => void;

export interface DmxControl {

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


declare global {
    interface Window {
        dmx: DmxControl;
    }
}


export function initializeDmxControlIfNeeded() {
    window.dmx ??= createDmxControl();
}

const dmxControlOptions = {
    animationRefreshRate: 30,
    writeRefreshRate: 30
} as const;

function createDmxControl(): DmxControl {

    const targets = createArray(512, 0);
    const values = createArray(512, 0);
    const output = Buffer.alloc(512);

    const bounds = { min: 513, max: 0 }

    const writeInterface = createEnttecOpenDmxWriter();

    const { state: writeState } = writeInterface;

    const getValue = (i: number) => Math.round(values[i]);
    const getTarget = (i: number) => Math.round(targets[i]);
    const setTarget = (i: number, val: number) => {

        if (i < bounds.min) {
            bounds.min = i;
        }

        if ((i + 1) > bounds.max) {
            bounds.max = i + 1;
        }

        return targets[i] = Math.round(val);
    };

    const cleanTargets = () => {
        const { min, max } = bounds;

        for (let i = min; i < max; i++) {
            targets[i] = 0;
        }
    }

    const clear = () => {
        targets.fill(0);
        values.fill(0);
        output.fill(0);

        bounds.min = 513;
        bounds.max = 0;
    };

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

    const dmxControl = {
        master: 1.0,
        blackout: false,
        fade: 0.0,
        
        setBlackout: function(b: boolean) {
            this.blackout = b;
        },
        setFade: function(f: number) {
            this.fade = f;
        },
        setMaster: function(m: number) {
            this.master = m;
        },

        getValue,
        getTarget,
        setTarget,

        cleanTargets,
        clear,

        targets,
        values,

        writer
    } satisfies DmxControl;

    const { refreshRate } = {
        refreshRate: 1000,
        ...writeInterface
    }

    setInterval(() => {
        
        const { master, blackout, fade } = dmxControl;

        const {
            min: minVal,
            max: maxVal
        } = bounds;

        if (fade > 0) {

            const d = 255 * ((1 / refreshRate) / fade);

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

        
        if (writeInterface.state === "Opened") {
            writeInterface.sendFrame(output);
        }

    }, 1000 / refreshRate);

    return dmxControl;
}

export function useDmxControl() {
    return window.dmx;
}