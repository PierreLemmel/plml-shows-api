import { pathCombine } from "../core/files";
import { Named } from "../core/types/utils";
import { Fixtures, StageLightingPlan } from "../dmx/dmx512";
import { Show } from "../dmx/showControl";
import { deleteDocument, documentExists, getDocument, listDocuments, renameDocumentIfNeeded, setDocument, toFirebaseKey, updateDocument } from "./firebase";


const pathToShow = (lp: string, name: string) => pathCombine(
    "dmx/lighting-plans/public",
    toFirebaseKey(lp),
    "show",
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

export async function deleteShow(lp: string, name: string) {
    const path = pathToShow(lp, name);
    await deleteDocument(path);
}

export async function showExists(lp: string, name: string) {
    const path = pathToShow(lp, name);
    return documentExists(path);
}

export async function renameShowIfNeeded(lp: string, oldName: string, newName: string) {
    const oldPath = pathToShow(lp, oldName);
    const newPath = pathToShow(lp, newName);

    await renameDocumentIfNeeded(oldPath, newPath);
}



const baseLpPath = "dmx/lighting-plans/public";
const pathToLp = (lp: string) => pathCombine(
    baseLpPath,
    toFirebaseKey(lp)
)

export async function lightingPlanExists(plan: string) {
    const path = pathToLp(plan);
    return documentExists(path);
}

export async function getLightingPlan(plan: string) {
    const path = pathToLp(plan);
    return await getDocument<StageLightingPlan>(path)
}

export async function listAllLightingPlans(): Promise<string[]> {
    return await listDocuments(baseLpPath);
}

export async function createLightingPlan(plan: StageLightingPlan) {
    const path = pathToLp(plan.name);
    await setDocument<StageLightingPlan>(path, plan);
}

export async function updateLightingPlan(plan: Partial<StageLightingPlan> & Named) {
    const path = pathToLp(plan.name);
    await updateDocument<StageLightingPlan>(path, plan);
}

export async function listAllShowsInLightingPlan(plan: string): Promise<string[]> {
    const path = pathCombine(
        baseLpPath,
        toFirebaseKey(plan),
        "shows"
    );
    
    return await listDocuments(path);
}

export async function renameLightingPlanIfNeeded(oldName: string, newName: string) {

    const oldPath = pathToLp(oldName);
    const newPath = pathToLp(newName);
    renameDocumentIfNeeded(oldPath, newPath);
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