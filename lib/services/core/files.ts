import { isEmpty } from "./utils";


export function pathCombine(...parts: string[]) {
    return parts
        .map(part => part.trim())
        .filter(part => !isEmpty(part))
        .join('/')
        .replace(/\/+/g, '/')
        .replace(/^\/+|\/+$/g, '');
}

export function urlCombine(base: string, ...parts: string[]) {
    return pathCombine(base, ...parts);
}