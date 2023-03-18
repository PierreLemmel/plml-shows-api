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

    private _opened: boolean = false;
    public get opened(): boolean {
        return this._opened;
    }

    public async open(): Promise<void> {

        const openOptions: OpenPortOptions = {
            baudRate: 250000,
            dataBits: 8,
            stopBits: 2,
            parity: "none",
            flowControl: "none"
        };

        try {
            await this._port.open(openOptions);
            this._opened = true;
        }
        catch (e: unknown) {
            console.warn(e);
        }
    }


    public async close(): Promise<void> {

        try {
            await this._port.close();
            this._opened = false;
        }
        catch (e: unknown) {
            console.warn(e);
        }
    }


    public write(source: Buffer, offset: number) {
        
        try {
            source.copy(this._buffer, offset);
        }
        catch (e: unknown) {
            console.warn(e);
        }
    }

    
    public async sendFrame(): Promise<void> {
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