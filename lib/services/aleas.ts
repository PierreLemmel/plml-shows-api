import { DurationProviderCollectionProps } from "../aleas/providers/duration";
import { getDocument } from "./firebase";

export async function getRandomTimerDurationProviderCollection(): Promise<DurationProviderCollectionProps> {

    const result = await getDocument<DurationProviderCollectionProps>("aleas/providers/duration/timer-default");

    return result;
}