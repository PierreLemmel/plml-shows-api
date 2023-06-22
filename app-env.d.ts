/// <reference types="react-scripts" />

interface Navigator {
    serial?: Serial;
}

interface Serial extends EventTarget {
    getPorts(): Promise<SerialPort[]>;
    requestPort(): Promise<SerialPort>;

    onconnect: EventHandler;
    ondisconnect: EventHandler;
}

interface SerialPort extends EventTarget {
    open(options: OpenPortOptions): Promise;
    close(): Promise;
    
    getInfo(): Promise<SerialPortInfo>;
    getSignals(): Promise<SerialInoutSignals>;
    setSignals(signals: SerialOutputSignals): Promise<void>;

    readonly readable: ReadableStream;
    readonly writable: WritableStream;

    onconnect: EventHandler;
    ondisconnect: EventHandler;
}

type OpenPortOptions = {
    baudRate: number;
    bufferSize?: number;
    dataBits?: 7 | 8;
    flowControl?: "none" | "hardware";
    parity?: "none" | "even" | "odd";
    stopBits?: 1 | 2;
}

type SerialPortInfo = {
    readonly usbProductId: number;
    readonly usbVendorId: number;
}

type SerialInoutSignals = {
    readonly clearToSend: boolean;
    readonly dataCarrierDetect: boolean;
    readonly dataSetReady: boolean;
    readonly ringIndicator: boolean;
}

type SerialOutputSignals = {
    readonly dataTerminalReady?: boolean;
    readonly requestToSend?: boolean;
    readonly break?: boolean;
}