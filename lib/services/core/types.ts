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
}