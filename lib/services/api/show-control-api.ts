import { Fixtures, StageLightingPlan } from "../dmx/dmx512";
import { Show } from "../dmx/showControl";
import { getDocument, setDocument } from "./firebase";


export async function getShow(name: string) {
    return await getDocument<Show>(`dmx/shows/public/${name}`)
}

export async function createShow(show: Show) {
    await setDocument<Show>(`dmx/shows/public/${show.name}`, show);
}

export async function updateShow(show: Partial<Show>) {
    await setDocument<Show>(`dmx/shows/public/${show.name}`, show);
}


export async function getLightingPlan(plan: string) {
    return await getDocument<StageLightingPlan>(`dmx/lightingPlans/public/${plan}`)
}

export async function createLightingPlan(plan: StageLightingPlan) {
    await setDocument<StageLightingPlan>(`dmx/lightingPlans/public/${plan.name}`, plan);
}


export async function getFixtureCollection(name: string) {
    return await getDocument<Fixtures.FixtureModelCollection>(`dmx/fixtures/collections/${name}`);
}

export async function createFixtureCollection(coll: Fixtures.FixtureModelCollection) {
    await setDocument<Fixtures.FixtureModelCollection>(`dmx/fixtures/collections/${coll.name}`, coll);
}

