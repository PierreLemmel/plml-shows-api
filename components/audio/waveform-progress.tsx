import { resample, clamp } from "@/lib/services/core/maths";
import { doNothing, mergeClasses } from "@/lib/services/core/utils";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";


export interface WaveformProgressProps extends React.HTMLAttributes<HTMLDivElement> {
    spectrum: number[];

    currentTime: number;
    duration: number;
    
    onCurrentTimeChanged?: (currentTime: number) => void;

    pixelsPerBar?: number;
    spacing?: number;

    notPlayedColor?: string;
    playedColor?: string;

    clickable?: boolean;
}

const WaveformProgress = (props: WaveformProgressProps) => {

    const {
        currentTime,
        duration,
        onCurrentTimeChanged,
        spectrum,
        className,
        pixelsPerBar,
        spacing,
        notPlayedColor,
        playedColor,
        clickable,
    } = {
        onCurrentTimeChanged: doNothing,
        clickable: true,
        pixelsPerBar: 2,
        spacing: 2,
        notPlayedColor: "#d6d3d1",
        playedColor: "#0ea5e9",
        ...props
    };

    const railRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);

    const playableCanvasRef = useRef<HTMLCanvasElement>(null);
    const playedCanvasRef = useRef<HTMLCanvasElement>(null);

    const clampTime = useCallback((time: number) => {
        return clamp(time, 0, duration);
    }, [duration])
    
    const onClickOnTrack = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        
        if (!trackRef.current || !railRef.current) {
            return;
        }

        const { offsetX } = e.nativeEvent;

        const newTime = clampTime(duration * ((trackRef.current.offsetLeft + offsetX) / railRef.current.clientWidth));
        onCurrentTimeChanged(newTime);
    }, [clampTime, onCurrentTimeChanged])

    const [ready, setReady] = useState<boolean>(false);

    const samples = railRef.current ? Math.round(railRef.current.clientWidth / (pixelsPerBar + spacing)) : null;

    useEffect(() => {
        setReady(true);
    }, [])
    
    const normalizedData: number[]|null = useMemo(() => {
        if (spectrum && samples) {
            const values = resample(spectrum, samples);
            const max = Math.max(...values);
            return values.map(val => Math.max(Math.pow(val / max, 1.33), 0.008));
        }
        else {
            return null;
        }
        
    }, [spectrum, samples]);

    const renderCanvas = useCallback((canvas: HTMLCanvasElement|null, color: string, left?: number|undefined, right?: number|undefined) => {
        
        if (!canvas) {
            return;
        }

        const ctx = canvas.getContext("2d");

        if (!ctx) {
            return;
        }

        const { width: w, height: h } = canvas;

        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = color;

        let x = 0;
        const rectWidth = pixelsPerBar;
        normalizedData?.forEach(val => {

            const rectHeight = val * h;
            const y = (h - rectHeight) / 2.0;
            ctx.fillRect(x, y, rectWidth, rectHeight);

            x += rectWidth + spacing;
        })

        if (left) {
            ctx.clearRect(0, 0, left * w, h);
        }

        if (right) {
            ctx.clearRect(w * (1 - right), 0, right * w, h);
        }
    }, [normalizedData, pixelsPerBar, spacing])

    useEffect(() => {

        const playedEnd = (duration - currentTime) / duration;

        renderCanvas(playableCanvasRef.current, notPlayedColor, 0, 0);
        renderCanvas(playedCanvasRef.current, playedColor, 0, playedEnd);
    }, [currentTime, duration, notPlayedColor, playedColor, ready, renderCanvas]);

    const canvasClass = "w-full h-full absolute left-0 top-0";
    const canvasWidth = railRef.current?.clientWidth ?? 0;

    return <div className={mergeClasses(
        "centered-col h-min-24",
        className,
    )} ref={railRef}>

        <div className="full rounded-lg py-2">
            {/* Rail */}
            <div className="w-full h-full relative" ref={railRef}>
                {/* Track */}
                <div className="h-full absolute rounded-md" ref={trackRef}>

                    {/* Clickable track */}
                    {clickable && <div className="hover:cursor-pointer z-50 h-full w-full absolute bg-none" onClick={onClickOnTrack}></div>}
                </div>

                {/* Played */}
                <div className="h-full absolute rounded transition duration-100"
                    style={{
                        right: `${100.0 * (duration - currentTime) / duration}%`
                    }}>

                </div>

                <canvas ref={playableCanvasRef} className={canvasClass} width={canvasWidth} />
                <canvas ref={playedCanvasRef} className={canvasClass} width={canvasWidth} />
            </div>
        </div>

        
    </div>
}

export default WaveformProgress;