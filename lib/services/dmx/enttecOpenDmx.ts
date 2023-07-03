import { useCallback, useEffect, useMemo, useState } from "react";
import { useEffectAsync } from "../core/hooks";
import { delay } from "../core/utils";
import { DmxWriteInterface, DmxWriteInterfaceState } from "./dmx512";


const vendorId = 0x403; //1027
const openDmxProductId = 0x6001; //24577

async function isEnttecOpenDmx(sp: SerialPort): Promise<boolean> {
    const info = await sp.getInfo();
    return info.usbVendorId === vendorId && info.usbProductId === openDmxProductId;
}


export function useEnttecOpenDmx(): DmxWriteInterface {
    
    const refreshRate = 15.0;
    const [port, setPort] = useState<SerialPort>();
    const [state, setState] = useState<DmxWriteInterfaceState>("Undetected");

    const findPort = useCallback(async () => {

        if (port) {
            return;
        }

        const ports = await navigator.serial?.getPorts();
        if (ports) {
            const enttecPort = ports.find(isEnttecOpenDmx);
            if (enttecPort) {

                enttecPort.ondisconnect = () => {
                    
                    setPort(undefined);
                    setState("Undetected");
                }

                setPort(enttecPort);
                setState("Closed");
            }
        }
    }, [port]);

    useEffect(() => {
        const { serial } = navigator;
        
        serial?.addEventListener("connect", findPort)

        return () => serial?.removeEventListener("connect", findPort);
    }, [findPort]);

    useEffectAsync(findPort, []);

    switch (state) {
        case "Closed":
            return {
                state,
                open: async () => {
                    if (!port) {
                        throw "Can't open Enttec Dmx Pro for the moment";
                    }

                    try {
                        const openOptions: OpenPortOptions = {
                            baudRate: 250000,
                            dataBits: 8,
                            stopBits: 2,
                            parity: "none",
                            flowControl: "none"
                        };
    
                        setState("Opening");
    
                        await port.open(openOptions);
    
                        setState("Opened");
                    }
                    catch (e: unknown) {
                        console.warn(e);
                    }
                }
            }
        case "Opened":
            return {
                state,
                refreshRate,
                sendFrame: async (frame: Buffer) => {
                    if (!port) {
                        throw "Can't send frame from Enttec Dmx Pro for the moment";
                    }

                    if (!port.writable || port.writable.locked) {
                        return;
                    }

                    const writer = port.writable.getWriter();
            
                    await port.setSignals({break: true, requestToSend: false});
                    await port.setSignals({break: false, requestToSend: false});
                    await writer.write(frame);
            
                    writer.releaseLock();
                },
                close: async () => {
                    if (!port) {
                        throw "Can't close Enttec Dmx Pro for the moment";
                    }

                    try {
                        setState("Closing");
                        
                        while (port.writable.locked) {
                            await delay(10);
                        }
                        await port.close();
                        
                        setState("Closed");
                    }
                    catch (e: unknown) {
                        console.warn(e);
                    }
                }
            }
        default:
            return { state };
    }
}