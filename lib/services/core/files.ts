export function pathCombine(...parts: string[]) {
    return parts.join('/').replace(/\/+/g, '/');
}