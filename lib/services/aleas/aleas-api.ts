import { getDocument, setDocument } from "../api/firebase";
import { pathCombine } from "../core/files";
import { AleasCodeFile } from "./misc/aleas-code-display";
import { AleasShowRun } from "./aleas-runtime";
import { AleasShow } from "./aleas-setup";
import { batchGenerateCompletions, CompletionsData } from "../generation/text/text-gen";
import { Timestamp } from "firebase/firestore";

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

async function getMonologuesCompletionsData(collection: string): Promise<CompletionsData> {
    const path = pathCombine("aleas/generation/monologues", collection).toLowerCase();
    const data = await getDocument<CompletionsData>(path);

    return data;
}

export interface MonologuesData {
    generated: Timestamp;
    model: string;
    reviews: string[];
}

export async function batchGenerateMonologues(collection: string) {

    const completionData = await getMonologuesCompletionsData(collection);

    const batchResult = await batchGenerateCompletions(completionData);

	const { generated, data, model } = batchResult;
    const result: MonologuesData = {
        generated,
        reviews: data,
        model
    }

    const pathToResult = pathCombine("aleas/library/monologues", collection).toLowerCase();
    await setDocument<MonologuesData>(pathToResult, result);

    return result;
}