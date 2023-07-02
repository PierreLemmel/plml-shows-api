export interface RgbColor {
    r: number;
    g: number;
    b: number;
}

const rgb = (r: number, g: number, b: number) => ({ r, g, b})

const staticColors = {

    get white(): RgbColor {
        return rgb(255, 255, 255);
    },

    get red(): RgbColor {
        return rgb(255, 0, 0);
    },

    get green(): RgbColor {
        return rgb(0, 255, 0);
    },

    get blue(): RgbColor {
        return rgb(0, 0, 255);
    },

    get black(): RgbColor {
        return rgb(0, 0, 0);
    },
}

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
    }
} as const;

export type RgbNamedColor = keyof typeof staticColors;