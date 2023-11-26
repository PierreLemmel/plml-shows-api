import { randomRange } from "./utils";

export const createArray = <T>(length: number, val: T|((i: number) => T))  => {

    if(typeof val === "function") {
        const predicate = <(i: number) => T> val;
        return new Array(length).fill(undefined).map(predicate)
    }
    else {
        return new Array<T>(length).fill(val)
    }

}

export function flattenArray<T>(input: T[][]) {
    return input.reduce((acc, arr) => acc.concat(arr), []);
}

export function replaceFirstElement<T>(input: T[], predicate: ((elt: T) => boolean), elt: T): T[] {
    const index = input.findIndex(predicate);

    if (index !== -1) {
        const newArray = [...input];
        newArray[index] = elt;
        return newArray;
    }

    return input;
}

export function sorted<T>(input: T[], predicate: (elt: T) => number): T[] {
    const copy = [...input];
    return copy.sort((a, b) => predicate(a) - predicate(b));
}

export function excludeIndex<T>(array: T[],  index: number) {
    return array.filter((_, i) => i !== index);
}

export function insertAt<T>(input: T[], index: number, elt: T) {
    return [
        ...input.slice(0, index),
        elt,
        ...input.slice(index)
    ];
}