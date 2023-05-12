import { Fixtures } from "../../dmx/dmx512";
import { setDocument } from "../firebase";
import { saveFixtureCollection } from "../showControlApi";


export default async function seedFixtureDefinitions() {

    const name = "default"

    const coll: Fixtures.FixtureModelCollection = {
        name,
        fixtureModels: {

            //          LEDS

            // RGB Uv
            "parLedRGBUv": {
                name: 'Par LED RGBUv',
                type: 'Par LED',
                manufacturer: 'Fun generation',
                modes: {
                    4: {
                        [0]: "Color",
                        [3]: "Uv"
                    },
                    6: {
                        [0]: "Color",
                        [3]: "Uv",
                        [4]: "Dimmer",
                        [5]: "Stroboscope"
                    },
                    8: {
                        [0]: "Color",
                        [3]: "Uv",
                        [4]: "Dimmer",
                        [5]: "Stroboscope",
                        [6]: "UNUSED",
                        [7]: "UNUSED",
                    },
                }
            },
            // RGBW
            "parLedRGBW": {
                name: 'Par LED RGBW',
                type: 'Par LED',
                manufacturer: 'Fun generation',
                modes: {
                    4: {
                        [0]: "Color",
                        [3]: "White"
                    },
                    6: {
                        [0]: "Color",
                        [3]: "White",
                        [4]: "Dimmer",
                        [5]: "Stroboscope"
                    },
                    8: {
                        [0]: "Color",
                        [3]: "White",
                        [4]: "Dimmer",
                        [5]: "Stroboscope",
                        [6]: "UNUSED",
                        [7]: "UNUSED",
                    },
                }
            },
            // ADJ UB 9H LED Bar
            "adjUb9HLEDBar": {
                name: 'ADJ UB 9H LED Bar',
                type: 'Barre LED',
                manufacturer: 'ADJ',
                modes: {
                    6: {
                        [0]: "Color",
                        [3]: "White",
                        [4]: "Amber",
                        [5]: "Uv"
                    }
                }
            },
            // Flat Par Led CW WW
            "flatParLED_CW_WW": {
                name: 'Flat Par LED CW WW',
                type: 'Par LED',
                modes: {
                    2: {
                        [0]: "Warm",
                        [1]: "Cold",
                    },
                    6: {
                        [0]: "Dimmer",
                        [1]: "Warm",
                        [2]: "Cold",
                        [3]: "UNUSED",
                        [4]: "UNUSED",
                        [5]: "Stroboscope",
                    }
                }
            },
            // Flat Par CW WW Amber
            "flatParLED_CW_WW_Amber": {
                name: 'Flat Par CW WW Amber',
                type: 'Par LED',
                modes: {
                    4: {
                        [0]: "Cold",
                        [1]: "Warm",
                        [2]: "Amber",
                        [3]: "Dimmer",
                    }
                }
            },
            // LED PR-100 32
            "LED_PR_100_32": {
                name: 'LED PR-100 32',
                type: 'Barre LED',
                modes: {
                    48: {
                        [0]: {
                            type: "ColorArray",
                            size: 16
                        }
                    },
                    96: {
                        [0]: {
                            type: "ColorArray",
                            size: 16
                        }
                    }
                }
            },
            // Luna Par LED 80
            "lunaParLED80": {
                name: 'Luna Par LED 80',
                type: 'Par LED',
                manufacturer: 'Showtec',
                modes: {
                    4: {
                        [0]: "Color",
                        [3]: "White"
                    }
                }
            },
            // ORA LED
            "oraLED": {
                name: 'ORA LED',
                type: 'Par LED',
                modes: {
                    5: {
                        [0]: "Color",
                        [3]: "Uv",
                        [5]: "Dimmer"
                    }
                }
            },
            // Par 56 LED
            "par56LED": {
                name: 'Par 56 LED',
                type: 'Par LED',
                modes: {
                    4: {
                        [0]: "Color",
                        [3]: "Dimmer"
                    }
                }
            },
            // Générique LED
            "genericLED": {
                name: "Générique LED",
                type: "Générique LED",
                modes: [2, 3, 4, 6, 8, 12, 16].reduce((curr, count) => {
                    return {
                        ...curr,
                        [`${count}CH`]: {
                            chanCount: count,
                            channels: [
                                {
                                    type: "ValueArray",
                                    size: count
                                }
                            ]
                        },
                    }
                }, {})
            },


            //          Trads

            // Decoupe 500W
            "decoupe500W": {
                name: 'Découpe 500W',
                type: 'Découpe Trad',
                power: 500
            },
            // PC 500W
            "pc500W": {
                name: 'PC 500W',
                type: 'PC Trad',
                power: 500
            },
            // PC 1000W
            "pc1000W": {
                name: 'PC 1000W',
                type: 'PC Trad',
                power: 1000
            },
            // Générique Trad
            "genericTrad": {
                name: 'Générique trad',
                type: 'Générique Trad'
            },


            //              Lyres

            // Lyre - EagleTone
            "lyre_EagleTone": {
                name: 'Lyre - EagleTone',
                type: 'Lyre',
                manufacturer: 'EagleTone',
                modes: {
                    20: {
                        [0]: "Pan",
                        [1]: "Pan Fine",
                        [2]: "Tilt",
                        [3]: "Tilt Fine",
                        [5]: "Stroboscope",
                        [6]: "Color",
                        [9]: "Cold",
                        [10]: "Warm",
                    }
                }
            },
            // Lyre - Shark Combi
            "lyre_SharkCombi": {
                name: 'Lyre - Shark Combi',
                type: 'Lyre',
                manufacturer: 'Shark Combi',
                modes: {
                    20: {
                        [0]: "Pan",
                        [1]: "Pan Fine",
                        [2]: "Tilt",
                        [3]: "Tilt Fine",
                        [5]: "Dimmer",
                        [6]: "Stroboscope",
                        [7]: "Color",
                        [10]: "White",
                    }
                }
            },
        }
    }

    await setDocument("dmx/fixtures", {
        defaultCollection: name
    })
    await saveFixtureCollection(coll);
}