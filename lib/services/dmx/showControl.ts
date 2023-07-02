import { createContext, Dispatch, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { getFixtureCollection, getLightingPlan, getShow, createShow, updateShow } from "../api/showControlApi";
import { replaceFirstElement } from "../core/arrays";
import { useEffectAsync, useInterval } from "../core/hooks";
import { Color, RgbColor, RgbNamedColor } from "../core/types/rgbColor";
import { HasId, Named } from "../core/types/utils";
import { doNothing, doNothingAsync, generateId, notImplemented } from "../core/utils";
import { Chans, DmxRange, Fixtures, StageLightingPlan } from "./dmx512";
import { useDmxControl } from "./dmxControl";

export interface Show extends Named, HasId {
    lightingPlan: string;

    scenes: Scene[];
}

export interface Scene extends Named, HasId {
    elements: SceneElement[];
}

export type SceneElementValues = Partial<{
    [chan in Chans.NumberChannelType]: DmxRange;
}> & Partial<{
    [chan in Chans.ColorChannelType]: RgbColor|RgbNamedColor;
}>

export type SceneElement = {
    fixture: string;
    values: SceneElementValues;
};

export function extractChannelsFromFixture(model: FixtureModelInfo): (Chans.NumberChannelType|Chans.ColorChannelType)[] {

    if (Fixtures.isLed(model.type)) {
        const ledModel = model as LedFixtureModelInfo;
        const channels = Object.values(ledModel.channels).filter(chan => Chans.isNumberChannel(chan) || Chans.isColorChannel(chan)) as (Chans.NumberChannelType|Chans.ColorChannelType)[];

        return channels;
    }
    else if (Fixtures.isTrad(model.type)) {
        return ["Trad"];
    }
    else {
        throw 'Unknown fixture type';
    }
}

export function createDefaultValuesForFixture(model: FixtureModelInfo): SceneElementValues {
    const channels = extractChannelsFromFixture(model);

    const values: SceneElementValues = {};

    channels.forEach(chan => {
        if (Chans.isNumberChannel(chan)) {
            values[chan] = 0;
        }
        else if (Chans.isColorChannel(chan)) {
            values[chan] = Color.black;
        }
    });

    return values;
}

export interface ShowControler {
    fade: number;
    setFade: Dispatch<number>;
    master: number;
    setMaster: Dispatch<number>;
    blackout: boolean;
    setBlackout: Dispatch<boolean>;

    tracks: ReadonlyMap<TrackId, Track>;
    currentTrack: Track|null;

    addTrack: (scene: Scene, options?: CreateTrackOptions) => Track;
    removeTrack: (track: Track|TrackId) => Track|undefined;

    commitValues: () => void;
}

export type TrackId = string;

export interface Track extends Named {
    id: TrackId;
    scene: Scene;
    enabled: boolean;
    master: number;
    rawValues: DmxValueSegment[]
}

export interface DmxValueSegment {
    address: number;
    values: number[];
}

export interface SceneInfo extends Named, HasId {
    elements: SceneElementInfo[];
}

export interface FixtureInfo extends Named, HasId {
    fullName: string;
    address: number;
    model: FixtureModelInfo;
}

export type FixtureModelInfo = TradFixtureModelInfo|LedFixtureModelInfo;

export interface TradFixtureModelInfo {
    manufacturer?: string;
    type: Fixtures.TradFixtureType;
    power?: number;
}

export interface LedFixtureModelInfo {
    manufacturer?: string;
    type: Fixtures.LedFixtureType;
    channels: {
        [position: number]: Chans.ChannelType;
    }
}

export interface SceneElementInfo {
    fixture: FixtureInfo;
    rawValues: number[];
    values: SceneElementValues;
}

export interface LightingPlanInfo {
    fixtures: {
        [shortName: string]: FixtureInfo;
    }
}

export function computeDmxValues(fixtureName: string, values: SceneElementValues, lightingPlan: StageLightingPlan, fixtures: Fixtures.FixtureModelCollection): number[] {
    const fixture = lightingPlan.fixtures[fixtureName];
        const {
            mode,
            model: modelName
        } = fixture;

        const modelDefinition = fixtures.fixtureModels[modelName];
        const { type } = modelDefinition;

        let computedValues: number[];
        if (Fixtures.isTrad(type)) {
            const trad = values["Trad"];

            computedValues = [trad ?? 0];
        }
        else if (Fixtures.isLed(type)){
            const ledModelDefinition = modelDefinition as Fixtures.LedFixtureModelDefinition;

            const {
                modes,
            } = ledModelDefinition;

            if (!mode) {
                throw "Mode should be defined for LED fixture"
            }

            computedValues = new Array(mode).fill(0);

            const channels = modes[mode]
            const chanMap = new Map<Chans.ChannelType, number>()

            Object.entries(channels).forEach(([k, v]) => {
                chanMap.set(v, Number.parseInt(k))
            });

            for (const chan in values) {
                const chanType = <Chans.ChannelType>chan;
                const chanAddr = chanMap.get(chanType);

                if (chanAddr === undefined) {
                    continue;
                }

                if (Chans.isNumberChannel(chanType)) {
                    const val = values[chanType]!;
                    computedValues[chanAddr] = val;
                }
                else if (Chans.isColorChannel(chanType)) {
                    
                    const val = values[chanType]!;

                    const color = typeof val === 'string' ? Color.named(val) : val;
                    const { r, g, b } = color;

                    computedValues[chanAddr] = r;
                    computedValues[chanAddr + 1] = g;
                    computedValues[chanAddr + 2] = b;
                }
                else {
                    throw `Unsupported channel type: '${chan}'`;
                }
            }
        }
        else {
            throw `Unsupported type: '${type}`;
        }

        return computedValues;
}

export function computeFixtureInfo(fixtureName: string, lightingPlan: StageLightingPlan, fixtures: Fixtures.FixtureModelCollection): FixtureInfo {

    const fixture = lightingPlan.fixtures[fixtureName];
    const {
        id,
        address,
        mode,
        model: modelName,
        name: fullName
    } = fixture;

    const modelDefinition = fixtures.fixtureModels[modelName];
    const { type } = modelDefinition;

    let modelInfo: FixtureModelInfo;

    if (Fixtures.isTrad(type)) {
        modelInfo = {
            ...(modelDefinition as Fixtures.TradFixtureModelDefinition)
        }
    }
    else if (Fixtures.isLed(type)){
        const ledModelDefinition = modelDefinition as Fixtures.LedFixtureModelDefinition;

        const {
            manufacturer,
            modes,
        } = ledModelDefinition;

        if (!mode) {
            throw "Mode should be defined for LED fixture"
        }

        const channels = modes[mode]

        modelInfo = {
            type,
            manufacturer,
            channels
        }
    }
    else {
        throw `Unsupported type: '${type}`;
    }


    const fixtureInfo: FixtureInfo = {
        id,
        name: fixtureName,
        fullName,
        address,
        model: modelInfo,
    }

    return fixtureInfo;
}

export function computeLightingPlanInfo(lightingPlan: StageLightingPlan, fixtures: Fixtures.FixtureModelCollection): LightingPlanInfo {
    const fixturesInfo: {
        [shortName: string]: FixtureInfo;
    } = {};

    Object.entries(lightingPlan.fixtures).forEach(([k, v]) => {
        const fixtureInfo = computeFixtureInfo(k, lightingPlan, fixtures);
        fixturesInfo[k] = fixtureInfo;
    });

    const result: LightingPlanInfo = {
        fixtures: fixturesInfo
    }

    return result;
}

export function generateSceneInfo(scene: Scene, lightingPlan: StageLightingPlan, fixtures: Fixtures.FixtureModelCollection): SceneInfo {
    
    const { name, id } = scene;
    const elements: SceneElementInfo[] = scene.elements.map(se => {

        const {
            fixture: fixtureName,
            values
        } = se;


        const fixtureInfo = computeFixtureInfo(fixtureName, lightingPlan, fixtures);
        const computedValues = computeDmxValues(fixtureName, values, lightingPlan, fixtures);

        const sei: SceneElementInfo = {
            fixture: fixtureInfo,
            values,
            rawValues: computedValues
        }

        return sei;
    });
    
    const result : SceneInfo = {
        id,
        name,
        elements
    }

    return result;
}

const isTrack = (track: Track|TrackId): track is Track => {

    return typeof track === "object";
}

export type CreateTrackOptions = Partial<Omit<Track, "scene"|"id"|"info">>

export type ShowControlMode = "Console"|"Show";

export interface ShowControlProps {
    lightingPlan?: StageLightingPlan;
    show?: Show;
    controler: ShowControler;
    fixtureCollection?: Fixtures.FixtureModelCollection;

    mutations: {
        saveScene: (scene: Scene) => Promise<void>
    }

    mode: ShowControlMode;
    setMode: Dispatch<ShowControlMode>;

    loadShow: (name: string) => void;
}

export function useNewShowControl(): ShowControlProps {

    const refreshRate = 30;

    const [lastUpdate, setLastUpdate] = useState<number>(0);

    const [showName, setShowName] = useState<string>();

    const [show, setShow] = useState<Show>();
    const [fixtureCollection, setFixtureCollection] = useState<Fixtures.FixtureModelCollection>();
    const [lightingPlan, setLightingPlan] = useState<StageLightingPlan>();

    const [mode, setMode] = useState<ShowControlMode>("Console");

    const tracksRef = useRef<Map<TrackId, Track>>(new Map());
    const [currentTrack, setCurrentTrack] = useState<Track|null>(null);

    const dmxControl = useDmxControl();

    const addTrack = useCallback((scene: Scene, options?: CreateTrackOptions) => {

        const id = generateId();

        const rawValues: DmxValueSegment[] = (lightingPlan && fixtureCollection) ? scene.elements.map(se => {

            const { fixture, values: seValues } = se;

            const { address } = lightingPlan.fixtures[fixture];
            const values = computeDmxValues(fixture, seValues, lightingPlan, fixtureCollection);

            return {
                address,
                values
            }
        }) : [];

        const track: Track = {
            id,
            scene,
            name: scene.name,
            enabled: true,
            master: 1,
            rawValues,
            ...options
        }

        tracksRef.current.set(id, track);
        setCurrentTrack(track);

        return track;
    }, [lightingPlan, fixtureCollection])


    const removeTrack = useMemo(() => {
        return (track: Track|TrackId) => {

            const tracks = tracksRef.current;

            const trackId = isTrack(track) ? track.id : track;
            const result = tracks.get(trackId);

            if (currentTrack?.id === trackId) {
                setCurrentTrack(null);
            }

            tracks.delete(trackId);

            return result;
        }
    }, [currentTrack?.id]);

    const commitValues = useMemo(() => {

        if (dmxControl && lightingPlan && fixtureCollection) {

            return () => {

                dmxControl.clear();

                tracksRef.current.forEach(track => {

                    const { scene: { elements }, master, enabled } = track;

                    if (!enabled) {
                        return;
                    }

                    elements.forEach(se => {
                        const { fixture: fixtureName, values } = se;

                        const fixture = lightingPlan.fixtures[fixtureName];
                        
                        const { model, mode } = fixture;

                        const modelDefinition = fixtureCollection.fixtureModels[model];
                        
                    })
                });                
            }
        }
        else {
            return () => {}
        }
        

    }, [dmxControl, lightingPlan, fixtureCollection])

    const controler = useMemo<ShowControler>(() => {
        const {
            blackout, setBlackout,
            fade, setFade,
            master, setMaster,
        } = dmxControl;

        const tracks = tracksRef.current;

        return  {
            blackout, setBlackout,
            fade, setFade,
            master, setMaster,

            commitValues,

            tracks,
            currentTrack,
            addTrack,
            removeTrack,
        }
    }, [dmxControl, currentTrack, addTrack, removeTrack, commitValues ])

    useInterval((props) => {
        const { time } = props;

        dmxControl.cleanTargets();
        const targets = dmxControl.targets;

        tracksRef.current.forEach(track => {
            const { enabled, master, rawValues } = track;
            
            if (!enabled || master <= 0) {
                return;
            }

            rawValues.forEach(segment => {
                const { address, values } = segment;
                
                for (let i=0, addr=address; i < values.length; i++, addr++) {
                    const target = master * values[i];
                    if (target > targets[addr]) {
                        dmxControl.setTarget(addr, target)
                    }
                }
            })
        })

        setLastUpdate(time);

    }, 1000 / refreshRate, [mode], mode === "Show");

    useEffectAsync(async () => {

        if (showName === undefined) {
            return;
        }

        const show = await getShow(showName);
        setShow(show);

    }, [showName]);

    const lightingPlanName = show?.lightingPlan;
    
    useEffectAsync(async () => {

        if (lightingPlanName === undefined) {
            setLightingPlan(undefined);
        }
        else {
            const plan = await getLightingPlan(lightingPlanName);
            setLightingPlan(plan);
        }

    }, [lightingPlanName]);

    const fixtureCollectionName = "default";

    useEffectAsync(async () => {

        if (fixtureCollectionName === undefined) {
            return;
        }

        const fixtureCollection = await getFixtureCollection(fixtureCollectionName);
        setFixtureCollection(fixtureCollection);

    }, [fixtureCollectionName]);


    const saveScene = useCallback(async (scene: Scene) => {

        if (!show) {
            return;
        }

        const originalScenes = [...show.scenes];
        const newScenes = replaceFirstElement(originalScenes, s => s.name === scene.name, scene);
        
        const updatedShow = { 
            ...structuredClone(show),
            scenes: newScenes
        };
        
        await updateShow(updatedShow);

    }, [show]);

    const addScene = useCallback(async (scene: Scene) => {

        if (!show) {
            return;
        }

        const scenes = [...show.scenes, scene];
        
        const updatedShow = { 
            ...show,
            scenes: scenes
        };
        await updateShow(updatedShow);

    }, [show]);

    return {
        show,
        lightingPlan,
        controler,
        fixtureCollection,

        mutations: {
            saveScene
        },

        mode,
        setMode,

        loadShow: (name: string) => setShowName(name),
    }
}

export const ShowControlContext = createContext<ShowControlProps>({
    loadShow: doNothing,
    mode: "Show",
    setMode: doNothing,
    mutations: {
        saveScene: doNothingAsync,
    },
    controler: {
        fade: 0,
        setFade: doNothing,
        master: 1,
        setMaster: doNothing,
        blackout: false,
        setBlackout: doNothing,
        tracks: new Map(),
        currentTrack: null,
        addTrack: notImplemented,
        removeTrack: notImplemented,
        commitValues: notImplemented
    }
});

export function useShowControl() {
    return useContext<ShowControlProps>(ShowControlContext);
}

export function useSceneInfo(scene: Scene|undefined): SceneInfo|null {

    const {
        lightingPlan,
        fixtureCollection
    } = useShowControl();

    if (scene && lightingPlan && fixtureCollection) {
        const info = generateSceneInfo(scene, lightingPlan, fixtureCollection);
        return info;
    }
    else {
        return null;
    }
}

export function useLightingPlanInfo(): LightingPlanInfo|null {

    const {
        lightingPlan,
        fixtureCollection
    } = useShowControl();

    if (lightingPlan && fixtureCollection) {
        const info = computeLightingPlanInfo(lightingPlan, fixtureCollection);
        return info;
    }
    else {
        return null;
    }
}