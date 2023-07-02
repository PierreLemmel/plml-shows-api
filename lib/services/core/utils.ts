import { Pathes, ValueAtPath } from "./types/utils";

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

type CaseList<T extends string, U> = { condition: (elt: T) => boolean, value: U }[]
type CaseListWithDefault<T extends string, U> = { cases: CaseList<T,U>, defaultValue: U }
type MatchMap<T extends string, U> = { [key in T]: U }
type Patterns<T extends string, U> = MatchMap<T, U>
| (Partial<MatchMap<T, U>> & { defaultValue: U })
| CaseList<T, U>
| CaseListWithDefault<T, U>

export function match<T extends string, U>(val: T, choices: Patterns<T, U>): U {
    if (Array.isArray(choices)) {
        const result = choices.find(c => c.condition)?.value;
        if (result !== undefined) {
            return result;
        }
        else {
            throw new Error("No match found");
        }
    }
    else if ("defaultValue" in choices) {
        if ("cases" in choices) {
            return choices.cases.find(c => c.condition)?.value || choices.defaultValue;
        }
        else {
            return choices[val] || choices.defaultValue;
        }
    }
    else {
        return choices[val];
    }
}


export async function doNothingAsync(...val: any[]) { }

export function doNothing(...val: any[]) { }

export function returnZero(...val: any[]) {
    return 0;
}

export function notImplemented<T>(): T {
    throw "Not implemented";
}

export function setValue<T, P extends Pathes<T>>(obj: T, path: P, value: ValueAtPath<T, P>): T {
    
    const result = structuredClone(obj);
    return result;
    // const str = path as string;

    // const parts = str.split(".");
    // const lastPart = parts.pop()!;
    // const lastObj = parts.reduce((prev, curr) => prev[curr], obj);
    // lastObj[lastPart] = value;
}