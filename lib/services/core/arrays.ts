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


export function arraySwap<T>(array: T[], index1: number, index2: number) {
    const temp = array[index1];
    array[index1] = array[index2];
    array[index2] = temp;
}

export function arrayMove<T>(array: T[], fromIndex: number, toIndex: number) {

    const element = array.splice(fromIndex, 1)[0];
    array.splice(toIndex, 0, element);

    return array;
}

export function toArrayMoved<T>(array: T[], fromIndex: number, toIndex: number) {
    const copy = [...array];
    return arrayMove(copy, fromIndex, toIndex);
}

export function shuffleArray<T>(array: T[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }