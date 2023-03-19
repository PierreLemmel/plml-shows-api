import { DmxWriter, DmxWriterState } from "./dmx512";

export class Enttec {
    static vendorId = 0x403; //1027
    static openDmxProductId = 0x6001; //24577

    static async isEnttecOpenDmx(sp: SerialPort): Promise<boolean> {
        const info = await sp.getInfo();
        return info.usbVendorId === Enttec.vendorId && info.usbProductId === Enttec.openDmxProductId;
    }
}

export class OpenDmxDevice {
    
    private readonly _port: SerialPort;
    private readonly _buffer: Buffer;
    

    public constructor(port: SerialPort) {
        this._port = port;
        this._buffer = Buffer.alloc(513);
    }

    public get opened(): boolean {
        return this._state === "Opened"
    }

    private _state: DmxWriterState = "Closed";
    public get state(): DmxWriterState {
        return this._state;
    }
    

    public get canOpen(): boolean {
        return this._state === "Closed";
    }

    public get canClose(): boolean {
        return this._state === "Opened";
    }


    public open = async () => {
        if (!this.canOpen) {
            throw "Can't open Enttec Dmx Pro for the moment"
        }

        const openOptions: OpenPortOptions = {
            baudRate: 250000,
            dataBits: 8,
            stopBits: 2,
            parity: "none",
            flowControl: "none"
        };

        try {
            this._state = "Opening";
            await this._port.open(openOptions);
            this._state = "Opened";
        }
        catch (e: unknown) {
            console.warn(e);
        }
    }


    public close = async () => {

        if (!this.canClose) {
            throw "Can't close Enttec Dmx Pro for the moment"
        }

        try {
            this._state = "Closing";
            await this._port.close();
            this._state = "Closed";
        }
        catch (e: unknown) {
            console.warn(e);
        }
    }


    public write = async (source: Buffer, offset: number) => {
        
        try {
            source.copy(this._buffer, offset);
        }
        catch (e: unknown) {
            console.warn(e);
        }
    }

    
    public sendFrame = async () => {
        if (!this._port.writable || this._port.writable.locked) {
            return;
        }

        const writer = this._port.writable.getWriter();

        await this._port.setSignals({break: true, requestToSend: false});
        await this._port.setSignals({break: false, requestToSend: false});
        await writer.write(this._buffer);

        writer.releaseLock();
    }
}