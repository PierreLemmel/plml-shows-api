import { generateId } from "../../core/utils";
import { StageLightingPlan } from "../../dmx/dmx512";
import { createLightingPlan } from "../showControlApi";


export default async function seedLightingPlans() {

    const coll: StageLightingPlan[] = [
        {
            name: "Pierre - Light",
            id: generateId(),
            fixtureCollection: "default",
            fixtures: {
                "parLedRgbJar": {
                    name: "Par LED RGB - Jar",
                    id: generateId(),
                    key: "parLedRgbJar",
                    model: "parLedRGBUv",
                    address: 1,
                    mode: 6
                },
                "flatParJar": {
                    name: 'Flat Par LED CW WW - Jar',
                    id: generateId(),
                    key: "flatParJar",
                    model: "flatParLED_CW_WW",
                    address: 7,
                    mode: 6
                },
                "flatParCour": {
                    name: 'Flat Par LED CW WW',
                    id: generateId(),
                    key: "flatParCour",
                    model: "flatParLED_CW_WW",
                    address: 13,
                    mode: 6
                },
                "parLedRgbCour": {
                    name: "Par LED RGB Cour",
                    id: generateId(),
                    key: "parLedRgbCour",
                    model: "parLedRGBUv",
                    address: 19,
                    mode: 6
                }
            }
        },
        {
            name: 'Improvibar',
            id: generateId(),
            fixtureCollection: 'default',
            fixtures: {
                // Pars Jardin / Cour
                "parLedRgbJar": {
                    name: "PAR Led Rgb - Jar",
                    id: generateId(),
                    key: "parLedRgbJar",
                    model: "parLedRGBW",
                    mode: 6,
                    address: 11
                },
                "parLedRgbCour": {
                    name: "PAR Led Rgb - Cour",
                    id: generateId(),
                    key: "parLedRgbCour",
                    model: "parLedRGBW",
                    mode: 6,
                    address: 17
                },

                // Contres
                "parLedContre1": {
                    name: "PAR Led Rgb - Contre 1",
                    id: generateId(),
                    key: "parLedContre1",
                    model: "parLedRGBW",
                    mode: 6,
                    address: 41
                },
                "parLedContre2": {
                    name: "PAR Led Rgb - Contre 2",
                    id: generateId(),
                    key: "parLedContre2",
                    model: "parLedRGBW",
                    mode: 6,
                    address: 35
                },
                "parLedContre3": {
                    name: "PAR Led Rgb - Contre 3",
                    id: generateId(),
                    key: "parLedContre3",
                    model: "parLedRGBW",
                    mode: 6,
                    address: 29
                },
                "parLedContre4": {
                    name: "PAR Led Rgb - Contre 4",
                    id: generateId(),
                    key: "parLedContre4",
                    model: "parLedRGBW",
                    mode: 6,
                    address: 23
                },

                "public": {
                    name: "Public",
                    id: generateId(),
                    key: "public",
                    model: "flatParLED_CW_WW_Amber",
                    mode: 4,
                    address: 1
                },

                "lateral": {
                    name: "Lateral",
                    id: generateId(),
                    key: "lateral",
                    model: "flatParLED_CW_WW_Amber",
                    mode: 4,
                    address: 5
                },

                // Lyres
                "servo1_EagleTone": {
                    name: "Servo 1 - EagleTone",
                    id: generateId(),
                    key: "servo1_EagleTone",
                    model: "lyre_EagleTone",
                    mode: 20,
                    address: 53
                },
                "servo2_SharkCombi": {
                    name: "Servo 2 - SharkCombi",
                    id: generateId(),
                    key: "servo2_SharkCombi",
                    model: "lyre_SharkCombi",
                    mode: 20,
                    address: 82
                },
            }
        },
        {
            name: 'Studio 27',
            id: generateId(),
            fixtureCollection: 'default',
            fixtures: {
                "public": {
                    name: "Public",
                    id: generateId(),
                    key: "public",
                    model: "lunaParLED80",
                    mode: 4,
                    address: 1
                },
                "faces": {
                    name: "Faces",
                    id: generateId(),
                    key: "faces",
                    model: "pc500W",
                    address: 20
                },

                "faceRgbJar": {
                    name: "Face RGB - Jardin",
                    id: generateId(),
                    key: "faceRgbJar",
                    model: "lunaParLED80",
                    mode: 4,
                    address: 40
                },
                "faceRgbCour": {
                    name: "Face RGB - Cour",
                    id: generateId(),
                    key: "faceRgbCour",
                    model: "lunaParLED80",
                    mode: 4,
                    address: 30
                },
                "diagonalRgbJar": {
                    name: "Diagonal RGB - Jardin",
                    id: generateId(),
                    key: "diagonalRgbJar",
                    model: "lunaParLED80",
                    mode: 4,
                    address: 50
                },
                "diagonalRgbCour": {
                    name: "Face RGB - Cour",
                    id: generateId(),
                    key: "diagonalRgbCour",
                    model: "lunaParLED80",
                    mode: 4,
                    address: 60
                },

                "ledBarContreJar": {
                    name: "LED Bar Contre - Jardin",
                    id: generateId(),
                    key: "ledBarContreJar",
                    model: "adjUb9HLEDBar",
                    mode: 6,
                    address: 100
                },
                "ledBarContreCour": {
                    name: "LED Bar Contre - Cour",
                    id: generateId(),
                    key: "ledBarContreCour",
                    model: "adjUb9HLEDBar",
                    mode: 6,
                    address: 120
                },
            }
        }
    ]

    coll.forEach(createLightingPlan)
}