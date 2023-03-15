export function randomInt(min: number, max: number) {
    return Math.floor(randomRange(min, max));
}

export function randomRange(min: number, max:number) {
    return min + (max - min) * Math.random();
}

export function randomElement<T>(input: T[]) {
    return input[randomInt(0, input.length)];
}

export function flattenArray<T>(input: T[][]) {
    return input.reduce((acc, arr) => acc.concat(arr), []);
}

export function sequence(count: number) {
    return Array(count).fill(0).map((_, i) => i);
}

export function isOneOf<T>(input: T, ...values: T[]): boolean {
    return values.find(elt => elt === input) !== undefined;
}

export function padNumber(n: number, totalLength: number) {
    
    let result = n.toString();

    if (result.length < totalLength) {
        result = "0".repeat(totalLength - result.length) + result;
    }

    return result;
}