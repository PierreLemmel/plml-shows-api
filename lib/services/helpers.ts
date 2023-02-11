import { randomInt } from "crypto";

export function randomRange(min: number, max:number) {
    return min + (max - min) * Math.random();
}

export function randomElement<T>(input: T[]) {
    return input[randomInt(input.length)];
}

export function flattenArray<T>(input: T[][]) {
    return input.reduce((acc, arr) => acc.concat(arr), []);
}