import exp from "constants";
import { clampByte } from "../core/maths";
import { IntRange } from "../core/types/ranges";
import { HasId, Named } from "../core/types/utils";


export module Chans {

    const numberChannelTypes = [
        "Trad",
        "Dimmer",
        "Stroboscope",
        "White",
        "Uv",
        "Cold",
        "Warm",
        "Amber",
        "Pan",
        "Pan Fine",
        "Tilt",
        "Tilt Fine"
    ] as const;
    export type NumberChannelType = typeof numberChannelTypes[number];

    const colorChannelTypes = [
        "Color"
    ] as const;
    export type ColorChannelType = typeof colorChannelTypes[number];

    const channelTypes = [
        ...numberChannelTypes,
        ...colorChannelTypes,
        "ColorArray",
        "ValueArray",
        "UNUSED"
    ] as const;
    export type ChannelType = typeof channelTypes[number];

    export interface ColorArray {
        readonly type: "ColorArray";
        readonly size: number;
    }

    export interface ValueArray {
        readonly type: "ValueArray";
        readonly size: number;
    }

    export function isChannelType(type: string): type is ChannelType {
        return channelTypes.includes(type as ChannelType);
    }

    export function isNumberChannel(chan: ChannelType): chan is NumberChannelType {
        return numberChannelTypes.includes(chan as NumberChannelType);
    }

    export function isColorChannel(chan: ChannelType): chan is ColorChannelType {
        return colorChannelTypes.includes(chan as ColorChannelType);
    }

    export interface ChannelInfo {
        displayName: string;
        priority: number;
    }

    export const channelInfo: { [type in ChannelType]: ChannelInfo } = {
        "Trad": {
            displayName: "Trad",
            priority: 0
        },

        "Dimmer": {
            displayName: "Dimmer",
            priority: 1
        },
        "Color": {
            displayName: "Couleur",
            priority: 2
        },
        
        "White": {
            displayName: "Blanc",
            priority: 3
        },
        "Uv": {
            displayName: "Uv",
            priority: 4
        },

        "Cold": {
            displayName: "Froid",
            priority: 10
        },
        "Warm": {
            displayName: "Chaud",
            priority: 11
        },
        "Amber": {
            displayName: "Ambre",
            priority: 12
        },

        "Stroboscope": {
            displayName: "Stroboscope",
            priority: 20
        },

        "Pan": {
            displayName: "Pan",
            priority: 40
        },
        "Pan Fine": {
            displayName: "Pan Fin",
            priority: 41
        },
        "Tilt": {
            displayName: "Tilt",
            priority: 42
        },
        "Tilt Fine": {
            displayName: "Tilt Fin",
            priority: 43
        },
        

        "ColorArray": {
            displayName: "Matrice de couleurs",
            priority: 50
        },
        "ValueArray": {
            displayName: "Matrice de valeurs",
            priority: 51
        },


        "UNUSED": {
            displayName: "Non utilisé",
            priority: 1000
        },
    }
}





export module Fixtures {   

    const ledFixtureTypes = [
        "Par LED",
        "Barre LED",
        "Générique LED",
        "Lyre"
    ] as const;
    export type LedFixtureType = typeof ledFixtureTypes[number];

    const tradFixtureTypes = [
        "Par Trad",
        "PC Trad",
        "Découpe Trad",
        "Générique Trad"
    ] as const;
    export type TradFixtureType = typeof tradFixtureTypes[number];

    export type FixtureType = LedFixtureType|TradFixtureType;

    export const isLed = (type: FixtureType): type is LedFixtureType => {
        return ledFixtureTypes.includes(type as LedFixtureType);
    }

    export const isTrad = (type: FixtureType): type is TradFixtureType => {
        return tradFixtureTypes.includes(type as TradFixtureType);
    }
    
    export interface LedFixtureModelDefinition extends Named {
    
        readonly manufacturer?: string;
        readonly type: LedFixtureType;

        readonly modes: {
            readonly [chanCount: number]: {
                readonly [position: number]: Chans.ChannelType;
            };
        }
    }

    export interface LedFixtureChannelsDefinition {
        readonly [position: number]: Chans.ChannelType;
    }

    export interface TradFixtureModelDefinition extends Named {

        readonly manufacturer?: string;
        readonly type: TradFixtureType;
        readonly power?: number;
    }

    export type FixtureModelDefinition = LedFixtureModelDefinition|TradFixtureModelDefinition;

    export interface ChannelDefinition extends Named {
        readonly type: Chans.ChannelType;
    }
    
    
    export interface FixtureModelCollection extends Named, HasId {
    
        readonly fixtureModels: {
            readonly [shortName: string]: FixtureModelDefinition;
        }
    }
    

    export interface Fixture extends Named, HasId {
    
        readonly address: number;
        readonly model: string;
        readonly mode?: number;
        readonly remarks?: string;
        readonly order?: number;
        readonly key: string;
    }
}


export interface StageLightingPlan extends Named, HasId {

    readonly fixtureCollection: string;
    readonly fixtures: {
        [shortName: string]: Fixtures.Fixture;
    }
}

export type DmxWriteInterfaceState = "Undetected"|"Closed"|"Opening"|"Opened"|"Closing"

interface WriteInterfaceBase<T extends DmxWriteInterfaceState> {
    state: T;
}

export interface UndetectedInterface extends WriteInterfaceBase<"Undetected"> { }

export interface ClosedInterface extends WriteInterfaceBase<"Closed"> {
    open(): Promise<void>;
}

export interface OpeningInterface extends WriteInterfaceBase<"Opening"> { }

export interface OpenedInterface extends WriteInterfaceBase<"Opened"> {
    refreshRate: number;
    sendFrame(frame: Buffer): Promise<void>;
    close(): Promise<void>;
}

export interface ClosingInterface extends WriteInterfaceBase<"Closing"> { }

export type DmxWriteInterface = UndetectedInterface|ClosedInterface|OpeningInterface|OpenedInterface|ClosingInterface;

export type WriteInterfaceType = "None"|"EnttecOpenDmx";

export type DmxRange = IntRange<0, 256>