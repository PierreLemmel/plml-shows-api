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

    export interface NumberChannelDefinition {
        type: NumberChannelType;
    }

    const colorChannelTypes = [
        "Color"
    ] as const;
    export type ColorChannelType = typeof colorChannelTypes[number];

    export interface ColorChannelDefinition {
        type: ColorChannelType;
    }

    export interface ColorArrayChannelDefinition {
        readonly type: "ColorArray";
        readonly size: number;
    }

    export interface ValueArrayChannelDefinition {
        readonly type: "ValueArray";
        readonly size: number;
    }

    export interface UnusedChannelDefinition {
        readonly type: "UNUSED";
    }

    export type ChannelDefinition = NumberChannelDefinition|ColorChannelDefinition|ColorArrayChannelDefinition|ValueArrayChannelDefinition|UnusedChannelDefinition;
    export const channelTypes = [
        ...numberChannelTypes,
        ...colorChannelTypes,
        "ColorArray",
        "ValueArray",
        "UNUSED"
    ] as const;

    export type ChannelType = typeof channelTypes[number];

    export function isChannelType(type: string): type is ChannelType {
        return channelTypes.includes(type as ChannelType);
    }

    export function isNumberChannel(chan: ChannelDefinition): chan is NumberChannelDefinition {
        return isNumberChannelType(chan.type);
    }

    export function isNumberChannelType(type: ChannelType): type is NumberChannelType {
        return numberChannelTypes.includes(type as NumberChannelType);
    }

    export function isColorChannel(chan: ChannelDefinition): chan is ColorChannelDefinition {
        return isColorChannelType(chan.type);
    }

    export function isColorChannelType(type: ChannelType): type is ColorChannelType {
        return colorChannelTypes.includes(type as ColorChannelType);
    }

    export function isValueArrayChannel(chan: ChannelDefinition): chan is ValueArrayChannelDefinition {
        return isValueArrayChannelType(chan.type);
    }

    export function isValueArrayChannelType(type: ChannelType): type is "ValueArray" {
        return type === "ValueArray";
    }

    export function isColorArrayChannel(chan: ChannelDefinition): chan is ColorArrayChannelDefinition {
        return isColorArrayChannelType(chan.type);
    }

    export function isColorArrayChannelType(type: ChannelType): type is "ColorArray" {
        return type === "ColorArray";
    }
    
    export function isUnusedChannel(chan: ChannelDefinition): chan is UnusedChannelDefinition {
        return isUnusedChannelType(chan.type);
    }

    export function isUnusedChannelType(type: ChannelType): type is "UNUSED" {
        return type === "UNUSED";
    }

    export function getChannelLength(chan: ChannelDefinition): number {
        if (isNumberChannel(chan)) {
            return 1;
        }
        else if (isColorChannel(chan)) {
            return 3;
        }
        else if (isUnusedChannel(chan)) {
            return 1;
        }
        else if (isValueArrayChannel(chan)) {
            return chan.size;
        }
        else if (isColorArrayChannel(chan)) {
            return chan.size * 3;
        }
        else {
            throw new Error(`Unknown channel type ${chan}`);
        }
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
    
    export interface FixtureModelDefinitionBase extends Named {
        shortName: string;
    }

    export interface ChannelsDefinition {
        readonly [position: number]: Chans.ChannelType;
    }

    export interface LedFixtureModelDefinition extends FixtureModelDefinitionBase {
    
        readonly manufacturer?: string;
        readonly type: LedFixtureType;

        readonly modes: {
            readonly [chanCount: number]: ChannelsDefinition;
        }
    }

    export interface LedFixtureChannelsDefinition {
        readonly [position: number]: Chans.ChannelType;
    }

    export interface TradFixtureModelDefinition extends FixtureModelDefinitionBase {

        readonly manufacturer?: string;
        readonly type: TradFixtureType;
        readonly power?: number;
    }

    export type FixtureModelDefinition = LedFixtureModelDefinition|TradFixtureModelDefinition;
    
    
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
        readonly key: string;
    }
}


export interface StageLightingPlan extends Named, HasId {

    readonly fixtureCollection: string;
    readonly fixtures: Fixtures.Fixture[];
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