import { getDocument, setDocument } from "../api/firebase";
import { pathCombine } from "../core/files";
import { AleasCodeFile } from "./aleas-code-display";
import { AleasShowRun } from "./aleas-runtime";
import { AleasShow } from "./aleas-setup";

export async function getAleasShow(show: string): Promise<AleasShow> {

    const path = pathCombine("aleas/shows/public", show).toLowerCase();
    const result = await getDocument<AleasShow>(path);

    return result;
}

export async function createAleasShow(show: AleasShow) {
    const path = pathCombine("aleas/shows/public", show.showName).toLowerCase()
    await setDocument<AleasShow>(path, show);
}

export async function updateAleasShow(show: AleasShow) {
    const path = pathCombine("aleas/shows/public", show.showName).toLowerCase();
    await setDocument<AleasShow>(path, show);
}


export async function createAleasRun(run: AleasShowRun) {
    const path = pathCombine("aleas/runs", run.show.name, run.metadata.created.toDate().toISOString()).toLowerCase();
    await setDocument<AleasShowRun>(path, run);
}

interface CodeDocument {
    files: AleasCodeFile[]
}

export async function getAleasCodeFiles(): Promise<AleasCodeFile[]> {
    const result = await getDocument<CodeDocument>("aleas/code");
    return result.files;
}

export async function createAleasCodeFile(file: AleasCodeFile) {

    const oldFiles = await getAleasCodeFiles();

    const newCodeDoc = {
        files: [...oldFiles, file]
    }
    await setDocument<CodeDocument>("aleas/code", newCodeDoc);
}