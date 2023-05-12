import { Fixtures, StageLightingPlan } from "../dmx/dmx512";
import { Show } from "../dmx/showControl";
import { getDocument, setDocument } from "./firebase";

export async function getShow(name: string) {
    return await getDocument<Show>(`dmx/shows/public/${name}`)
}

export async function saveShow(show: Show) {
    await setDocument<Show>(`dmx/shows/public/${show.name}`, show);
}

export async function getLightingPlan(plan: string) {
    return await getDocument<StageLightingPlan>(`dmx/lightingPlans/public/${plan}`)
}

export async function saveLightingPlan(plan: StageLightingPlan) {
    await setDocument<StageLightingPlan>(`dmx/lightingPlans/public/${plan.name}`, plan);
}

export async function getFixtureCollection(name: string) {
    return await getDocument<Fixtures.FixtureModelCollection>(`dmx/fixtures/collections/${name}`);
}

export async function saveFixtureCollection(coll: Fixtures.FixtureModelCollection) {
    await setDocument<Fixtures.FixtureModelCollection>(`dmx/fixtures/collections/${coll.name}`, coll);
}