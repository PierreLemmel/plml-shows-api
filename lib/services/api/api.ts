export function isDev() {
    return process.env.DEV === "true";
}

export function isValidAdminToken(token: string) {
    return token === process.env.PLML_API_KEY;
}