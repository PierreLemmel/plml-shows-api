import { DurationProviderCollectionProps } from "@/lib/aleas/providers/duration";
import { Fixtures } from "../dmx/dmx512";
import { setDocument } from "../firebase";


export default async function seedFixtureDefinitions() {

    const name = "default"

    const coll: Fixtures.FixtureModelCollection = {
        name,
        fixtureModels: [

            //          LEDS

            // RGB Uv
            {
                name: 'Par LED RGBUv',
                type: 'Par LED',
                manufacturer: 'Fun generation',
                modes: [
                    {
                        name: '4CH',
                        chanCount: 4,
                        channels: {
                            [0]: "Color",
                            [3]: "Uv"
                        }
                    },
                    {
                        name: '6CH',
                        chanCount: 6,
                        channels: {
                            [0]: "Color",
                            [3]: "Uv",
                            [4]: "Dimmer",
                            [5]: "Stroboscope"
                        }
                    },
                    {
                        name: '8CH',
                        chanCount: 8,
                        channels: {
                            [0]: "Color",
                            [3]: "Uv",
                            [4]: "Dimmer",
                            [5]: "Stroboscope",
                            [6]: "UNUSED",
                            [7]: "UNUSED",
                        }
                    },
                ]
            },
            // RGBW
            {
                name: 'Par LED RGBW',
                type: 'Par LED',
                manufacturer: 'Fun generation',
                modes: [
                    {
                        name: '4CH',
                        chanCount: 4,
                        channels: {
                            [0]: "Color",
                            [3]: "White"
                        }
                    },
                    {
                        name: '6CH',
                        chanCount: 6,
                        channels: {
                            [0]: "Color",
                            [3]: "White",
                            [4]: "Dimmer",
                            [5]: "Stroboscope"
                        }
                    },
                    {
                        name: '8CH',
                        chanCount: 8,
                        channels: {
                            [0]: "Color",
                            [3]: "White",
                            [4]: "Dimmer",
                            [5]: "Stroboscope",
                            [6]: "UNUSED",
                            [7]: "UNUSED",
                        }
                    },
                ]
            },
            // ADJ UB 9H LED Bar
            {
                name: 'ADJ UB 9H LED Bar',
                type: 'Barre LED',
                manufacturer: 'ADJ',
                modes: [
                    {
                        name: '6CH',
                        chanCount: 6,
                        channels: {
                            [0]: "Color",
                            [3]: "White",
                            [4]: "Amber",
                            [5]: "Uv"
                        }
                    }
                ]
            },
            // Flat Par Led CW WW
            {
                name: 'Flat Par LED CW WW',
                type: 'Par LED',
                modes: [
                    {
                        name: '2CH',
                        chanCount: 2,
                        channels:[
                            "Warm",
                            "Cold",
                        ]
                    },
                    {
                        name: '6CH',
                        chanCount: 6,
                        channels: [
                            "Dimmer",
                            "Warm",
                            "Cold",
                            "UNUSED",
                            "UNUSED",
                            "Stroboscope",
                        ]
                    }
                ]
            },
            // Flat Par CW WW Amber
            {
                name: 'Flat Par CW WW Amber',
                type: 'Par LED',
                modes: [
                    {
                        name: '4CH',
                        chanCount: 4,
                        channels: [
                            "Cold",
                            "Warm",
                            "Amber",
                            "Dimmer",
                        ]
                    }
                ]
            },
            // LED PR-100 32
            {
                name: 'LED PR-100 32',
                type: 'Barre LED',
                modes: [
                    {
                        name: '48CH',
                        chanCount: 48,
                        channels: [
                            {
                                type: "ColorArray",
                                size: 16
                            }
                        ]
                    },
                    {
                        name: '96CH',
                        chanCount: 96,
                        channels: [
                            {
                                type: "ColorArray",
                                size: 16
                            }
                        ]
                    }
                ]
            },
            // Luna Par LED 80
            {
                name: 'Luna Par LED 80',
                type: 'Par LED',
                manufacturer: 'Showtec',
                modes: [
                    {
                        name: '4CH',
                        chanCount: 4,
                        channels: {
                            [0]: "Color",
                            [3]: "White"
                        }
                    }
                ]
            },
            // ORA LED
            {
                name: 'ORA LED',
                type: 'Par LED',
                modes: [
                    {
                        chanCount: 5,
                        name: '5CH',
                        channels: {
                            [0]: "Color",
                            [3]: "Uv",
                            [5]: "Dimmer"
                        }
                    }
                ]
            },
            // Par 56 LED
            {
                name: 'Par 56 LED',
                type: 'Par LED',
                modes: [
                    {
                        chanCount: 4,
                        name: '4CH',
                        channels: {
                            [0]: "Color",
                            [3]: "Dimmer"
                        }
                    }
                ]
            },
            // Générique LED
            {
                name: "Générique LED",
                type: "Générique LED",
                modes: [2, 3, 4, 6, 8, 12, 16].map(count => {
                    return {
                        name: `${count}CH`,
                        chanCount: count,
                        channels: [
                            {
                                type: "ValueArray",
                                size: count
                            }
                        ]
                    }
                })
            },


            //          Trads

            // Decoupe 500W
            {
                name: 'Découpe 500W',
                type: 'Découpe Trad',
                power: 500
            },
            // PC 500W
            {
                name: 'PC 500W',
                type: 'PC Trad',
                power: 500
            },
            // PC 1000W
            {
                name: 'PC 1000W',
                type: 'PC Trad',
                power: 1000
            },
            // Générique Trad
            {
                name: 'Générique trad',
                type: 'Générique Trad'
            },


            //              Lyres

            // Lyre - EagleTone
            {
                name: 'Lyre - EagleTone',
                type: 'Lyre',
                manufacturer: 'EagleTone',
                modes: [
                    {
                        name: '20CH',
                        chanCount: 20,
                        channels: {
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
                ]
            },
            // Lyre - Shark Combi
            {
                name: 'Lyre - Shark Combi',
                type: 'Lyre',
                manufacturer: 'Shark Combi',
                modes: [
                    {
                        name: '20CH',
                        chanCount: 20,
                        channels: {
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
                ]
            },
        ]
    }

    await setDocument("dmx/fixtures", {
        defaultCollection: name
    })
    await setDocument<Fixtures.FixtureModelCollection>(`dmx/fixtures/collections/${name}`, coll);
}