export interface Named {
    readonly name: string;
}

export interface HasId {
    readonly id: string;
}

export type Action = () => void;
export type AsyncAction = () => Promise<void>;
export type AsyncDipsatch<T> = (elt: T) => Promise<void>;


type Keys<T> = keyof T & (string);


export type Pathes<T, Prefix extends string = ""> = T extends object
    ? {
        [K in Keys<T>]: Pathes<T[K], Prefix extends "" ? `${K}` : `${Prefix}.${K}`|`${Prefix}`>;
    }[Keys<T>]
    : Prefix;

export type ValueAtPath<T, P extends string> = P extends keyof T
    ? T[P]
    : P extends `${infer K}.${infer R}`
    ? K extends keyof T
        ? ValueAtPath<T[K], R>
        : never
    : never;

export interface MinMax {
    min: number, max: number
}