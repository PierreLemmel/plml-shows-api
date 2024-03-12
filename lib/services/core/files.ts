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
    const combinedPath = pathCombine(...parts);
    return `${base.replace(/\/+$/, '')}/${combinedPath}`;
}

export function isBlob(data: Blob|Uint8Array|Buffer): data is Blob {
    return data instanceof Blob;
}

export function ensureExtension(path: string, extension: string) {
    if (!path.endsWith(extension)) {

        if (!extension.startsWith('.')) {
            extension = '.' + extension;
        }
        path += extension;
    }

    return path;
}