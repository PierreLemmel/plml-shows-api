export interface RgbColor {
    readonly r: number;
    readonly g: number;
    readonly b: number;
}

const rgb = (r: number, g: number, b: number): RgbColor => ({ r, g, b})

export interface HsvColor {
    /** Hue in range [0-1] */
    readonly h: number;

    /** Saturation in range [0-1] */
    readonly s: number;

    /** Value in range [0-1] */
    readonly v: number;
}

const hsv = (h: number, s: number, v: number): HsvColor => ({ h, s, v})

const rgbToHsv = (color: RgbColor): HsvColor => {

    const { r, g, b } = color;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    const delta = (max - min);

    let h = 0;
    let s = 0;
    let v = max / 255.0;

    if (delta !== 0) {
        if (max === r) {
            h = ((g - b) / delta) % 6;
        } else if (max === g) {
            h = (b - r) / delta + 2;
        } else if (max === b) {
            h = (r - g) / delta + 4;
        }
    
        h /= 6.0;
        if (h < 0) {
            h += 1.0;
        }
    
        if (max !== 0) {
            s = delta / max;
        }
    }

    return hsv(h, s, v);
}

const hsvToRgb = (hsv: HsvColor): RgbColor => {
    const h = hsv.h;
    const s = hsv.s;
    const v = hsv.v;
  
    const c = v * s;
    const x = c * (1 - Math.abs(((h / (1.0 / 6.0)) % 2) - 1));
    const m = v - c;
  
    let r = 0;
    let g = 0;
    let b = 0;
  
    if (h >= 0 && h < 1.0 / 6.0) {
        r = c;
        g = x;
    }
    else if (h >= 1.0 / 6.0 && h < 2.0 / 6.0) {
        r = x;
        g = c;
    } 
    else if (h >= 2.0 / 6.0 && h < 3.0 / 6.0) {
        g = c;
        b = x;
    }
    else if (h >= 3.0 / 6.0 && h < 4.0 / 6.0) {
        g = x;
        b = c;
    }
    else if (h >= 4.0 / 6.0 && h < 5.0 / 6.0) {
        r = x;
        b = c;
    }
    else if (h >= 5.0 / 6.0 && h <= 1.0) {
        r = c;
        b = x;
    }
  
    return {
        r: Math.round((r + m) * 255),
        g: Math.round((g + m) * 255),
        b: Math.round((b + m) * 255),
    };
}

const rgbToHex = (color: RgbColor): string => {
    const { r, g, b } = color;
    const hex = (x: number) => {
        const hex = x.toString(16);
        return hex.length === 1 ? `0${hex}` : hex;
    };
    return `#${hex(r)}${hex(g)}${hex(b)}`;
}

const hexToRgb = (hex: string): RgbColor => {
    const match = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);

    if (!match) {
        throw new Error(`"${hex}" is not a valid HEX color`);
    }

    const [, r, g, b] = match;

    return rgb(parseInt(r, 16), parseInt(g, 16), parseInt(b, 16));
}

const staticColors = {
    white:  rgb(255, 255, 255),
    red: rgb(255, 0, 0),
    green: rgb(0, 255, 0),
    blue:  rgb(0, 0, 255),
    black: rgb(0, 0, 0),
} as const;

export const Color = {
    rgb,
    hsv,
    rgbToHsv,
    hsvToRgb,
    rgbToHex,
    hexToRgb,
    ...staticColors,


    toRgbString(color: RgbColor): string {
        const { r, g, b } = color;
        return `rgb(${r}, ${g}, ${b})`;
    },

    grayLevel(val: number): RgbColor {
        const rounded = Math.round(val);
        return rgb(rounded, rounded, rounded);
    },

    multiply(val: number, color: RgbColor) {
        const { r, g, b } = color;

        return rgb(val * r, val * g, val * b);
    },

    named(name: RgbNamedColor): RgbColor {
        return staticColors[name];
    },

    getColorValue(color: RgbColor|RgbNamedColor) {
        return typeof color === "string" ? staticColors[color] : color;
    }
} as const;

export type RgbNamedColor = keyof typeof staticColors;