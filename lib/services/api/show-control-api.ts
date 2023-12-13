import { pathCombine } from "../core/files";
import { Named } from "../core/types/utils";
import { Fixtures, StageLightingPlan } from "../dmx/dmx512";
import { Show } from "../dmx/showControl";
import { getDocument, listDocuments, setDocument, toFirebaseKey, updateDocument } from "./firebase";


const pathToShow = (lp: string, name: string) => pathCombine(
    "dmx/shows/public",
    toFirebaseKey(lp),
    toFirebaseKey(name)
);

export async function getShow(lp: string, name: string) {
    const path = pathToShow(lp, name);
    return await getDocument<Show>(path)
}

export async function createShow(show: Show) {
    const path = pathToShow(show.lightingPlan, show.name);
    await setDocument<Show>(path, show);
}

export async function updateShow(show: Partial<Show> & Named & { lightingPlan: string }) {
    const path = pathToShow(show.lightingPlan, show.name);
    await setDocument<Show>(path, show);
}


export async function getLightingPlan(plan: string) {
    const sanitized = toFirebaseKey(plan);
    return await getDocument<StageLightingPlan>(`dmx/lighting-plans/public/${sanitized}`)
}

export async function listAllLightingPlans(): Promise<string[]> {
    return await listDocuments(`dmx/lighting-plans/public`);
}

export async function createLightingPlan(plan: StageLightingPlan) {
    const sanitized = toFirebaseKey(plan.name);
    await setDocument<StageLightingPlan>(`dmx/lighting-plans/public/${sanitized}`, plan);
}

export async function updateLightingPlan(plan: Partial<StageLightingPlan> & Named) {
    const sanitized = toFirebaseKey(plan.name);
    
    await updateDocument<StageLightingPlan>(`dmx/lighting-plans/public/${sanitized}`, plan);
}



export async function getFixtureCollection(name: string) {
    const sanitized = toFirebaseKey(name);
    return await getDocument<Fixtures.FixtureModelCollection>(`dmx/fixtures/collections/${sanitized}`);
}

export async function createFixtureCollection(coll: Fixtures.FixtureModelCollection) {
    const sanitized = toFirebaseKey(coll.name);
    await setDocument<Fixtures.FixtureModelCollection>(`dmx/fixtures/collections/${sanitized}`, coll);
}

