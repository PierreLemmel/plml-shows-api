import { getSpectrumData, SpectrumData } from "@/lib/services/audio/audioControl";
import { useEffectAsync } from "@/lib/services/core/hooks";
import { formatMinuteSeconds } from "@/lib/services/core/time";
import { doNothing, mergeClasses } from "@/lib/services/core/utils";
import { on } from "events";
import { forwardRef, Ref, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import WaveformProgress from "./waveform-progress";

export interface AudioPlayerProps extends React.HTMLAttributes<HTMLDivElement> {
    audioFile: File;
}

export interface AudioPlayerRef {
    duration: number;
    currentTime: number;
    play: () => void;
    pause: () => void;
}

const AleasAudioPlayer = (props: AudioPlayerProps, ref: Ref<AudioPlayerRef>) => {

    const {
        audioFile,
        className,
    } = props;

    const [currentTime, setCurrentTime] = useState<number>(0);
    const [spectrumData, setSpectrumData] = useState<SpectrumData|null>(null);

    const audioRef = useRef<HTMLAudioElement>(null);

    useEffectAsync(async () => {
        const blob = await audioFile.arrayBuffer();
        const spectrum = await getSpectrumData(blob);

        setSpectrumData(spectrum);
    }, [audioFile])

    

    const play = useCallback(() => audioRef.current?.play(), []);
    const pause = useCallback(() => audioRef.current?.pause(), []);

    useImperativeHandle(ref, () => ({
        duration: spectrumData?.duration ?? 0,
        currentTime,
        play,
        pause
    }), [spectrumData, currentTime, play, pause]);

    const onCurrentTimeChanged = useCallback((currentTime: number) => {
        setCurrentTime(currentTime);
        audioRef.current!.currentTime = currentTime;
    }, []);

    const [audioUrl, setAudioUrl] = useState<string>();

    const onTimeUpdate = useCallback(() => setCurrentTime(audioRef.current?.currentTime ?? 0), []);

    const [isPlaying, setIsPlaying] = useState<boolean>(false);

    const onPlay = useCallback(() => {
        setIsPlaying(true);
    }, []);

    const onStop = useCallback(() => {
        setIsPlaying(false);
    }, [])

    useEffect(() => {

        const audio = audioRef.current!;

        audio.addEventListener("play", onPlay);
        audio.addEventListener("pause", onStop);
        audio.addEventListener("ended", onStop);
        audio.addEventListener("timeupdate", onTimeUpdate);

        return () => {
            audio.removeEventListener("play", onPlay);
            audio.removeEventListener("pause", onStop);
            audio.removeEventListener("ended", onStop);
            audio.removeEventListener("timeupdate", onTimeUpdate);
        }

    }, [onPlay, onStop, onTimeUpdate]);

    useEffect(() => {

        setCurrentTime(0);

        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
            setAudioUrl(undefined);
        }

        if (audioFile) {
            const newUrl = URL.createObjectURL(audioFile);
            setAudioUrl(newUrl);
        }
    }, [audioUrl, audioFile])


    const onButtonClicked = useCallback(() => {
        if (isPlaying) {
            pause();
        } else {
            play();
        }
    }, [isPlaying, play, pause]);

    return <div className={mergeClasses(
        "flex flex-col items-stretch justify-between w-full gap-2",
        "border border-stone-500 rounded-md p-1",
        className,
    )}>
        <div className="flex flex-row items-center justify-between gap-4 pt-1">

            <div className="w-12 h-12 cursor-pointer hover:scale-105" onClick={onButtonClicked}>
                <svg className="full fill-white" viewBox="0 0 24 24">
                {isPlaying ? 
                    <path d="M14,19H18V5H14M6,19H10V5H6V19Z" />:
                    <path d="M8 5v14l11-7z" />
                }
                </svg>
            </div>
            
            {spectrumData && <WaveformProgress
                className="h-24 w-full"
                duration={spectrumData.duration}
                spectrum={spectrumData.spectrum}
                currentTime={currentTime}
                onCurrentTimeChanged={onCurrentTimeChanged}
            />}

        </div>

        {spectrumData && <div className="text-center">{formatMinuteSeconds(currentTime)} / {formatMinuteSeconds(spectrumData.duration)}</div>}
        <audio ref={audioRef} src={audioUrl} controls={false} />
    </div>
}

export default forwardRef(AleasAudioPlayer);