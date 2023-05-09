import { createContext, useContext, useEffect, useState } from "react";
import { getLightingPlan, getShow } from "../api/showControlApi";
import { useEffectAsync } from "../core/hooks";
import { Named, RgbColor, RgbNamedColor } from "../core/types";
import { Chans, DmxRange, StageLightingPlan } from "./dmx512";

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

export interface ShowControlProps {
    lightingPlan?: StageLightingPlan;
    show?: Show;

    loadLightingPlan: (plan: string) => void;
    loadShow: (name: string) => void;
}

export function useShowControl(): ShowControlProps {

    const [showName, setShowName] = useState<string>();
    const [lightingPlanName, setLightingPlanName] = useState<string>();

    const [show, setShow] = useState<Show>();
    const [lightingPlan, setLightingPlan] = useState<StageLightingPlan>();

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

    return {
        show,
        lightingPlan,

        loadLightingPlan: (name: string) => setLightingPlanName(name),
        loadShow: (name: string) => setShowName(name),
    }
}

export const ShowControlContext = createContext<ShowControlProps|null>(null);

export function useShowControlContext() {
    return useContext<ShowControlProps|null>(ShowControlContext);
}