import { resample, clamp } from "@/lib/services/core/maths";
import { formatMinuteSeconds } from "@/lib/services/core/time";
import { doNothing } from "@/lib/services/core/utils";
import { DragEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";


export interface WaveformProgressProps {
    readonly spectrum: number[]|null;

    readonly currentTime: number;
    readonly duration: number;
    
    readonly onCurrentTimeChanged?: (currentTime: number) => void;
}

const WaveformProgress = (props: WaveformProgressProps) => {

    const borderColor = "border-stone-500";

    const notPlayedColor = "#d6d3d1";
    const playedColor = "#f59e0b";

    const backgroundColor = "";

    const currentTimeHandleColor = "bg-red-900/80";
    const currentTimeHandleHoverColor = "hover:bg-red-900/80";

    const {
        currentTime,
        duration,
        onCurrentTimeChanged,
        spectrum
    } = {
        onCurrentTimeChanged: doNothing,
        ...props
    };

    const railRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const playedRef = useRef<HTMLDivElement>(null);

    const currentTimeHandleRef = useRef<HTMLDivElement>(null);

    const trackCanvasRef = useRef<HTMLCanvasElement>(null);
    const playableCanvasRef = useRef<HTMLCanvasElement>(null);
    const playedCanvasRef = useRef<HTMLCanvasElement>(null);

    const [currentTimeDragging, setCurrentTimeDragging] = useState<boolean>(false);

    const handlesClasses = `absolute w-[0.5rem]
        h-full
        transition transition-color duration-200 rounded-full
        active:cursor-grabbing active:bg-none
        hover:cursor-pointer
    `;

    const clampTime = useCallback((time: number) => {
        return clamp(time, 0, duration);
    }, [])
    
    const onCurrentTimeDragged = useCallback((e: DragEvent<HTMLDivElement>) => {
        
        if (!trackRef.current || !playedRef.current || !railRef.current) {
            return;
        }

        const { offsetX, offsetY } = e.nativeEvent;
        
        if (offsetX < 0 && offsetY < 0) {
            return;
        }
        
        const newTime = clampTime(duration * ((trackRef.current.offsetLeft + playedRef.current.clientWidth + offsetX) / railRef.current.clientWidth));
        onCurrentTimeChanged(newTime);
    }, [clampTime, onCurrentTimeChanged]);
    
    const onClickOnTrack = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        
        if (!trackRef.current || !railRef.current) {
            return;
        }

        const { offsetX } = e.nativeEvent;

        const newTime = clampTime(duration * ((trackRef.current.offsetLeft + offsetX) / railRef.current.clientWidth));
        onCurrentTimeChanged(newTime);
    }, [clampTime, onCurrentTimeChanged])

    const pixelsPerBar = 2;
    const spacing = 2;

    const [ready, setReady] = useState<boolean>(false);

    const samples = railRef.current ? Math.round(railRef.current.clientWidth / (pixelsPerBar + spacing)) : null;

    useEffect(() => {
        setReady(true);
    }, [])
    
    const closeThreshold = 3.0;
    const timeCloseToStart = currentTime < closeThreshold;
    const timeCloseToEnd = duration - currentTime < closeThreshold;
    const translateCurrentHandleClass = timeCloseToStart ?
        "translate-x-3/4" :
        timeCloseToEnd ? 
            "translate-x-1/4" :
            "translate-x-1/2";

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
    }, [])

    useEffect(() => {

        const playedEnd = (duration - currentTime) / duration;

        renderCanvas(playableCanvasRef.current, notPlayedColor, 0, 0);
        renderCanvas(playedCanvasRef.current, playedColor, 0, playedEnd);
    }, [currentTime, duration, notPlayedColor, playedColor, ready]);

    const canvasClass = "w-full h-full absolute left-0 top-0";
    const canvasWidth = railRef.current?.clientWidth ?? 0;

    return <div className="w-full centered-col mt-6" ref={railRef}>

        <div className={`w-full h-36 rounded-lg border-[1px] py-2 ${borderColor} ${backgroundColor}`}>
            {/* Rail */}
            <div className={`
                w-full h-full relative
            `} ref={railRef}>
                {/* Track */}
                <div className="h-full absolute rounded-md" ref={trackRef}>

                    {/* Clickable track */}
                    <div className="hover:cursor-pointer z-50 h-full w-full absolute bg-none" onClick={onClickOnTrack}></div>
                </div>

                {/* Played */}
                <div className="h-full absolute rounded transition duration-100" style={{
                    right: `${100.0 * (duration - currentTime) / duration}%`
                }} ref={playedRef}>
                    <div ref={currentTimeHandleRef} className={`
                        ${handlesClasses}
                        right-0 ${translateCurrentHandleClass}
                        ${currentTimeHandleHoverColor}
                        z-50
                    `}
                        onDragStart={e => {
                            setCurrentTimeDragging(true);
                        }}
                        onDragEnd={e => {
                            setCurrentTimeDragging(false);
                        }}
                        onDragCapture={onCurrentTimeDragged}
                        draggable={true}
                    ></div>
                    <div className={`
                        ${handlesClasses}
                        right-0 ${translateCurrentHandleClass}
                        ${currentTimeDragging ? currentTimeHandleColor : ''}
                    `}></div>
                </div>

                <canvas ref={trackCanvasRef} className={canvasClass} width={canvasWidth} />
                <canvas ref={playableCanvasRef} className={canvasClass} width={canvasWidth} />
                <canvas ref={playedCanvasRef} className={canvasClass} width={canvasWidth} />
            </div>
        </div>

        <div className="mt-2">{formatMinuteSeconds(currentTime)} / {formatMinuteSeconds(duration)}</div>
    </div>
}

export default WaveformProgress;