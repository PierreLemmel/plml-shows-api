import { Named } from "../core/types/utils";
import { Fixtures, StageLightingPlan } from "../dmx/dmx512";
import { Show } from "../dmx/showControl";
import { getDocument, setDocument, toFirebaseKey } from "./firebase";


export async function getShow(name: string) {
    const sanitized = toFirebaseKey(name);
    return await getDocument<Show>(`dmx/shows/public/${sanitized}`)
}

export async function createShow(show: Show) {
    const sanitized = toFirebaseKey(show.name);
    await setDocument<Show>(`dmx/shows/public/${sanitized}`, show);
}

export async function updateShow(show: Partial<Show> & Named) {
    const sanitized = toFirebaseKey(show.name);
    await setDocument<Show>(`dmx/shows/public/${sanitized}`, show);
}


export async function getLightingPlan(plan: string) {
    const sanitized = toFirebaseKey(plan);
    return await getDocument<StageLightingPlan>(`dmx/lighting-plans/public/${sanitized}`)
}

export async function createLightingPlan(plan: StageLightingPlan) {
    const sanitized = toFirebaseKey(plan.name);
    await setDocument<StageLightingPlan>(`dmx/lighting-plans/public/${sanitized}`, plan);
}

export async function updateLightingPlan(plan: Partial<StageLightingPlan> & Named) {
    const sanitized = toFirebaseKey(plan.name);
    await setDocument<StageLightingPlan>(`dmx/lighting-plans/public/${sanitized}`, plan);
}

export async function getFixtureCollection(name: string) {
    const sanitized = toFirebaseKey(name);
    return await getDocument<Fixtures.FixtureModelCollection>(`dmx/fixtures/collections/${sanitized}`);
}

export async function createFixtureCollection(coll: Fixtures.FixtureModelCollection) {
    const sanitized = toFirebaseKey(coll.name);
    await setDocument<Fixtures.FixtureModelCollection>(`dmx/fixtures/collections/${sanitized}`, coll);
}

