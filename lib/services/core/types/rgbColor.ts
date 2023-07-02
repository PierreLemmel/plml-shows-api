export interface RgbColor {
    readonly r: number;
    readonly g: number;
    readonly b: number;
}

const rgb = (r: number, g: number, b: number) => ({ r, g, b})

const staticColors = {
    white:  rgb(255, 255, 255),
    red: rgb(255, 0, 0),
    green: rgb(0, 255, 0),
    blue:  rgb(0, 0, 255),
    black: rgb(0, 0, 0),
} as const;

export const Color = {
    rgb,
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