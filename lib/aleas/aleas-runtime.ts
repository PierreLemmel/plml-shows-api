import { Scene } from "../services/dmx/showControl";

interface IntroOutroBaseProps {
    scene: Scene;
}


interface GenerationSettings {
    durationSpread: number;
    showDuration: number;
    blackoutDuration: number;
}

export interface AleasRuntimeProps {
}