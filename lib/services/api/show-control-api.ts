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

    const path = pathCombine(
        "dmx/lighting-plans/public", 
        toFirebaseKey(plan)
    );

    return await getDocument<StageLightingPlan>(path)
}

export async function listAllLightingPlans(): Promise<string[]> {
    return await listDocuments(`dmx/lighting-plans/public`);
}

export async function createLightingPlan(plan: StageLightingPlan) {

    const path = pathCombine(
        "dmx/lighting-plans/public", 
        toFirebaseKey(plan.name)
    );

    await setDocument<StageLightingPlan>(path, plan);
}

export async function updateLightingPlan(plan: Partial<StageLightingPlan> & Named) {

    const path = pathCombine(
        "dmx/lighting-plans/public", 
        toFirebaseKey(plan.name)
    );
    
    await updateDocument<StageLightingPlan>(path, plan);
}

export async function listAllShowsInLightingPlan(plan: string): Promise<string[]> {
    const path = pathCombine(
        "dmx/lighting-plans/public", 
        toFirebaseKey(plan),
        "shows"
    );
    
    return await listDocuments(path);
}



const pathToFixtureCollection = (name: string) => pathCombine(
    "dmx/fixtures/collections",
    toFirebaseKey(name)
);


export async function getFixtureCollection(name: string) {

    const path = pathToFixtureCollection(name);
    return await getDocument<Fixtures.FixtureModelCollection>(path);
}

export async function createFixtureCollection(coll: Fixtures.FixtureModelCollection) {
    const path = pathToFixtureCollection(coll.name);
    await setDocument<Fixtures.FixtureModelCollection>(path, coll);
}

export async function updateFixtureCollection(coll: Partial<Fixtures.FixtureModelCollection> & Named) {

    const path = pathToFixtureCollection(coll.name);
    await updateDocument<Fixtures.FixtureModelCollection>(path, coll);
}