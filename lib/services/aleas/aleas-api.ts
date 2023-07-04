import { getDocument, setDocument } from "../api/firebase";
import { pathCombine } from "../core/files";
import { AleasShow } from "./aleas-setup";

export async function getAleasShow(show: string): Promise<AleasShow> {

    const path = pathCombine("aleas/shows/public", show)
    const result = await getDocument<AleasShow>(path);

    return result;
}

export async function createAleasShow(show: AleasShow) {
    const path = pathCombine("aleas/shows/public", show.showName)
    await setDocument<AleasShow>(path, show);
}