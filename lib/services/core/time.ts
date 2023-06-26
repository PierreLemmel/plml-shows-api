export function formatMinuteSeconds(inputSeconds: number) {

    const minutes = Math.floor(inputSeconds / 60.0);
    const seconds = Math.floor(inputSeconds % 60.0);

    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}