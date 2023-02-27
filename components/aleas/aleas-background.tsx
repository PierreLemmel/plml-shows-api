import { sequence, randomRange } from "@/lib/services/helpers"
import { useWindowSize } from "@/lib/services/responsive"
import { motion } from "framer-motion"
import { Fragment, useState, useEffect } from "react"

const AleasBackground = () => {

    const opacityMinRange = {
        min: 0,
        max: 0.3
    }

    const opacityMaxRange = {
        min: 0.7,
        max: 1.0
    }

    const durationRange = {
        min: 1.7,
        max: 4.9
    }

    const pulsationRange = {
        min: 1.0,
        max: 3.5
    }

    const { windowWidth, windowHeight } = useWindowSize();

    const pixelsPerDigitX = 40;
    const pixelsPerDigitY = 50;

    const rows = Math.floor((windowHeight ?? 0) / pixelsPerDigitY);
    const cols = Math.floor((windowWidth ?? 0) / pixelsPerDigitX);

    return <div className="
        full absolute top-0  center-child
        bg-gradient-to-r from-gray-900 to-gray-800
    ">
        <div
            className="
                full grid grid-items-center
                opacity-60
                text-xl font-consolas
            "
            style={{
                gridTemplateRows: `repeat(${rows}, 1fr)`,
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                color: '#08dd08'
            }}
        >
            {sequence(rows).map(row => <Fragment key={`row-${row}`}>
                {sequence(cols).map(col => {
                    
                    const opacityMin = randomRange(opacityMinRange.min, opacityMinRange.max);
                    const opacityMax = randomRange(opacityMaxRange.min, opacityMaxRange.max);
                    const duration = randomRange(durationRange.min, durationRange.max);
                    const pulsation = randomRange(pulsationRange.min, pulsationRange.max);

                    return <BackgroundCell
                        {...{ opacityMin, opacityMax, duration, pulsation }}
                        key={`cell-${row}-${col}`}
                    />
                })}
            </Fragment>)}
        </div>
    </div>
}

type BackgroundCellProps = {
    opacityMin: number;
    opacityMax: number;
    duration: number;
    pulsation: number;
}

const randomBit = () => Math.random() > 0.5 ? 1 : 0;
const BackgroundCell = (props: BackgroundCellProps) => {

    const { opacityMin, opacityMax, duration, pulsation } = props;

    const [value, setValue] = useState<0|1>(randomBit());

    useEffect(() => {

        let interval: NodeJS.Timer|undefined = undefined;
        let timeout: NodeJS.Timeout|undefined = undefined;

        const durationMs = duration * 1000;

        timeout = setTimeout(() => {
            setValue(randomBit());
            interval = setInterval(() => setValue(randomBit()), durationMs);
        }, durationMs * Math.random())

        return () => {
            if (timeout) {
                clearTimeout(timeout);
            }

            if (interval) {
                clearInterval(interval);
            }
        }
    }, [duration]);

    const initialDirection = Math.random() > 0.5;

    return <motion.div
        className="text-center center-child"
        transition={{
            repeat: Infinity,
            repeatType: 'reverse',
            duration: pulsation,
        }}
        initial={{
            opacity: initialDirection ? opacityMin : opacityMax
        }}
        animate={{
            opacity: initialDirection ? opacityMax : opacityMin
        }}
    >
        {value}
    </motion.div>
}

export default AleasBackground;