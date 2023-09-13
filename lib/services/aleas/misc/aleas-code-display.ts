export type AleasCodeLanguage = "tsx"|"typescript";

export interface AleasCodeFile {
    path: string;
    language: AleasCodeLanguage;
    code: string;
}