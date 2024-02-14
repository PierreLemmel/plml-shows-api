import React, { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { getAudioClip, updateAudioClipInfo } from "@/lib/services/api/audio";
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
  const [markerContent, setMarkerContent] = useState("");

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
        const audioClipData = await getAudioClip("human", "Shurik'n Live");

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
    const random = (min: number, max: number) =>
      Math.random() * (max - min) + min;
    const randomColor = () =>
      `rgba(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)}, 0.5)`;

    if (waveform && regionsPlugin) {
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
    if (audioClipData.info.markers && regionsPlugin) {
      const markers: any = audioClipData.info.markers;
      console.log("markers", markers);

      for (const key in markers) {
        if (Object.prototype.hasOwnProperty.call(markers, key)) {
          const value = markers[key];
          console.log("key", key);
          console.log("value", value);
          regionsPlugin.addRegion({
            id: key,
            start: value,
            resize: true,
            drag: true,
            content: key,
            color: randomColor(),
          });
        }
      }
    }
  };

  const handleRegion = async () => {
    const allRegions = regionsPluginRef.current?.getRegions() || [];
    console.log("update");
    if (allRegions.length > 0 && allRegions[0].start != 0.001) {
      const firstRegionStartTime = allRegions[0].start;
      const firstRegionEndTime = allRegions[0].end;
      try {
        if (clipName && allRegions.length === 1) {
          await updateAudioClipInfo(
            "human",
            "Shurik'n Live",
            firstRegionStartTime,
            firstRegionEndTime
          );
        }
        if (clipName) {
          const markers = new Map<string, number>();
          console.log("allRegionsLenght", allRegions.length);
          for (let i = 0; i < allRegions.length; i++) {
            if (allRegions[i].id !== "MyRegion") {
              console.log("i number", i);
              markers.set(allRegions[i].content, allRegions[i].start);
            }
          }
          console.log("markers before", markers.size);
          await updateAudioClipInfo(
            "human",
            "Shurik'n Live",
            firstRegionStartTime,
            firstRegionEndTime,
            markers
          );
        }
      } catch (e) {
        console.error(e);
      }
    } else {
    }
  };

  const handleMakeMarker = () => {
    const regionsPlugin = regionsPluginRef.current;
    const waveform = waveformRef.current;
    const allRegions = regionsPluginRef.current?.getRegions() || [];
  
    const random = (min: number, max: number) =>
      Math.random() * (max - min) + min;
    const randomColor = () =>
      `rgba(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)}, 0.5)`;
    if (regionsPlugin && waveform) {
      regionsPlugin.addRegion({
        id: "Marker",
        drag: true,
        start: 10,
        content: markerContent, 
        color: randomColor(),
      });
    }
  };
  
  const removeMarker = () => {
    const allRegions = regionsPluginRef.current?.getRegions() || [];
    for (let i = 0; i < allRegions.length; i++) {
      if (allRegions[i].id != "MyRegion") {
        allRegions[i].remove();
      }
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
      <button onClick={handlePause}> Pause</button> ||
      <button onClick={handleRegion}> Update Region</button> ||
      <button onClick={handleMakeMarker}> Make Marker</button> ||
      <input
        type="text"
        value={markerContent}
        onChange={(e) => setMarkerContent(e.target.value)}
        placeholder="Enter marker content"
      />
      <button onClick={removeMarker}> Remove Marker</button>
      <div id="waveform" />
    </div>
  );
};

export default WaveSurferPlayerComponent;
