export class RgbColor {
    public r: number;
    public g: number;
    public b: number;

    public constructor(r: number, g: number, b: number) {
        this.r = r;
        this.g = g;
        this.b = b;
    }

    public toRgbString() {
        return `rgb(${this.r}, ${this.g}, ${this.b})`;
    }

    public toGrayLevel(): RgbColor {
        return RgbColor.grayLevel((this.r, this.g, this.b) / 3);
    }

    public redComponent(): RgbColor {
        return new RgbColor(this.r, 0, 0);
    }

    public greenComponent(): RgbColor {
        return new RgbColor(0, this.g, 0);
    }

    public blueComponent(): RgbColor {
        return new RgbColor(0, 0, this.b);
    }

    public static grayLevel(val: number): RgbColor {
        const rgb = Math.round(val);
        return new RgbColor(rgb, rgb, rgb);
    }

    public static white(): RgbColor {
        return new RgbColor(255, 255, 255);
    }

    public static red(): RgbColor {
        return new RgbColor(255, 0, 0);
    }

    public static green(): RgbColor {
        return new RgbColor(0, 255, 0);
    }

    public static blue(): RgbColor {
        return new RgbColor(0, 0, 255);
    }

    public static multiply(val: number, color: RgbColor) {
        const { r, g, b } = color;
        return new RgbColor(val * r, val * g, val * b);
    }
}