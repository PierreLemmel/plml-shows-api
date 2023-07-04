import { getDocument } from "../api/firebase";
import { pathCombine } from "../core/files";
import { AleasShow } from "./aleas-setup";

export async function getShow(show: string): Promise<AleasShow> {

    const path = pathCombine("aleas/shows/public", show)
    const result = await getDocument<AleasShow>(path);

    return result;
}