import { Dispatch } from "react";
import { delay } from "../core/utils";
import { ClosedInterface, DmxWriteInterface, DmxWriteInterfaceState, OpenedInterface, UndetectedInterface } from "./dmx512";


const vendorId = 0x403; //1027
const openDmxProductId = 0x6001; //24577

async function isEnttecOpenDmx(sp: SerialPort): Promise<boolean> {
    const info = await sp.getInfo();
    return info.usbVendorId === vendorId && info.usbProductId === openDmxProductId;
}

declare global {
    interface Window {
        enttecOpenDmx: DmxWriteInterfaceProvider;
    }
}

interface DmxWriteInterfaceProvider {
    state: DmxWriteInterfaceState;
    getInterface: () => DmxWriteInterface;
    onStateChanged?: Dispatch<DmxWriteInterfaceState>;
}

export function setupEnttecOpenDmxIfNeeded() {
    window.enttecOpenDmx ??= createEnttecOpenDmx();
}


function createEnttecOpenDmx(): DmxWriteInterfaceProvider {
    
    const refreshRate = 15.0;
    let port: SerialPort|undefined;


    const enttecOpenDmx: DmxWriteInterfaceProvider = {
        state: "Undetected",
        getInterface: () => createWriteInterfaceAccordingToState(enttecOpenDmx.state),
        onStateChanged: undefined,
    }


    const createWriteInterfaceAccordingToState = (state: DmxWriteInterfaceState): DmxWriteInterface => {
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
        
                            changeState("Opening");
        
                            await port.open(openOptions);
        
                            changeState("Opened");
                        }
                        catch (e: unknown) {
                            console.warn(e);
                        }
                    }
                } satisfies ClosedInterface;
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
                            changeState("Closing");
                            
                            while (port.writable.locked) {
                                await delay(10);
                            }
                            await port.close();
                            
                            changeState("Closed");
                        }
                        catch (e: unknown) {
                            console.warn(e);
                        }
                    }
                } satisfies OpenedInterface;
            default:
                return {
                    state
                };
        }
    }

    const changeState = (newState: DmxWriteInterfaceState) => {
        enttecOpenDmx.state = newState;

        if (enttecOpenDmx.onStateChanged){
            enttecOpenDmx.onStateChanged(newState);
        }
    }


    const setup = () => {

        const findPort = async () => {

            if (port) {
                return;
            }
    
            const ports = await navigator.serial?.getPorts();
            if (ports) {
                const enttecPort = ports.find(isEnttecOpenDmx);
                if (enttecPort) {
    
                    enttecPort.ondisconnect = () => {
                        
                        port = undefined;
                        changeState("Undetected");
                    }
    
                    port = enttecPort;
                    changeState("Closed");
                }
            }
        };

        const { serial } = navigator;
        
        serial?.addEventListener("connect", findPort);

        findPort();
    }
    setup();

    return enttecOpenDmx;
}