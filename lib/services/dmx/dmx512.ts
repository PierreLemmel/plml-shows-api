

export class Color {

    public readonly r: number;
    public readonly g: number;
    public readonly b: number;


    private constructor(r: number, g: number, b: number) {
        this.r = clampnumber(r);
        this.g = clampnumber(g);
        this.b = clampnumber(b);
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

    public static hsl(h: number01, s: number01, l: number01): Color {

        // Stolen from: https://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion

        let r, g, b;

        if(s === 0){
            r = g = b = l; // achromatic
        }else{
            const hue2rgb = function hue2rgb(p: number01, q: number01, t: number01){
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
        "Tilt"
    ] as const;
    export type numberChannelType = typeof numberChannelTypes[number];

    const colorChannelTypes = [
        "Color"
    ] as const;
    export type ColorChannelType = typeof colorChannelTypes[number];

    export type ChannelType = numberChannelType | ColorChannelType;

    export function isnumberChannel(chan: ChannelType): chan is numberChannelType {
        return numberChannelTypes.includes(chan as numberChannelType);
    }

    export function isColorChannel(chan: ChannelType): chan is ColorChannelType {
        return colorChannelTypes.includes(chan as ColorChannelType);
    }
}




export module Fixtures {

    export interface FixtureModeDefinition extends Model {

        readonly channels: {
            readonly [position: number]: Chans.ChannelType;
        }
    }
    
    
    export interface FixtureModelDefinition extends Model {
    
        readonly manufacturer: string;
        readonly type: string;

        readonly channels: ChannelDefinition[];
        readonly modes: FixtureModeDefinition[];
    }


    export interface ChannelDefinition extends Model {
        readonly type: Chans.ChannelType;
    }
    
    
    export interface FixtureModelCollection extends Model {
    
        readonly fixtureModels: FixtureModelDefinition[];
    }
    

    export interface Fixture extends Model {
    
        readonly address: number;
        readonly model: FixtureModelDefinition;
        readonly chanNumber: number;
        readonly remarks?: string;
    }

    export function extractMode({ model, chanNumber }: Fixture): FixtureModeDefinition {
        return model.modes[chanNumber];
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


export interface StageLightingPlan extends Model {

    readonly fixtures: Fixtures.Fixture[];
}