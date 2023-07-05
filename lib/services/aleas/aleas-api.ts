import { getDocument, setDocument } from "../api/firebase";
import { pathCombine } from "../core/files";
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