import { Color } from "@/lib/services/core/types/rgbColor";
import { createDefaultValuesForFixture, extractChannelsFromFixture, LedFixtureModelInfo, TradFixtureModelInfo } from "@/lib/services/dmx/showControl";


describe('extractChannelsFromFixture', () => {

    test('should extract color, uv, dimmer and strobe channels from a standard Par LED fixture', () => {
        const fixtureModelInfo: LedFixtureModelInfo = {
            type: "Par LED",
            channels: {
                0: "Color",
                3: "Uv",
                4: "Dimmer",
                5: "Stroboscope",
            },
        };
        const result = extractChannelsFromFixture(fixtureModelInfo);
        expect(result).toEqual(["Color", "Uv", "Dimmer", "Stroboscope"]);
    });

    test('Extract trad channel from a trad fixture', () => {
        const fixtureModelInfo: TradFixtureModelInfo = {
            type: "Par Trad",
        };
        const result = extractChannelsFromFixture(fixtureModelInfo);
        expect(result).toEqual(["Trad"]);
    });
});

describe('createDefaultValuesForFixture', () => {

    test('should create default values for a standard Par LED fixture', () => {
        const fixtureModelInfo: LedFixtureModelInfo = {
            type: "Par LED",
            channels: {
                0: "Color",
                3: "Uv",
                4: "Dimmer",
                5: "Stroboscope",
            },
        };

        const result = createDefaultValuesForFixture(fixtureModelInfo);

        expect(result).toEqual({
            "Color": Color.black,
            "Uv": 0,
            "Dimmer": 0,
            "Stroboscope": 0,
        });
    });

    test('should create default values for a trad fixture', () => {
        const fixtureModelInfo: TradFixtureModelInfo = {
            type: "Par Trad",
        };

        const result = createDefaultValuesForFixture(fixtureModelInfo);

        expect(result).toEqual({
            "Trad": 0,
        });
    });
});