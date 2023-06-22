export interface Stats {
    min: number;
    max: number;
    mean: number;
}

export function getStats(values: number[]): Stats {

    if (values.length === 0) {
        throw "Can't do stats on an empty collection"
    }

    let min = Number.MAX_VALUE;
    let max = Number.MIN_VALUE;

    let sum = 0;

    values.forEach(val => {

        min = Math.min(min, val);
        max = Math.max(max, val);

        sum += val;
    })

    const mean = sum / values.length;

    return { min, max, mean }
}

export function mean(...values: number[]): number {

    if (values.length === 0) {
        throw "Can't do stats on an empty collection"
    }

    return values.reduce((prev, curr) => prev + curr, 0) / values.length;
}