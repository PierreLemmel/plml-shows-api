import { generateId } from "../../core/utils";
import { StageLightingPlan } from "../../dmx/dmx512";
import { createLightingPlan, createShow } from "../show-control-api";


export default async function seedTremplinLightingPlan() {

    const tremplinLP: StageLightingPlan = {
        name: "Tremplin - Baladins",
        id: generateId(),
        fixtureCollection: "default",
        fixtures: {
            "01 - ": {
                name: "01 - ",
                order: 1,
                id: generateId(),
                key: "01 - ",
                model: "genericTrad",
                address: 1,
            },
            "02 - ": {
                name: "02 - ",
                order: 2,
                id: generateId(),
                key: "02 - ",
                model: "genericTrad",
                address: 1,
            },
            "03 - ": {
                name: "03 - ",
                order: 3,
                id: generateId(),
                key: "03 - ",
                model: "genericTrad",
                address: 1,
            },
            "04 - ": {
                name: "04 - ",
                order: 4,
                id: generateId(),
                key: "04 - ",
                model: "genericTrad",
                address: 1,
            },
            "05 - ": {
                name: "05 - ",
                order: 5,
                id: generateId(),
                key: "05 - ",
                model: "genericTrad",
                address: 1,
            },
            "06 - ": {
                name: "06 - ",
                order: 6,
                id: generateId(),
                key: "06 - ",
                model: "genericTrad",
                address: 1,
            },
            "07 - ": {
                name: "07 - ",
                order: 7,
                id: generateId(),
                key: "07 - ",
                model: "genericTrad",
                address: 1,
            },
            "08 - ": {
                name: "08 - ",
                order: 8,
                id: generateId(),
                key: "08 - ",
                model: "genericTrad",
                address: 1,
            },
            "09 - ": {
                name: "09 - ",
                order: 9,
                id: generateId(),
                key: "09 - ",
                model: "genericTrad",
                address: 1,
            },
            "10 - ": {
                name: "10 - ",
                order: 10,
                id: generateId(),
                key: "10 - ",
                model: "genericTrad",
                address: 1,
            },
            "11 - ": {
                name: "11 - ",
                order: 11,
                id: generateId(),
                key: "11 - ",
                model: "genericTrad",
                address: 1,
            },
            "12 - ": {
                name: "12 - ",
                order: 12,
                id: generateId(),
                key: "12 - ",
                model: "genericTrad",
                address: 1,
            },
            "13 - ": {
                name: "13 - ",
                order: 13,
                id: generateId(),
                key: "13 - ",
                model: "genericTrad",
                address: 1,
            },
            "14 - ": {
                name: "14 - ",
                order: 14,
                id: generateId(),
                key: "14 - ",
                model: "genericTrad",
                address: 1,
            },
            "15 - ": {
                name: "15 - ",
                order: 15,
                id: generateId(),
                key: "15 - ",
                model: "genericTrad",
                address: 1,
            },
            "16 - ": {
                name: "16 - ",
                order: 16,
                id: generateId(),
                key: "16 - ",
                model: "genericTrad",
                address: 1,
            },
            "17 - ": {
                name: "17 - ",
                order: 17,
                id: generateId(),
                key: "17 - ",
                model: "genericTrad",
                address: 1,
            },
            "18 - ": {
                name: "18 - ",
                order: 18,
                id: generateId(),
                key: "18 - ",
                model: "genericTrad",
                address: 1,
            },
            "19 - ": {
                name: "19 - ",
                order: 19,
                id: generateId(),
                key: "19 - ",
                model: "genericTrad",
                address: 1,
            },
            "20 - ": {
                name: "20 - ",
                order: 20,
                id: generateId(),
                key: "20 - ",
                model: "genericTrad",
                address: 1,
            },

            "21 - ": {
                name: "21 - ",
                order: 21,
                id: generateId(),
                key: "21 - ",
                model: "genericTrad",
                address: 1,
            },
            "22 - ": {
                name: "22 - ",
                order: 22,
                id: generateId(),
                key: "22 - ",
                model: "genericTrad",
                address: 1,
            },
            "23 - ": {
                name: "23 - ",
                order: 23,
                id: generateId(),
                key: "23 - ",
                model: "genericTrad",
                address: 1,
            },
            "24 - ": {
                name: "24 - ",
                order: 24,
                id: generateId(),
                key: "24 - ",
                model: "genericTrad",
                address: 1,
            },
        }
    };

    await createLightingPlan(tremplinLP);

    const tremplinShow = {
        name: "Tremplin - Baladins",
        id: generateId(),
        lightingPlan: "Tremplin - Baladins",
        scenes: []
    };

    await createShow(tremplinShow);
}