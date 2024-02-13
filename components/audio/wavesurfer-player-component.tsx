import React, { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { getAudioClip } from "@/lib/services/api/audio";
import { AudioClipData } from "@/lib/services/audio/audioControl";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions";

interface WaveSurferPlayerProps {
  clipName: string;
  clipType: string;
}

export const WaveSurferPlayerComponent: React.FC<WaveSurferPlayerProps> = ({
  clipName,
  clipType,
}) => {
  const waveformRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false); // État de la lecture
  const regionsPluginRef = useRef<RegionsPlugin | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!waveformRef.current) {
        const waveform = WaveSurfer.create({
          container: "#waveform",
          waveColor: "rgb(200, 0, 200)",
          progressColor: "rgb(100, 0, 100)",
        });
        waveformRef.current = waveform;
        const regionsPlugin = waveform.registerPlugin(RegionsPlugin.create());
        const audioClipData = await getAudioClip("human", "Sinik");

        const response = await fetch(audioClipData.url);
        const audioBlob = await response.blob();
        waveformRef.current.loadBlob(audioBlob);

        if (regionsPlugin != null) {
          regionsPluginRef.current = regionsPlugin;
        }


    if (waveform != null) {
      waveformRef.current = waveform;
    }

        waveform.on("ready", () => {
          console.log("ready");
          handleMakeRegion(audioClipData);
        });
      }
    };

    fetchData();
  }, [clipName]);

  const handleMakeRegion = (audioClipData: AudioClipData) => {
    const regionsPlugin = regionsPluginRef.current;
    const waveform = waveformRef.current;
    const allRegions = regionsPluginRef.current?.getRegions() || [];
    let SetStart: number;
    let SetEnd: number;

    console.log("in region");
    console.log("clipData in region =>", audioClipData);
    console.log("is Waveform ok ?", waveform);

    if (audioClipData.info.start != -1) {
      SetStart = audioClipData.info.start;
    } else SetStart = 0;
    if (audioClipData.info.end != -1) {
      SetEnd = audioClipData.info.end;
    } else SetEnd = 10;
    console.log("SetStart", SetStart);
    console.log("SetEnd", SetEnd);

    if (waveform && regionsPlugin) {
      const random = (min: number, max: number) =>
        Math.random() * (max - min) + min;
      const randomColor = () =>
        `rgba(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)}, 0.5)`;
      console.log("regionPlugin", regionsPlugin);
          console.log("decode");
          regionsPlugin.addRegion({
            id: "MyRegion",
            start: SetStart,
            end: SetEnd,
            resize: true,
            drag: true,
            content: "test",
            color: randomColor(),
          });
    }
  };

  const handlePlay = () => {
    if (waveformRef.current) {
      waveformRef.current.play();
    }
  };

  const handlePause = () => {
    if (waveformRef.current) {
      waveformRef.current.pause();
    }
  };

  return (
    <div>
      <button onClick={handlePlay}>Play</button> ||
      <div id="waveform" />
      <button onClick={handlePause}>Pause</button>
    </div>
  );
};

export default WaveSurferPlayerComponent;
