import { useCallback, useEffect, useRef, useState } from "react";
import { useEffectAsync } from "../core/utils";
import { DmxWriter, DmxWriterState } from "./dmx512";
import { Enttec, OpenDmxDevice } from "./enttecOpenDmx";

export function useDmxWriter(): DmxWriter|null {

    return useEnttecOpenDmx();
}

export function useEnttecOpenDmx(): DmxWriter|null {
    
    const [found, setFound] = useState<boolean>(false);
    const [opened, setOpened] = useState<boolean>(false);
    const [opening, setOpening] = useState<boolean>(false);
    const [closing, setClosing] = useState<boolean>(false);
    
    const deviceRef = useRef<OpenDmxDevice>();

    const scanForDevice = async () => {

        if (deviceRef.current) {
            return;
        }

        const ports = await navigator.serial?.getPorts();
        if (ports) {
            const enttecPort = ports.find(Enttec.isEnttecOpenDmx);
            if (enttecPort) {

                enttecPort.ondisconnect = () => {
                    
                    deviceRef.current = undefined;
                    setFound(false);
                }

                const newDevice = new OpenDmxDevice(enttecPort);
                deviceRef.current = newDevice;
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

    const device = deviceRef.current;
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
            opened,
            state,
            canOpen: canOpen,
            canClose: canClose
        }
    }
    else {
        return null;
    }
}