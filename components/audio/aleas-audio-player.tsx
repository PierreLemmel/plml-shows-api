import { getSpectrumData, SpectrumData } from "@/lib/services/audio/audioControl";
import { useEffectAsync } from "@/lib/services/core/hooks";
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
    }), [spectrumData, currentTime]);

    const onCurrentTimeChanged = useCallback((currentTime: number) => {
        setCurrentTime(currentTime);
    }, []);

    const [audioUrl, setAudioUrl] = useState<string>();

    const onTimeUpdate = useCallback(() => setCurrentTime(audioRef.current?.currentTime ?? 0), []);

    const onPlay = useCallback(() => {
        console.log("onPlay");
    }, []);

    const onStop = useCallback(() => {
        console.log("onStop");
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

    }, []);

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
    }, [audioFile])


    return <div className={mergeClasses(
        "flex flex-row items-center justify-between w-full",
        className,
    )}>
        {spectrumData && <WaveformProgress
            className="w-full"
            duration={spectrumData.duration}
            spectrum={spectrumData.spectrum}
            currentTime={currentTime}
            onCurrentTimeChanged={onCurrentTimeChanged}
        />}
        <audio ref={audioRef} src={audioUrl} controls={true} />
    </div>
}

export default forwardRef(AleasAudioPlayer);