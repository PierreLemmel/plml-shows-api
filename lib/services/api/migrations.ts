import { Timestamp } from "firebase/firestore";
import { getDocument, setDocument } from "./firebase";
import addEnabledToCompletions from "./migrations/001 - addEnabledToCompletions";
import seedCompletions from "./migrations/002 - seedCompletions";
import multipleReviewsDataSet from "./migrations/003 - multipleReviewsDataset";
import seedRandomTimerDurations from "./migrations/004 - seedTimerDurations";
import seedFixtureDefinitions from "./migrations/005 - seedFixtureDefinitions";
import seedLightingPlans from "./migrations/006 - seedLightingPlans";
import seedShows from "./migrations/007 - seedShows";
import seedTremplinLightingPlan from "./migrations/008 - seedTremplinLightingPlan";
import seedTremplinAleasShow from "./migrations/009 - seedTremplinAleasShow";


const migrationHandlers: MigrationHandler[] = [
    addEnabledToCompletions,
    seedCompletions,
    multipleReviewsDataSet,
    seedRandomTimerDurations,
    seedFixtureDefinitions,
    seedLightingPlans,
    seedShows,
    seedTremplinLightingPlan,
    seedTremplinAleasShow,
];



const migrationsDocPath = "technical/migrations";

type MigrationHandler = () => Promise<void>;

export type Migrations = {
    migrations: Migration[];
    lastMigration: Timestamp;
}

export type MigrationResult = {
    runMigrations: Migration[];
}

export type Migration = string;

async function runPendingMigrations(): Promise<MigrationResult> {

    const prevMigrations = await getDocument<Migrations>(migrationsDocPath);

    const runMigrations: Migration[] = [];
    const allMigrations = migrationHandlers.map(m =>  m.name);

    for (let i = prevMigrations.migrations.length; i < migrationHandlers.length; i++) {
        const handler = migrationHandlers[i];
        const migrationName = handler.name;

        console.log(`Running migration '${migrationName}'`);
        await handler();
        console.log(`Succesfully run migration '${migrationName}'`);

        runMigrations.push(migrationName)
    }

    const result = {
        migrations: allMigrations,
        lastMigration: Timestamp.now()
    }

    await setDocument<Migrations>(migrationsDocPath, result)

    return {
        runMigrations
    };
}

export default runPendingMigrations;