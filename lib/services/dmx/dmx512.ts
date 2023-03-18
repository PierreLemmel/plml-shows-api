import { clampByte } from "../mathf";


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

    export function isnumberChannel(chan: ChannelType): chan is NumberChannelType {
        return numberChannelTypes.includes(chan as NumberChannelType);
    }

    export function isColorChannel(chan: ChannelType): chan is ColorChannelType {
        return colorChannelTypes.includes(chan as ColorChannelType);
    }
}



interface Named {
    readonly name: string;
}

export module Fixtures {   

    export type LedFixtureType = "Par LED" | "Barre LED" | "Générique LED" | "Lyre";
    export type TradFixtureType = "Par Trad" | "PC Trad" | "Découpe Trad" | "Générique Trad"

    export type FixtureType = LedFixtureType|TradFixtureType;

    export interface FixtureModeDefinition extends Named {

        readonly chanCount: number;
        readonly channels: {
            readonly [position: number]: Chans.ChannelType;
        }
    }
    
    
    export interface LedFixtureModelDefinition extends Named {
    
        readonly manufacturer?: string;
        readonly type: LedFixtureType;

        readonly modes: FixtureModeDefinition[];
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
    
        readonly fixtureModels: FixtureModelDefinition[];
    }
    

    export interface Fixture extends Named {
    
        readonly address: number;
        readonly model: string;
        readonly mode: number;
        readonly remarks?: string;
    }

    export function getModeReverseMap(mode: FixtureModeDefinition): Map<Chans.ChannelType, number> {

        const chans = mode.channels;

        const result = new Map<Chans.ChannelType, number>(
            Object.keys(chans).map((key) => {
                const position: number = Number.parseInt(key);
                const chanType = chans[position];

                return [chanType, position];
            })
        );

        return result;
    }
}


export interface StageLightingPlan extends Named {

    readonly fixtureCollection: string;
    readonly fixtures: Fixtures.Fixture[];
}