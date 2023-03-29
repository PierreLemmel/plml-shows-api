import { createContext, useContext, useState } from "react";

export interface DmxControler {

    master: number;
    setMaster: (master: number) => void;
    blackout: boolean;
    setBlackout: (blackout: boolean) => void;
}

export interface DmxTrack {

}

export function useDmxControler(): DmxControler {

    const [master, setMaster] = useState<number>(1.0);
    const [blackout, setBlackout] = useState<boolean>(false);

    return {
        master,
        setMaster,
        blackout,
        setBlackout
    }
}

export const DmxControlContext = createContext<DmxControler|null>(null);

export function useDmxControlContext() {
    return useContext<DmxControler|null>(DmxControlContext);
}