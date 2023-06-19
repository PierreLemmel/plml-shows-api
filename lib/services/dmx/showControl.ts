import { createContext, Dispatch, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { getFixtureCollection, getLightingPlan, getShow } from "../api/showControlApi";
import { useEffectAsync, useInterval } from "../core/hooks";
import { Named, RgbColor, RgbNamedColor } from "../core/types";
import { doNothing, generateId, notImplemented } from "../core/utils";
import { Chans, Color, DmxRange, Fixtures, StageLightingPlan } from "./dmx512";
import { useDmxControl } from "./dmxControl";

export interface Show extends Named {
    name: string;

    lightingPlan: string;

    scenes: Scene[];
}

export interface Scene extends Named {
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

export interface SceneInfo extends Named {
    elements: SceneElementInfo[];
}

export interface FixtureInfo extends Named {
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

                    const color = typeof val === 'string' ? RgbColor.named(val) : val;
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
        address,
        mode,
        model: modelName
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
        name: fixtureName,
        address,
        model: modelInfo,
    }

    return fixtureInfo;
}

export function generateSceneInfo(scene: Scene, lightingPlan: StageLightingPlan, fixtures: Fixtures.FixtureModelCollection): SceneInfo {
    
    const { name } = scene;
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
    }, [tracksRef.current, lightingPlan, fixtureCollection])


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
    }, [tracksRef.current]);

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
        

    }, [tracksRef.current, dmxControl, lightingPlan, fixtureCollection])

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
    }, [dmxControl])

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


    return {
        show,
        lightingPlan,
        controler,
        fixtureCollection,
        mode,
        setMode,

        loadShow: (name: string) => setShowName(name),
    }
}

export const ShowControlContext = createContext<ShowControlProps>({
    loadShow: doNothing,
    mode: "Show",
    setMode: doNothing,
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