import { isEmpty } from "./utils";

export type PathCombineOptions = {

}

export function pathCombine(...parts: string[]) {
    return parts
        .map(part => part.trim())
        .filter(part => !isEmpty(part))
        .join('/')
        .replace(/\/+/g, '/')
        .replace(/^\/+|\/+$/g, '');
}