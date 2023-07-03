import AleasBackground from "@/components/aleas/aleas-background";
import { AleasButton } from "@/components/aleas/aleas-buttons";
import AleasHead from "@/components/aleas/aleas-head";
import { AleasModalContainer, AleasTitle } from "@/components/aleas/aleas-layout";
import { padNumber } from "@/lib/services/core/utils";
import { useCallback, useMemo, useRef, useState } from "react";

export interface RandomTimerProps {
}


const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const hundredthes = Math.floor((100 * time) % 100)

    return `${padNumber(minutes, 2)}:${padNumber(seconds, 2)}'${padNumber(hundredthes, 2)}`;
}

export default function RandomTimer(props: RandomTimerProps) {

    const {  } = props;

    const formatTime = useCallback((time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        const hundredthes = Math.floor((100 * time) % 100)
    
        return `${padNumber(minutes, 2)}:${padNumber(seconds, 2)}'${padNumber(hundredthes, 2)}`;
    }, []);
    

    //const dp = useMemo(() => createDurationCollection(durationProviders), [durationProviders])

    const [duration, setDuration] = useState<number>(0);
    const [time, setTime] = useState<number>(185.56);
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [isOver, setIsOver] = useState<boolean>(false);

    const intervalRef = useRef<NodeJS.Timer>();
    const timeRef = useRef<number>(0)

    const stopInterval = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    }

    const playAlarm = useCallback(() => {
        const audio = new Audio('/audio/alarm-clock.mp3')
        audio.play();
    }, [])

    const startTimer = useCallback(() => {
        stopInterval();

        const nextDuration = 60;

        setDuration(nextDuration);
        setTime(nextDuration);
        timeRef.current = nextDuration;
        setIsRunning(true);
        setIsOver(false);

        const interval = 0.1;
        intervalRef.current = setInterval(() => {

            const newTime = timeRef.current - interval;
            
            if (newTime > 0) {
                setTime(newTime)
                timeRef.current = newTime;
            }
            else {
                setIsOver(true);
                stopInterval();

                playAlarm();
            }

        }, interval * 1000);
    }, [playAlarm])

    const onStartClicked = useCallback(() => startTimer(), [startTimer]);
    const onRestartClicked = useCallback(() => startTimer(), [startTimer]);

    const onStopClicked = useCallback(() => {
        setIsRunning(false);
        setIsOver(false);

        stopInterval();
    }, [stopInterval])

    const bigTextClass = `
        text-center
        sm:text-[2.25rem]
        md:text-[3rem]
        lg:text-[4rem]
        text-8xl
    `

    return <>
        <AleasHead title="Random Timer" />

        <main className="fullscreen relative overflow-hidden">

            <AleasBackground />
            <div className="absolute top-0 left-0 full center-child">
                <AleasModalContainer>
                    <AleasTitle>Random Timer</AleasTitle>
                    <div className="text-red-500">THIS COMPONENT IS BROKEN I&apos;LL FIX IT LATER</div>

                    <div className="centered-col">
                        {(isRunning && !isOver) && <>
                            <div className={bigTextClass}>
                                {formatTime(time)}
                            </div>
                            <div className="mt-2 text-lg text-center">
                                (Generated duration: {formatTime(duration)})
                            </div>
                        </>}
                        {isOver && <>
                            <div className={bigTextClass}>
                                Timer done after {formatTime(duration)}
                            </div>
                        </>}
                        {!isRunning && !isOver && <>
                            <div className={bigTextClass}>
                                Press start
                            </div>
                        </>}
                    </div>
                    
                    <div className="flex flex-row">

                        {!isRunning && !isOver && <AleasButton onClick={onStartClicked}>Start</AleasButton>}
                        {(isRunning && !isOver) && <>
                            <AleasButton onClick={onStopClicked}>Stop</AleasButton>
                        </>}
                        {isOver && <>
                            <AleasButton onClick={onRestartClicked}>Restart</AleasButton>
                        </>}
                    </div>
                </AleasModalContainer>
            </div>
            
        </main>
    </>
}