import { clampByte } from "../core/maths";
import { IntRange, Named } from "../core/types";


export class Color {

    public readonly r: number;
    public readonly g: number;
    public readonly b: number;


    private constructor(r: number, g: number, b: number) {
        this.r = clampByte(r);
        this.g = clampByte(g);
        this.b = clampByte(b);
    }


    public static get red(): Color {
        return Color.rgb(0xff, 0, 0);
    }

    public static get green(): Color {
        return Color.rgb(0, 0xff, 0);
    }

    public static get blue(): Color {
        return Color.rgb(0, 0, 0xff);
    }

    public static get white(): Color {
        return Color.rgb(0xff, 0xff, 0xff);
    }

    public static get black(): Color {
        return Color.rgb(0x00, 0x00, 0x0);
    }

    public static get warmWhite(): Color {
        return Color.rgb(255, 152, 52);
    }

    public static rgb(r: number, g: number, b: number): Color {
        return new Color(r, g, b);
    }

    public static hsl(h: number, s: number, l: number): Color {

        // Stolen from: https://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion

        let r, g, b;

        if(s === 0){
            r = g = b = l; // achromatic
        }else{
            const hue2rgb = function hue2rgb(p: number, q: number, t: number){
                if(t < 0) t += 1;
                if(t > 1) t -= 1;
                if(t < 1/6) return p + (q - p) * 6 * t;
                if(t < 1/2) return q;
                if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            }

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return new Color(
            Math.round(r * 255),
            Math.round(g * 255),
            Math.round(b * 255)
        );
    }

    public static lerp(from: Color, to: Color, a: number): Color {
        const b = 1.0 - a;

        return new Color(
            a * from.r + b * to.r,
            a * from.g + b * to.g,
            a * from.b + b * to.b
        );
    }
}


export module Chans {

    const numberChannelTypes = [
        "Trad",
        "Dimmer",
        "Stroboscope",
        "White",
        "Uv",
        "Cold",
        "Warm",
        "Amber",
        "Pan",
        "Pan Fine",
        "Tilt",
        "Tilt Fine"
    ] as const;
    export type NumberChannelType = typeof numberChannelTypes[number];

    const colorChannelTypes = [
        "Color"
    ] as const;
    export type ColorChannelType = typeof colorChannelTypes[number];

    export type ChannelType = NumberChannelType | ColorChannelType | ColorArray | ValueArray | "UNUSED";

    export interface ColorArray {
        readonly type: "ColorArray";
        readonly size: number;
    }

    export interface ValueArray {
        readonly type: "ValueArray";
        readonly size: number;
    }

    export function isNumberChannel(chan: ChannelType): chan is NumberChannelType {
        return numberChannelTypes.includes(chan as NumberChannelType);
    }

    export function isColorChannel(chan: ChannelType): chan is ColorChannelType {
        return colorChannelTypes.includes(chan as ColorChannelType);
    }
}





export module Fixtures {   

    const ledFixtureTypes = [
        "Par LED",
        "Barre LED",
        "Générique LED",
        "Lyre"
    ] as const;
    export type LedFixtureType = typeof ledFixtureTypes[number];

    const tradFixtureTypes = [
        "Par Trad",
        "PC Trad",
        "Découpe Trad",
        "Générique Trad"
    ] as const;
    export type TradFixtureType = typeof tradFixtureTypes[number];

    export type FixtureType = LedFixtureType|TradFixtureType;

    export const isLed = (type: FixtureType): type is LedFixtureType => {
        return ledFixtureTypes.includes(type as LedFixtureType);
    }

    export const isTrad = (type: FixtureType): type is TradFixtureType => {
        return tradFixtureTypes.includes(type as TradFixtureType);
    }
    
    export interface LedFixtureModelDefinition extends Named {
    
        readonly manufacturer?: string;
        readonly type: LedFixtureType;

        readonly modes: {
            readonly [chanCount: number]: {
                readonly [position: number]: Chans.ChannelType;
            };
        }
    }

    export interface LedFixtureChannelsDefinition {
        readonly [position: number]: Chans.ChannelType;
    }

    export interface TradFixtureModelDefinition extends Named {

        readonly manufacturer?: string;
        readonly type: TradFixtureType;
        readonly power?: number;
    }

    export type FixtureModelDefinition = LedFixtureModelDefinition|TradFixtureModelDefinition;

    export interface ChannelDefinition extends Named {
        readonly type: Chans.ChannelType;
    }
    
    
    export interface FixtureModelCollection extends Named {
    
        readonly fixtureModels: {
            readonly [shortName: string]: FixtureModelDefinition;
        }
    }
    

    export interface Fixture extends Named {
    
        readonly address: number;
        readonly model: string;
        readonly mode?: number;
        readonly remarks?: string;
        readonly key: string;
    }
}


export interface StageLightingPlan extends Named {

    readonly fixtureCollection: string;
    readonly fixtures: {
        [shortName: string]: Fixtures.Fixture;
    }
}

export type DmxWriteInterfaceState = "Undetected"|"Closed"|"Opening"|"Opened"|"Closing"

interface WriteInterfaceBase<T extends DmxWriteInterfaceState> {
    state: T;
}

export interface UndetectedInterface extends WriteInterfaceBase<"Undetected"> { }

export interface ClosedInterface extends WriteInterfaceBase<"Closed"> {
    open(): Promise<void>;
}

export interface OpeningInterface extends WriteInterfaceBase<"Opening"> { }

export interface OpenedInterface extends WriteInterfaceBase<"Opened"> {
    refreshRate: number;
    sendFrame(frame: Buffer): Promise<void>;
    close(): Promise<void>;
}

export interface ClosingInterface extends WriteInterfaceBase<"Closing"> { }

export type DmxWriteInterface = UndetectedInterface|ClosedInterface|OpeningInterface|OpenedInterface|ClosingInterface;

export type WriteInterfaceType = "None"|"EnttecOpenDmx";

export type DmxRange = IntRange<0, 256>;