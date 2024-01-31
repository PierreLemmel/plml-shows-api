import { Color } from "@/lib/services/core/types/rgbColor";
import { generateId } from "@/lib/services/core/utils";
import { Fixtures, StageLightingPlan } from "@/lib/services/dmx/dmx512";
import { ChannelsInfo, initializeValuesForChannels, extractChannels, Mappings, FixtureModelCollectionInfo } from "@/lib/services/dmx/showControl";

describe('extractChannelsFromFixture', () => {

    test('should extract color, uv, dimmer and strobe channels from a standard Par LED fixture - 4CH', () => {

        const channelsInfo: ChannelsInfo = {
            map: {
                0: {
                    type: "Color"
                },
                3: {
                    type: "Uv"
                },
            },
            totalLength: 4
        }

        const result = extractChannels(channelsInfo);
        expect(result).toEqual(["Color", "Uv"]);
    });


    test('should extract color, uv, dimmer and strobe channels from a standard Par LED fixture - 6CH', () => {
    
        const channelsInfo: ChannelsInfo = {
            map: {
                0: {
                	type: "Color"
                },
                3: {
                	type: "Uv"
                },
                4: {
                	type: "Dimmer"
                },
                5: {
                	type: "Stroboscope"
                },
            },
            totalLength: 6
        }

        const result = extractChannels(channelsInfo);
        expect(result).toEqual(["Color", "Uv", "Dimmer", "Stroboscope"]);
    });

    test('Extract trad channel from a trad fixture', () => {
        const channelsInfo: ChannelsInfo = {
            map: {
                0: {
                    type: "Trad"
                },
            },
            totalLength: 1
        }
        const result = extractChannels(channelsInfo);
        expect(result).toEqual(["Trad"]);
    });
});

describe('initializeValuesForChannels', () => {

    test('should create default values for a standard Par LED fixture', () => {
        const channelsInfo: ChannelsInfo = {
            map: {
                0: {
                    type: "Color"
                },
                3: {
                    type: "Uv"
                },
                4: {
                    type: "Dimmer",
                },
                5: {
                    type: "Stroboscope"
                }
            },
            totalLength: 6
        }

        const result = initializeValuesForChannels(channelsInfo);

        expect(result).toEqual({
            "Color": Color.black,
            "Uv": 0,
            "Dimmer": 0,
            "Stroboscope": 0,
        });
    });

    test('should create default values for a trad fixture', () => {
        const fixtureModelInfo: ChannelsInfo = {
            map: {
                0: {
                    type: "Trad"
                }
            },
            totalLength: 1
        };

        const result = initializeValuesForChannels(fixtureModelInfo);

        expect(result).toEqual({
            "Trad": 0,
        });
    });
});

describe('computeFixtureModelCollectionInfo', () => {
    test('should compute FixtureModelCollectionInfo for a standard FixtureModelCollection', () => {
        
        const name = "Test Collection";
        const id = generateId();

        const collection: Fixtures.FixtureModelCollection = {
            name,
            id,
            shortName: "testCollection",
            fixtureModels: {
                "decoupe500W": {
                    name: "Decoupe 500W",
                    type: "Découpe Trad",
                    power: 500,
                    shortName: "decoupe500W"
                },
                "flatParLed_CW_WW": {
                    shortName: "flatParLed_CW_WW",
                    type: "Par LED",
                    name: "Flat Par LED CW/WW",
                    modes: {
                        2: {
                            0: {
                                type: "Warm"
                            },
                            1: {
                                type: "Cold"
                            },
                        },
                        6: {
                            0: {
                                type: "Dimmer"
                            },
                            1: {
                                type: "Warm"
                            },
                            2: {
                                type: "Cold"
                            },
                            3: {
                                type: "UNUSED"
                            },
                            4: {
                                type: "UNUSED"
                            },
                            5: {
                                type: "Stroboscope"
                            },
                        }
                    }
                },
                "par56Led": {
                    shortName: "par56Led",
                    type: "Par LED",
                    name: "Par 56 LED",
                    modes: {
                        4: {
                            0: {
                                type: "Color"
                            },
                            3: {
                                type: "Dimmer"
                            },
                        },
                    }
                }
            }
        };

        const result = Mappings.computeFixtureModelCollectionInfo(collection);

        const expected: FixtureModelCollectionInfo = {
            name,
            id,
            fixtures: {
                "decoupe500W": {
                    name: "Decoupe 500W",
                    type: "Découpe Trad",
                    power: 500,
                    shortName: "decoupe500W",
                },
                "flatParLed_CW_WW": {
                    shortName: "flatParLed_CW_WW",
                    type: "Par LED",
                    name: "Flat Par LED CW/WW",
                    modes: {
                        2: {
                            map: {
                                0: {
                                	type: "Warm"
                                },
                                1: {
                                	type: "Cold"
                                },
                            },
                            totalLength: 2
                        },
                        6: {
                            map: {
                                0: {
                                	type: "Dimmer"
                                },
                                1: {
                                	type: "Warm"
                                },
                                2: {
                                	type: "Cold"
                                },
                                3: {
                                	type: "UNUSED"
                                },
                                4: {
                                	type: "UNUSED"
                                },
                                5: {
                                	type: "Stroboscope"
                                },
                            },
                            totalLength: 6
                        }
                    }
                },
                "par56Led": {
                    shortName: "par56Led",
                    type: "Par LED",
                    name: "Par 56 LED",
                    modes: {
                        4: {
                            map: {
                                0: {
                                    type: "Color"
                                },
                                3: {
                                    type: "Dimmer"
                                },
                            },
                            totalLength: 4
                        }
                    }
                }
            }
        }

        expect(result).toEqual(expected);
    });
})