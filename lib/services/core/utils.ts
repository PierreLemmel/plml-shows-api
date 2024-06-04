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

export const delay = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

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

export interface GenerateIdOptions {
    length: number;
    type: "LettersOnly"|"Alphanumeric";
}

export function generateId(options?: Partial<GenerateIdOptions>): string {

    const {
        length = 8,
        type = "Alphanumeric"
    } = options || {};

    const characters = match(type, {
        "LettersOnly": "abcdefghijklmnopqrstuvwxyz",
        "Alphanumeric": "abcdefghijklmnopqrstuvwxyz0123456789"
    })
    
    let id = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        id += characters.charAt(Math.floor(Math.random() * charactersLength));
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

type FunctionReturnType<F extends (...args: any) => any> = ReturnType<F>;

function isPromise<T extends (...args: any) => any>(fn: T): boolean {
  const returnType = (null as unknown) as FunctionReturnType<T>;
  return returnType.prototype instanceof Promise;
}

export async function doNothingAsync(...val: any[]) { }

export function doNothing(...val: any[]) { }

export function returnZero(...val: any[]) {
    return 0;
}

export function simplyReturn<T>(val: T): (...args: any[]) => T {
    return () => val;
}

export function notImplemented<T>(): T {
    throw new Error("Not implemented");
}

export function notImplementedAsync<T>(): Promise<T> {
    throw new Error("Not implemented");
}

export function withValue<T, P extends Pathes<T>>(obj: T, path: P, value: ValueAtPath<T, P>): T {
    
    const result = structuredClone(obj);

    setValueAtPath(result, path as string, value)

    return result;
}

export type ValuesMap<T> = Partial<{ [P in Pathes<T>]: ValueAtPath<T, P> }>

export function withValues<T>(obj: T, values: ValuesMap<T>): T {

    const result = structuredClone(obj);

    Object.entries(values).forEach(([path, val]) => {
        setValueAtPath(result, path as string, val)
    })

    return result;
}

function setValueAtPath(obj: any, path: string, value: any) {
    const parts = path.split(".");
    const lastPart = parts.pop()!;
    const lastObj: any = parts.reduce((prev: any, curr) => prev[curr], obj)
    lastObj[lastPart] = value;
}

export function mergeConditions<T>(...conditions: ((elt: T) => boolean)[]): (elt: T) => boolean {
    return (elt: T) => conditions.every(c => c(elt));
}

export function incrementId(id: string) {

    const pattern = /([0-9]+)$/;

    const regexMatch = id.match(pattern);

    if (regexMatch) {

        const extract = regexMatch[1];

        const incrementedNumber = (parseInt(extract) + 1).toString();
        const padded = incrementedNumber.padStart(extract.length, "0");

        const modifiedId = id.replace(pattern, padded);

        return modifiedId;
    }
    else {
        return id + "-01"
    }
}

export function isEmpty<T extends { length: number }>(array: T) {
    return array.length === 0;
}

export const stringToKey = (str: string) => str
    .normalize('NFD')
    .toLowerCase()
    .replace(/(\s|_)+/g, "-")
    .replace(/-+/g, "-")
    .replace(/[^a-z0-9-]/g, "");