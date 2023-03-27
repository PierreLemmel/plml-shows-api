import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useEffectAsync } from "../core/utils";
import { DmxWriter } from "./dmx512";
import { Enttec, OpenDmxDevice } from "./enttecOpenDmx";

export function useDmxWriter(): DmxWriter|null {

    return useEnttecOpenDmx();
}


function useEnttecOpenDmx(): DmxWriter|null {
    
    const [, setFound] = useState<boolean>(false);
    const [opened, setOpened] = useState<boolean>(false);
    const [, setOpening] = useState<boolean>(false);
    const [, setClosing] = useState<boolean>(false);
    
    const [device, setDevice] = useState<OpenDmxDevice>();
    const buffer = useMemo(() => Buffer.alloc(513), []);

    const startTime = useMemo(() => new Date().getTime(), []);
    const [lastChangeTime, setLastChangeTime] = useState<number>(0);

    const scanForDevice = async () => {

        if (device) {
            return;
        }

        const ports = await navigator.serial?.getPorts();
        if (ports) {
            const enttecPort = ports.find(Enttec.isEnttecOpenDmx);
            if (enttecPort) {

                enttecPort.ondisconnect = () => {
                    
                    setDevice(undefined);
                    setFound(false);
                }

                const newDevice = new OpenDmxDevice(enttecPort);
                setDevice(newDevice);
                setFound(true);
            }
        }
    }

    useEffect(() => {
        const { serial } = navigator;
        
        serial?.addEventListener("connect", scanForDevice)

        return () => serial?.removeEventListener("connect", scanForDevice);
    }, []);

    useEffectAsync(scanForDevice, []);

    const changedRef = useRef<boolean>(false);
    useEffect(() => {
        
        const updateInterval = setInterval(() => {
            
            if (device?.state === "Opened") {
                (async () => {
                    await device.write(buffer, 0);
                    await device.sendFrame();
                })();
            }

            if (changedRef.current === true) {
                setLastChangeTime(new Date().getTime() - startTime);
                changedRef.current = false;
            }
        }, 1000.0 / OpenDmxDevice.refreshRate);

        return () => clearInterval(updateInterval);

    }, [device, buffer])

    if (device) {

        const { open, close, canOpen, canClose, state } = device;

        return {
            open: async () => {
                setOpening(true);
                await open();
                setOpened(device.opened);
                setOpening(false);
            },
            close: async () => {
                setClosing(true);
                await close();
                setClosing(false);
                setOpened(false);
            },
            getValue: i => buffer.readUInt8(i),
            setValue: (i, val) => {
                changedRef.current = true;
                buffer.writeUInt8(val, i);
            },
            lastChangeTime,
            opened,
            state,
            canOpen,
            canClose
        }
    }
    else {
        return null;
    }
}

export const DmxWriterContext = createContext<DmxWriter|null>(null);

export function useDmxWriterContext() {
    return useContext<DmxWriter|null>(DmxWriterContext);
}