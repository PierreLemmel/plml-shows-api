import { useEffect, useMemo, useRef, useState } from "react";
import { useEffectAsync } from "../core/utils";
import { DmxWriter } from "./dmx512";
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
    const buffer = useMemo<Buffer>(() => Buffer.alloc(513),[]);

    const startTime = useMemo(() => new Date().getTime(), []);
    const [lastChangeTime, setLastChangeTime] = useState<number>(0);

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

    const changedRef = useRef<boolean>(false);
    useEffect(() => {

        const updateInterval = setInterval(() => {
            
            const device = deviceRef.current;
            if (device?.state === "Opened") {
                (async () => {
                    console.log(buffer)
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

    }, [])

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
            getValue: i => buffer.readUInt8(i + 1),
            setValue: (i, val) => {
                changedRef.current = true;
                buffer.writeUInt8(val, i + 1);
                console.log(val)
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