export function randomInt(min: number, max: number) {
    return Math.floor(randomRange(min, max));
}

export function randomRange(min: number, max:number) {
    return min + (max - min) * Math.random();
}

export function randomElement<T>(input: T[]) {
    return input[randomInt(0, input.length)];
}

export function randomBool() {
    return Math.random() > 0.5;
} 

export function flattenArray<T>(input: T[][]) {
    return input.reduce((acc, arr) => acc.concat(arr), []);
}

export function sequence(count: number, start?: number) {
    const startIndex = start ?? 0;
    return Array(count).fill(0).map((_, i) => startIndex + i);
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

export type ValueProvider<T> = T|(() => T);

export function getValue<T>(provider: ValueProvider<T>): T {
    if (provider instanceof Function) {
        return provider();
    }
    else {
        return provider;
    }
}

export const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const createArray = <T>(length: number, val: T|((i: number) => T))  => {

    if(typeof val === "function") {
        const predicate = <(i: number) => T> val;
        return new Array(length).fill(undefined).map(predicate)
    }
    else {
        return new Array<T>(length).fill(val)
    }

}

export const currentTime = () => new Date().getTime();

export const mergeClasses = (...classes: (string|undefined|false)[]): string => {
    const result = classes.reduce((prev, curr) => {
        if (curr) {
            return prev + " " + curr;
        }
        else {
            return prev;
        }
    }, "");

    return result || ""; 
}

export function generateId(length: number = 8): string {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < length; i++) {
        id += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return id;
}

type MatchMap<T extends string, U> = { [key in T]: U }
type Patterns<T extends string, U> = MatchMap<T, U> | (Partial<MatchMap<T, U>> & { defaultValue: U })

export function match<T extends string, U>(val: T, choices: Patterns<T, U>): U {
    return ("defaultValue" in choices) ? (choices[val] || choices.defaultValue) : choices[val];
}

export function doNothing(...val: any[]) { }

export function returnZero(...val: any[]) {
    return 0;
}

export function notImplemented<T>(): T {
    throw "Not implemented";
}