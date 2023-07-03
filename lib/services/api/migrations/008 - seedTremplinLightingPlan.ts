import { generateId } from "../../core/utils";
import { StageLightingPlan } from "../../dmx/dmx512";
import { createLightingPlan, createShow } from "../showControlApi";


export default async function seedTremplinLightingPlan() {

    const tremplinLP: StageLightingPlan = {
        name: "Tremplin - Baladin",
        id: generateId(),
        fixtureCollection: "default",
        fixtures: {
            "01 - ": {
                name: "01 - ",
                id: generateId(),
                key: "01 - ",
                model: "genericTrad",
                address: 1,
            },
            "02 - ": {
                name: "02 - ",
                id: generateId(),
                key: "02 - ",
                model: "genericTrad",
                address: 1,
            },
            "03 - ": {
                name: "03 - ",
                id: generateId(),
                key: "03 - ",
                model: "genericTrad",
                address: 1,
            },
            "04 - ": {
                name: "04 - ",
                id: generateId(),
                key: "04 - ",
                model: "genericTrad",
                address: 1,
            },
            "05 - ": {
                name: "05 - ",
                id: generateId(),
                key: "05 - ",
                model: "genericTrad",
                address: 1,
            },
            "06 - ": {
                name: "06 - ",
                id: generateId(),
                key: "06 - ",
                model: "genericTrad",
                address: 1,
            },
            "07 - ": {
                name: "07 - ",
                id: generateId(),
                key: "07 - ",
                model: "genericTrad",
                address: 1,
            },
            "08 - ": {
                name: "08 - ",
                id: generateId(),
                key: "08 - ",
                model: "genericTrad",
                address: 1,
            },
            "09 - ": {
                name: "09 - ",
                id: generateId(),
                key: "09 - ",
                model: "genericTrad",
                address: 1,
            },
            "10 - ": {
                name: "10 - ",
                id: generateId(),
                key: "10 - ",
                model: "genericTrad",
                address: 1,
            },
            "11 - ": {
                name: "11 - ",
                id: generateId(),
                key: "11 - ",
                model: "genericTrad",
                address: 1,
            },
            "12 - ": {
                name: "12 - ",
                id: generateId(),
                key: "12 - ",
                model: "genericTrad",
                address: 1,
            },
            "13 - ": {
                name: "13 - ",
                id: generateId(),
                key: "13 - ",
                model: "genericTrad",
                address: 1,
            },
            "14 - ": {
                name: "14 - ",
                id: generateId(),
                key: "14 - ",
                model: "genericTrad",
                address: 1,
            },
            "15 - ": {
                name: "15 - ",
                id: generateId(),
                key: "15 - ",
                model: "genericTrad",
                address: 1,
            },
            "16 - ": {
                name: "16 - ",
                id: generateId(),
                key: "16 - ",
                model: "genericTrad",
                address: 1,
            },
            "17 - ": {
                name: "17 - ",
                id: generateId(),
                key: "17 - ",
                model: "genericTrad",
                address: 1,
            },
            "18 - ": {
                name: "18 - ",
                id: generateId(),
                key: "18 - ",
                model: "genericTrad",
                address: 1,
            },
            "19 - ": {
                name: "19 - ",
                id: generateId(),
                key: "19 - ",
                model: "genericTrad",
                address: 1,
            },
            "20 - ": {
                name: "20 - ",
                id: generateId(),
                key: "20 - ",
                model: "genericTrad",
                address: 1,
            },

            "21 - ": {
                name: "21 - ",
                id: generateId(),
                key: "21 - ",
                model: "genericTrad",
                address: 1,
            },
            "22 - ": {
                name: "22 - ",
                id: generateId(),
                key: "22 - ",
                model: "genericTrad",
                address: 1,
            },
            "23 - ": {
                name: "23 - ",
                id: generateId(),
                key: "23 - ",
                model: "genericTrad",
                address: 1,
            },
            "24 - ": {
                name: "24 - ",
                id: generateId(),
                key: "24 - ",
                model: "genericTrad",
                address: 1,
            },
        }
    };

    await createLightingPlan(tremplinLP);

    const tremplinShow = {
        name: "Tremplin - Baladin",
        id: generateId(),
        lightingPlan: "Pierre - Light",
        scenes: []
    };

    await createShow(tremplinShow);
}