import { randomRange, randomBool } from "@/lib/services/helpers"
import { smoothDamp, Velocity } from "@/lib/services/mathf";
import { useWindowSize } from "@/lib/services/responsive"
import { useEffect, useRef, useCallback, useMemo } from "react"


interface BackgroundCellData {
    value: number;
    opacityMin: number;
    opacityMax: number;
    opacity: number;
    duration: number;
    nextSwap: number;
    pulsation: number;
    goingUp: boolean;
    velocity: Velocity;
}

const AleasBackground = () => {

    const cellsDataRef = useRef<BackgroundCellData[][]>();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const opacityMinRange = {
        min: 0,
        max: 0.3
    }

    const opacityMaxRange = {
        min: 0.7,
        max: 1.0
    }

    const durationRange = {
        min: 3.5,
        max: 13.2
    }

    const pulsationRange = {
        min: 2.1,
        max: 7.8
    }

    const { windowWidth, windowHeight } = useWindowSize();

    const pixelsPerDigitX = 33;
    const pixelsPerDigitY = 44;

    const rows = Math.floor((windowHeight ?? 0) / pixelsPerDigitY);
    const cols = Math.floor((windowWidth ?? 0) / pixelsPerDigitX);

    const rowsColsRef = useRef<{rows: number, cols: number}>();
    rowsColsRef.current = { rows, cols };

    useEffect(() => {

        const createCell = () => {

            const opacityMin = randomRange(opacityMinRange.min, opacityMinRange.max);
            const opacityMax = randomRange(opacityMaxRange.min, opacityMaxRange.max);
            const opacity = randomRange(opacityMin, opacityMax);

            const value = randomBool() ? 1 : 0;
            const duration = randomRange(durationRange.min, durationRange.max);
            const pulsation = randomRange(pulsationRange.min, pulsationRange.max);

            const goingUp = randomBool();
            const nextSwap = randomRange(0, duration);

            const cell: BackgroundCellData = {
                opacity, opacityMin, opacityMax,
                value, goingUp,
                duration, pulsation,
                velocity: Velocity.zero(),
                nextSwap
            }

            return cell;
        }

        const data = Array(rows).fill(null).map(row =>
            Array(cols).fill(null).map(createCell)
        )

        cellsDataRef.current = data;

    }, [rows, cols])

    const repaintCanvas = useCallback(() => {

        const { rows, cols } = rowsColsRef.current!;

        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;

        const { width, height } = canvas;

        const bgGradient = ctx.createLinearGradient(0, height / 2, width, height / 2);
        bgGradient.addColorStop(0, '#111827');
        bgGradient.addColorStop(1, '#1f2937');

        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, width, height);


        const fontSize = 25;
        ctx.font = `${fontSize}px consolas`;

        const cellW = width / cols;
        const cellH = height / rows;

        cellsDataRef.current?.forEach((cols, row) => {

            const y = (row + 0.5) * cellH + fontSize / 2;
            cols.forEach((cell, col) => {
                const x = (col + 0.5) * cellW - 0.4 * fontSize;

                const { value, opacity } = cell;

                ctx.fillStyle = `rgb(8, 221, 8, ${opacity})`;
                ctx.fillText(value.toString(), x, y)
            })
        })
    }, [rows, cols]);

    const deltaTime = 1 / 30;
    const threshold = 0.01;

    const startTime = useMemo<number>(() => {
        return new Date().getTime();
    }, []);

    const updateData = useCallback(() => {

        const time = new Date().getTime();
        const ellapsed = (time - startTime) / 1000;

        cellsDataRef.current?.forEach(row => row.forEach(cell => {
            const {
                opacity, goingUp, opacityMin, opacityMax,
                velocity, pulsation, duration,
                value, nextSwap
            } = cell;

            const newOpacity = smoothDamp(opacity, goingUp ? opacityMax : opacityMin, velocity, pulsation, Number.MAX_VALUE, deltaTime);
            cell.opacity = newOpacity;

            
            if (
                (goingUp && Math.abs(opacityMax - newOpacity) < threshold) ||
                (!goingUp && Math.abs(newOpacity - opacityMin) < threshold)
            ) {
                cell.goingUp = !goingUp;
            }


            if (ellapsed > nextSwap) {
                cell.value = value === 0 ? 1 : 0;
                cell.nextSwap = nextSwap + duration;
            }
        }))
    }, []);

    useEffect(() => {

        const interval = setInterval(() => {
            updateData();
            repaintCanvas();
        }, 1000 * deltaTime);

        return () => clearInterval(interval);
    },[])

    return <div className="full absolute top-0">
        <canvas className="full" width={windowWidth} height={windowHeight} ref={canvasRef} />
    </div>
}

export default AleasBackground;