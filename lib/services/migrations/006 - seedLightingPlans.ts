import { StageLightingPlan } from "../dmx/dmx512";
import { setDocument } from "../firebase";


export default async function seedLightingPlans() {

    const coll: StageLightingPlan[] = [
        {
            name: "Pierre - Light",
            fixtureCollection: "default",
            fixtures: {
                "parLedRgbJar": {
                    name: "Par LED RGB - Jar",
                    model: "parLedRGBUv",
                    address: 1,
                    mode: 6
                },
                "flatParJar": {
                    name: 'Flat Par LED CW WW - Jar',
                    model: "flatParLED_CW_WW",
                    address: 7,
                    mode: 6
                },
                "flatParCour": {
                    name: 'Flat Par LED CW WW',
                    model: "flatParLED_CW_WW",
                    address: 13,
                    mode: 6
                },
                "parLedRgbCour": {
                    name: "Par LED RGB Cour",
                    model: "parLedRGBUv",
                    address: 1,
                    mode: 19
                }
            }
        },
        {
            name: 'Improvibar',
            fixtureCollection: 'default',
            fixtures: {
                // Pars Jardin / Cour
                "parLedRgbJar": {
                    name: "PAR Led Rgb - Jar",
                    model: "parLedRGBW",
                    mode: 6,
                    address: 11
                },
                "parLedRgbCour": {
                    name: "PAR Led Rgb - Cour",
                    model: "parLedRGBW",
                    mode: 6,
                    address: 17
                },

                // Contres
                "parLedContre1": {
                    name: "PAR Led Rgb - Contre 1",
                    model: "parLedRGBW",
                    mode: 6,
                    address: 41
                },
                "parLedContre2": {
                    name: "PAR Led Rgb - Contre 2",
                    model: "parLedRGBW",
                    mode: 6,
                    address: 35
                },
                "parLedContre3": {
                    name: "PAR Led Rgb - Contre 3",
                    model: "parLedRGBW",
                    mode: 6,
                    address: 29
                },
                "parLedContre4": {
                    name: "PAR Led Rgb - Contre 4",
                    model: "parLedRGBW",
                    mode: 6,
                    address: 23
                },

                "public": {
                    name: "Public",
                    model: "flatParLED_CW_WW_Amber",
                    mode: 4,
                    address: 1
                },

                "lateral": {
                    name: "Lateral",
                    model: "flatParLED_CW_WW_Amber",
                    mode: 4,
                    address: 5
                },

                // Lyres
                "servo1_EagleTone": {
                    name: "Servo 1 - EagleTone",
                    model: "lyre_EagleTone",
                    mode: 20,
                    address: 53
                },
                "servo2_SharkCombi": {
                    name: "Servo 2 - SharkCombi",
                    model: "lyre_SharkCombi",
                    mode: 20,
                    address: 82
                },
            }
        },
        {
            name: 'Studio 27',
            fixtureCollection: 'default',
            fixtures: {
                "public": {
                    name: "Public",
                    model: "lunaParLED80",
                    mode: 4,
                    address: 1
                },
                "faces": {
                    name: "Faces",
                    model: "pc500W",
                    address: 20
                },

                "faceRgbJar": {
                    name: "Face RGB - Jardin",
                    model: "lunaParLED80",
                    mode: 4,
                    address: 40
                },
                "faceRgbCour": {
                    name: "Face RGB - Cour",
                    model: "lunaParLED80",
                    mode: 4,
                    address: 30
                },
                "diagonalRgbJar": {
                    name: "Diagonal RGB - Jardin",
                    model: "lunaParLED80",
                    mode: 4,
                    address: 50
                },
                "diagonalRgbCour": {
                    name: "Face RGB - Cour",
                    model: "lunaParLED80",
                    mode: 4,
                    address: 60
                },

                "ledBarContreJar": {
                    name: "LED Bar Contre - Jardin",
                    model: "adjUb9HLEDBar",
                    mode: 6,
                    address: 100
                },
                "ledBarContreCour": {
                    name: "LED Bar Contre - Cour",
                    model: "adjUb9HLEDBar",
                    mode: 6,
                    address: 120
                },
            }
        }
    ]

    coll.forEach(async plan => {
        await setDocument<StageLightingPlan>(`dmx/lightingPlans/public/${plan.name}`, plan);
    })
}