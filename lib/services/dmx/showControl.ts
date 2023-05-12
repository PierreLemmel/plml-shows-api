import { DropdownOption } from "@/components/aleas/aleas-dropdown";
import { createContext, Dispatch, useContext, useEffect, useMemo, useRef, useState } from "react";
import { getFixtureCollection, getLightingPlan, getShow } from "../api/showControlApi";
import { useEffectAsync } from "../core/hooks";
import { Named, RgbColor, RgbNamedColor } from "../core/types";
import { generateId } from "../core/utils";
import { Chans, DmxRange, Fixtures, StageLightingPlan } from "./dmx512";
import { useDmxControlContext } from "./dmxControl";

export interface Show extends Named {
    name: string;

    lightingPlan: string;

    scenes: Scene[];
}

export interface Scene extends Named {
    elements: SceneElement[];
}

export type SceneElement = {
    fixture: string;
    values: Partial<{
        [chan in Chans.NumberChannelType]: DmxRange;
    }> & Partial<{
        [chan in Chans.ColorChannelType]: RgbColor|RgbNamedColor;
    }>
};

export interface ShowControler {
    fade: number;
    setFade: Dispatch<number>;
    master: number;
    setMaster: Dispatch<number>;
    blackout: boolean;
    setBlackout: Dispatch<boolean>;

    tracks: ReadonlyMap<TrackId, Track>;

    addTrack: (scene: Scene, options?: CreateTrackOptions) => Track;
    removeTrack: (track: Track|TrackId) => Track|undefined;

    commitValues: () => void;
}

export type TrackId = string;

export interface Track {
    id: TrackId;
    name: string;
    scene: Scene;
    enabled: boolean;
    master: number;
}

const isTrack = (track: Track|TrackId): track is Track => {

    return typeof track === "object";
}

export type CreateTrackOptions = Partial<Omit<Track, "scene"|"id">>

export interface ShowControlProps {
    lightingPlan?: StageLightingPlan;
    show?: Show;
    controler?: ShowControler;

    loadLightingPlan: (plan: string) => void;
    loadShow: (name: string) => void;
}

export function useShowControl(): ShowControlProps {

    const [fixtureCollectionName, setFixtureCollectionName] = useState<string>();
    const [showName, setShowName] = useState<string>();
    const [lightingPlanName, setLightingPlanName] = useState<string>();

    const [show, setShow] = useState<Show>();
    const [fixtureCollection, setFixtureCollection] = useState<Fixtures.FixtureModelCollection>();
    const [lightingPlan, setLightingPlan] = useState<StageLightingPlan>();

    const [controler, setControler] = useState<ShowControler>();

    const dmxControl = useDmxControlContext();
    
    const tracksRef = useRef<Map<TrackId, Track>>(new Map());
    const addTrack = useMemo(() => {
        
        return (scene: Scene, options?: CreateTrackOptions) => {

            const id = generateId();

            const track: Track = {
                id,
                scene,
                ...{
                    name: scene.name,
                    enabled: true,
                    master: 1,
                    ...options
                }
            }

            tracksRef.current.set(id, track);

            return track;
        }
    }, [tracksRef.current])


    const removeTrack = useMemo(() => {
        return (track: Track|TrackId) => {

            const tracks = tracksRef.current;

            const trackId = isTrack(track) ? track.id : track;
            const result = tracks.get(trackId);

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

    useEffect(() => {
        if (dmxControl) {
            const {
                blackout, setBlackout,
                fade, setFade,
                master, setMaster,
            } = dmxControl;
    
            const tracks = tracksRef.current;
            

            const controler: ShowControler = {
                blackout, setBlackout,
                fade, setFade,
                master, setMaster,

                commitValues,

                tracks,
                addTrack,
                removeTrack,
            }

            setControler(controler);
        }
        else {
            setControler(undefined);
        }
    }, [dmxControl])
    

    useEffectAsync(async () => {

        if (showName === undefined) {
            return;
        }

        const show = await getShow(showName);
        setShow(show);

    }, [showName]);

    useEffectAsync(async () => {

        if (lightingPlanName === undefined) {
            return;
        }

        const plan = await getLightingPlan(lightingPlanName);
        setLightingPlan(plan);

    }, [lightingPlanName]);

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

        loadLightingPlan: (name: string) => setLightingPlanName(name),
        loadShow: (name: string) => setShowName(name),
    }
}

export const ShowControlContext = createContext<ShowControlProps|null>(null);

export function useShowControlContext() {
    return useContext<ShowControlProps|null>(ShowControlContext);
}