import { Color } from "@/lib/services/core/types/rgbColor";
import { generateId } from "@/lib/services/core/utils";
import { Fixtures, StageLightingPlan } from "@/lib/services/dmx/dmx512";
import { ChannelsInfo, initializeValuesForChannels, extractChannels, Mappings, FixtureModelCollectionInfo } from "@/lib/services/dmx/showControl";

describe('extractChannelsFromFixture', () => {

    test('should extract color, uv, dimmer and strobe channels from a standard Par LED fixture - 6CH', () => {

        const channelsInfo: ChannelsInfo = {
            0: "Color",
            3: "Uv",
        }

        const result = extractChannels(channelsInfo);
        expect(result).toEqual(["Color", "Uv"]);
    });


    test('should extract color, uv, dimmer and strobe channels from a standard Par LED fixture - 6CH', () => {
    
        const channelsInfo: ChannelsInfo = {
            0: "Color",
            3: "Uv",
            4: "Dimmer",
            5: "Stroboscope",
        }

        const result = extractChannels(channelsInfo);
        expect(result).toEqual(["Color", "Uv", "Dimmer", "Stroboscope"]);
    });

    test('Extract trad channel from a trad fixture', () => {
        const channelsInfo: ChannelsInfo = {
            0: "Trad",
        }
        const result = extractChannels(channelsInfo);
        expect(result).toEqual(["Trad"]);
    });
});

describe('initializeValuesForChannels', () => {

    test('should create default values for a standard Par LED fixture', () => {
        const channelsInfo: ChannelsInfo = {
            0: "Color",
            3: "Uv",
            4: "Dimmer",
            5: "Stroboscope",
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
            0: "Trad"
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
                            0: "Warm",
                            1: "Cold",
                        },
                        6: {
                            0: "Dimmer",
                            1: "Warm",
                            2: "Cold",
                            3: "UNUSED",
                            4: "UNUSED",
                            5: "Stroboscope",
                        }
                    }
                },
                "par56Led": {
                    shortName: "par56Led",
                    type: "Par LED",
                    name: "Par 56 LED",
                    modes: {
                        4: {
                            0: "Color",
                            3: "Dimmer",
                        }
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
                            0: "Warm",
                            1: "Cold",
                        },
                        6: {
                            0: "Dimmer",
                            1: "Warm",
                            2: "Cold",
                            3: "UNUSED",
                            4: "UNUSED",
                            5: "Stroboscope",
                        }
                    }
                },
                "par56Led": {
                    shortName: "par56Led",
                    type: "Par LED",
                    name: "Par 56 LED",
                    modes: {
                        4: {
                            0: "Color",
                            3: "Dimmer",
                        }
                    }
                }
            }
        }

        expect(result).toEqual(expected);
    });
})