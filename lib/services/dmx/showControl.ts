import { createContext, Dispatch, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { getFixtureCollection, getLightingPlan, getShow, createShow, updateShow } from "../api/show-control-api";
import { replaceFirstElement } from "../core/arrays";
import { useEffectAsync, useInterval } from "../core/hooks";
import { Color, RgbColor, RgbNamedColor } from "../core/types/rgbColor";
import { HasId, Named } from "../core/types/utils";
import { doNothing, doNothingAsync, generateId, notImplemented, notImplementedAsync } from "../core/utils";
import { Chans, Fixtures, StageLightingPlan } from "./dmx512";
import { useDmxControl } from "./dmxControl";

export interface Show extends Named, HasId {
    lightingPlan: string;

    scenes: Scene[];
}

export interface Scene extends Named, HasId {
    elements: SceneElement[];
}

export type SceneElementValues = Partial<{
    [chan in Chans.NumberChannelType]: number;
}> & Partial<{
    [chan in Chans.ColorChannelType]: RgbColor|RgbNamedColor;
}>

export type SceneElement = {
    fixture: string;
    values: SceneElementValues;
};

export function extractChannels(channelsInfo: ChannelsInfo): (Chans.NumberChannelType|Chans.ColorChannelType)[] {

    const channels = Object.values(channelsInfo).filter(chan => Chans.isNumberChannel(chan) || Chans.isColorChannel(chan)) as (Chans.NumberChannelType|Chans.ColorChannelType)[];

    return channels;
}

export function initializeValuesForChannels(channelsInfo: ChannelsInfo): SceneElementValues {
    const channels = extractChannels(channelsInfo);

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

export function createScene(name: string): Scene {
    return {
        id: generateId(),
        name,
        elements: []
    }
} 

export interface ShowControler {
    fade: number;
    setFade: Dispatch<number>;
    master: number;
    setMaster: Dispatch<number>;
    blackout: boolean;
    setBlackout: Dispatch<boolean>;

    tracks: ReadonlyMap<TrackId, Track>;

    addTrack: (scene: Scene, options?: CreateTrackOptions) => Track;
    updateTrack: (track: Track|TrackId, options: UpdateTrackOptions) => Track;
    removeTrack: (track: Track|TrackId) => Track|undefined;
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
    mode?: number;
    model: FixtureModelInfo;
    channels: ChannelsInfo;
    key: string;
    order: number;
}

export interface FixtureModelCollectionInfo extends Named, HasId {
    fixtures: {
        [shortName: string]: FixtureModelInfo
    }
}

export function listFixtureModels(fixtureCollection: FixtureModelCollectionInfo): FixtureModelInfo[] {
    const { fixtures } = fixtureCollection;

    const result = Object.values(fixtures);

    return result;
}

export type FixtureModelInfo = TradFixtureModelInfo|LedFixtureModelInfo;

export interface FixtureModelInfoBase extends Named {
    shortName: string;
}

export interface TradFixtureModelInfo extends FixtureModelInfoBase {
    manufacturer?: string;
    type: Fixtures.TradFixtureType;
    power?: number;
}

export interface ChannelsInfo {
    map: {
        [position: number]: Chans.ChannelType;
    }
    totalLength: number;
}

export interface LedFixtureModelInfo extends FixtureModelInfoBase {
    manufacturer?: string;
    type: Fixtures.LedFixtureType;
    modes: {
        [chanCount: number]: ChannelsInfo;
    };
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

export interface ShowInfo extends Named, HasId {
    lightingPlan: LightingPlanInfo;

    scenes: SceneInfo[];
}


export module Mappings {
    export function computeDmxValues(fixtureName: string, values: SceneElementValues, lightingPlan: LightingPlanInfo): number[] {

        const fixture = lightingPlan.fixtures[fixtureName];

        const {
            channels
        } = fixture;

        
        const computedValues = new Array(channels.totalLength).fill(0);

        
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

        return computedValues;
    }
    
    export function computeFixtureInfo(fixture: Fixtures.Fixture, order: number, fixturesCollection: Fixtures.FixtureModelCollection): FixtureInfo {
    
        const {
            id,
            address,
            mode,
            model: modelName,
            name: fullName,
            key
        } = fixture;
    
        const modelDefinition = fixturesCollection.fixtureModels[modelName];
        const modelInfo = computeFixtureModelInfo(modelDefinition);
        const channelInfo = computeFixtureChannelsInfo(modelDefinition, mode);
    
        const fixtureInfo: FixtureInfo = {
            id,
            name: fullName,
            fullName,
            address,
            mode,
            model: modelInfo,
            channels: channelInfo,
            order,
            key
        }
    
        return fixtureInfo;
    }
    
    export function computeFixtureModelInfo(modelDefinition: Fixtures.FixtureModelDefinition): FixtureModelInfo {
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
                modes,
                ...remainingProps
            } = ledModelDefinition;
    
            const modesInfo: LedFixtureModelInfo["modes"] = {};        
    
            Object.entries(modes).forEach(([chanCountStr, channels]) => {
    
                const chanCount = Number.parseInt(chanCountStr);
                modesInfo[chanCount] = mapToChannelInfo(channels);
            });
    
            modelInfo = {
                modes: modesInfo,
                ...remainingProps
            }
        }
        else {
            throw `Unsupported type: '${type}`;
        }
    
        return modelInfo;
    }

    function mapToChannelInfo(channels: Fixtures.ChannelsDefinition): ChannelsInfo {

        const length = Math.max(
            ...Object.entries(channels).map(([k, v]) => {

                const offset = Number.parseInt(k);
                const l = Chans.getChannelLength(v);

                return l + offset;
            })
        );

        const ci: ChannelsInfo = {
            map: { ...channels },
            totalLength: length
        }

        return ci;
    }

    export function computeFixtureChannelsInfo(modelDefinition: Fixtures.FixtureModelDefinition, mode?: number): ChannelsInfo {
        const { type } = modelDefinition;
    
        if (Fixtures.isTrad(type)) {
            return {
                map: {
                    0: "Trad",
                },
                totalLength: 1
            }
        }
        else if (Fixtures.isLed(type)){
    
            if (!mode) {
                throw "Expected mode for Led fixture"
            }
    
            const ledModelDefinition = modelDefinition as Fixtures.LedFixtureModelDefinition;
    
            const {
                modes,
            } = ledModelDefinition;

            if(!modes[mode]) {
                throw `Mode '${mode}' not found for model '${modelDefinition.name}'`;
            }
    
            return mapToChannelInfo(modes[mode]);
        }
        else {
            throw `Unsupported type: '${type}`;
        }
    }
    
    export function computeLightingPlanInfo(lightingPlan: StageLightingPlan, fixtures: Fixtures.FixtureModelCollection): LightingPlanInfo {
        const fixturesInfo: {
            [shortName: string]: FixtureInfo;
        } = {};
    
        lightingPlan.fixtures.forEach((fixture, i) => {
            const fixtureInfo = computeFixtureInfo(fixture, i, fixtures);
            fixturesInfo[fixture.key] = fixtureInfo;
        });
    
        const result: LightingPlanInfo = {
            fixtures: fixturesInfo
        }
    
        return result;
    }
    
    export function generateSceneInfo(scene: Scene, lightingPlan: LightingPlanInfo): SceneInfo {
        
        const { name, id } = scene;
        const elements: SceneElementInfo[] = scene.elements.map(se => {
    
            const {
                fixture: fixtureName,
                values
            } = se;
    
            const fixture = lightingPlan.fixtures[fixtureName];
            const computedValues = computeDmxValues(fixtureName, values, lightingPlan);
    
            const sei: SceneElementInfo = {
                fixture,
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
    
    export function computeFixtureModelCollectionInfo(fixtureModelCollection: Fixtures.FixtureModelCollection): FixtureModelCollectionInfo {
        
        const {
            name,
            id,
            fixtureModels
        } = fixtureModelCollection;
    
        const fixtures: { [shortName: string]: FixtureModelInfo } = {}
    
        Object.entries(fixtureModels).forEach(([shortName, model]) => {
            fixtures[shortName] = computeFixtureModelInfo(model);
        })
    
        return {
            name,
            id,
            fixtures
        };
    }
}


const isTrack = (track: Track|TrackId): track is Track => {
    return typeof track === "object";
}

export function toScene(sceneInfo: SceneInfo): Scene {
    const { id, name, elements } = sceneInfo;
    
    const result: Scene = {
        id,
        name,
        elements: elements.map(sei => {
            const { fixture, values} = sei;

            const SceneElt: SceneElement = {
                fixture: fixture.name,
                values,
            }

            return SceneElt;
        }),
    }

    return result;
}

export function orderedFixtures(lightingPlan: LightingPlanInfo): FixtureInfo[] {
    const { fixtures } = lightingPlan;

    const result = Object.values(fixtures).sort((a, b) => {
        return a.order - b.order;
    });

    return result;
}

export type CreateTrackOptions = Partial<Omit<Track, "scene"|"id"|"info"|"rawValues">>
export type UpdateTrackOptions = Partial<Omit<Track, "id"|"info"|"rawValues">>

export interface ShowControlProps {
    lightingPlan?: StageLightingPlan;
    show?: Show;
    controler: ShowControler;
    fixtureCollection?: Fixtures.FixtureModelCollection;

    mutations: {
        addScene: (scene: Scene) => Promise<void>,
        saveScene: (scene: Scene) => Promise<void>,
        deleteScene: (scene: Scene) => Promise<void>,
    }

    loadShow: (name: string) => void;
}

export function useNewShowContext(): ShowControlProps {

    const refreshRate = 30;

    const [lastUpdate, setLastUpdate] = useState<number>(0);

    const [showName, setShowName] = useState<string>();

    const [show, setShow] = useState<Show>();
    const [fixtureCollection, setFixtureCollection] = useState<Fixtures.FixtureModelCollection>();
    const [lightingPlan, setLightingPlan] = useState<StageLightingPlan>();

    const tracksRef = useRef<Map<TrackId, Track>>(new Map());

    const dmxControl = useDmxControl();

    const computeRawValues = useCallback<(scene: Scene) => DmxValueSegment[]>((scene: Scene) => {

        if (lightingPlan) {
            const segments = scene.elements.map<DmxValueSegment>(se => {

                const { fixture, values: seValues } = se;

                const { address } = lightingPlan.fixtures[fixture];
                const values = Mappings.computeDmxValues(fixture, seValues, lightingPlan);

                return {
                    address,
                    values
                }
            });
            return segments;
        }
        else {
            return [];
        }
    }, [lightingPlan, fixtureCollection]);


    const addTrack = useCallback((scene: Scene, options?: CreateTrackOptions) => {

        const id = generateId();

        const rawValues: DmxValueSegment[] = computeRawValues(scene);
        
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

        return track;
    }, [computeRawValues])


    const updateTrack = useCallback((track: Track|TrackId, options?: UpdateTrackOptions) => {

        const tracks = tracksRef.current;

        const trackId = isTrack(track) ? track.id : track;
        const result = tracks.get(trackId);

        if (!result) {
            throw new Error(`Track '${trackId}' not found`);
        }

        const newTrack = {
            ...result,
            ...options
        }

        if (options?.scene) {
            newTrack.rawValues = computeRawValues(options.scene);
        }

        tracks.set(trackId, newTrack);

        return newTrack;

    }, [computeRawValues]);

    const removeTrack = useCallback((track: Track|TrackId) => {

        const tracks = tracksRef.current;

        const trackId = isTrack(track) ? track.id : track;
        const result = tracks.get(trackId);

        tracks.delete(trackId);

        return result;
    
    }, []);


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

            tracks,
            addTrack,
            updateTrack,
            removeTrack,
        }
    }, [dmxControl, addTrack, removeTrack ])

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

    }, 1000 / refreshRate, []);

    const lightingPlanName = show?.lightingPlan;

    useEffectAsync(async () => {

        if (showName && lightingPlanName) {
            const show = await getShow(lightingPlanName, showName);
            setShow(show);
        }

    }, [lightingPlanName, showName]);
    
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
        const newScenes = replaceFirstElement(originalScenes, s => s.id === scene.id, scene);
        
        const updatedShow = { 
            ...structuredClone(show),
            scenes: newScenes
        };

        await updateShow(updatedShow);
        setShow(updatedShow);

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
        setShow(updatedShow);

    }, [show]);

    const deleteScene = useCallback(async (scene: Scene) => {

        if (!show) {
            return;
        }

        const scenes = show.scenes.filter(s => s.id !== scene.id);
        
        const updatedShow = { 
            ...show,
            scenes: scenes
        };

        await updateShow(updatedShow);
        setShow(updatedShow);

    }, [show]);

    return {
        show,
        lightingPlan,
        controler,
        fixtureCollection,

        mutations: {
            saveScene,
            addScene,
            deleteScene,
        },

        loadShow: (name: string) => setShowName(name),
    }
}

export const ShowControlContext = createContext<ShowControlProps>({
    loadShow: doNothing,
    mutations: {
        saveScene: doNothingAsync,
        addScene: notImplementedAsync,
        deleteScene: notImplementedAsync,
    },
    controler: {
        fade: 0,
        setFade: doNothing,
        master: 1,
        setMaster: doNothing,
        blackout: false,
        setBlackout: doNothing,
        tracks: new Map(),
        addTrack: notImplemented,
        updateTrack: notImplemented,
        removeTrack: notImplemented,
    }
});

export function useShowContext() {
    return useContext<ShowControlProps>(ShowControlContext);
}

export function useShowInfo(): ShowInfo|null {

    const {
        show,
    } = useShowContext();

    const lpInfo = useLightingPlanInfo();
    const result = useMemo(() => {
        if (show && lpInfo) {

            const { scenes, name, id } = show;
            const sceneInfos = scenes.map(scene => Mappings.generateSceneInfo(scene, lpInfo));

            return {
                name,
                id,
                scenes: sceneInfos,
                lightingPlan: lpInfo,
            }
        }
        else {
            return null;
        }
    }, [show, lpInfo])

    return result;
}

export function useSceneInfo(scene: Scene|undefined): SceneInfo|null {

    const lpInfo = useLightingPlanInfo();

    const result = useMemo(() => {
        if (scene && lpInfo) {
            const info = Mappings.generateSceneInfo(scene, lpInfo);
            return info;
        }
        else {
            return null;
        }
    }, [scene, lpInfo])
    
    return result;
}

export function useLightingPlanInfo(): LightingPlanInfo|null {

    const {
        lightingPlan,
        fixtureCollection
    } = useShowContext();

    if (lightingPlan && fixtureCollection) {
        const info = Mappings.computeLightingPlanInfo(lightingPlan, fixtureCollection);
        return info;
    }
    else {
        return null;
    }
}

export function useFixtureCollectionInfo(): FixtureModelCollectionInfo|null {

    const {
        fixtureCollection,
    } = useShowContext();

    const result = useMemo(() => {
        if (fixtureCollection) {
            const info = Mappings.computeFixtureModelCollectionInfo(fixtureCollection);
            return info;
        }
        else {
            return null;
        }
    }, [fixtureCollection])

    return result;
}

export function useRealtimeScene(scene: Scene|undefined, isPlaying: boolean = true, master: number = 1): Track|null {

    const {
        controler
    } = useShowContext();

    const {
        tracks,
        addTrack,
        removeTrack,
        updateTrack,
    } = controler;
    
    const [track, setTrack] = useState<Track|null>(null);
    const trackRef = useRef<Track>();

    useEffect(() => {
        let newTrack: Track|null = null;
        if (scene) {
            newTrack = addTrack(scene);
            trackRef.current = newTrack;
            setTrack(newTrack);
        }

        return () => {

            const currTrack = trackRef.current;
            if (currTrack) {
                removeTrack(currTrack)
            }
        };
    }, [scene?.id])


    useEffect(() => {

        const currTrack = trackRef.current;
        if (!scene || !currTrack) {
            return;
        }

        updateTrack(currTrack, { scene, enabled: isPlaying, master });

    }, [scene, isPlaying, tracks]);

    
    return track;
}

export function useFixtureInfo(fixture: Fixtures.Fixture|undefined, order: number): FixtureInfo|null {

    const [fi, setFI] = useState<FixtureInfo|null>(null);
    const {
        fixtureCollection
    } = useShowContext();

    useEffect(() => {
        
        if (fixture && fixtureCollection) {
            const newFI = Mappings.computeFixtureInfo(fixture, order, fixtureCollection);
            setFI(newFI)
        }
        else {
            setFI(null);
        }
    }, [fixture, fixtureCollection])

    return fi;
}