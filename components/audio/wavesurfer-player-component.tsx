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
  // const [isPlaying, setIsPlaying] = useState(false);
  const regionsPluginRef = useRef<RegionsPlugin | null>(null);
  const [markerContent, setMarkerContent] = useState("");
  const [isPlayingRegion, setIsPlayingRegion] = useState<boolean | null>(null);
  const isPlayingRegionRef = useRef(isPlayingRegion);

  useEffect(() => {
    console.log(isPlayingRegionRef.current);
    isPlayingRegionRef.current = isPlayingRegion;
    console.log("after", isPlayingRegionRef.current);
  }, [isPlayingRegion]);

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
        const audioClipData = await getAudioClip(clipType, clipName);

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
          handleMakeRegion(audioClipData);
        });
      }
    };

    fetchData();
  });

  useEffect(() => {
    const regionsPlugin = regionsPluginRef.current;
    if (
      regionsPlugin &&
      waveformRef.current &&
      isPlayingRegionRef.current === true
    ) {
      regionsPlugin.on("region-out", (region) => {
        let activeRegion = region;
        if (
          isPlayingRegionRef.current === true &&
          waveformRef.current &&
          activeRegion.id == "MyRegion"
        ) {
          waveformRef.current.pause();
        }
      });
    }
  });

  const unloadClip = () => {
    if (waveformRef.current) {
      waveformRef.current.empty();
      setIsPlayingRegion(null);
      window.location.reload();
    }
  };

  const handleMakeRegion = (audioClipData: AudioClipData) => {
    const regionsPlugin = regionsPluginRef.current;
    const waveform = waveformRef.current;
    const allRegions = regionsPluginRef.current?.getRegions() || [];
    let SetStart: number;
    let SetEnd: number;

    if (audioClipData.info.start != -1) {
      SetStart = audioClipData.info.start;
    } else SetStart = 0;
    if (audioClipData.info.end != -1) {
      SetEnd = audioClipData.info.end;
    } else SetEnd = 10;
    const random = (min: number, max: number) =>
      Math.random() * (max - min) + min;
    const randomColor = () =>
      `rgba(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)}, 0.5)`;

    if (waveform && regionsPlugin) {
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

      for (const key in markers) {
        if (Object.prototype.hasOwnProperty.call(markers, key)) {
          const value = markers[key];
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
    if (allRegions.length > 0 && allRegions[0].start != 0.001) {
      const firstRegionStartTime = allRegions[0].start;
      const firstRegionEndTime = allRegions[0].end;
      try {
        if (clipName && allRegions.length === 1) {
          await updateAudioClipInfo(
            clipType,
            clipName,
            firstRegionStartTime,
            firstRegionEndTime
          );
        }
        if (clipName) {
          const markers = new Map<string, number>();
          for (let i = 0; i < allRegions.length; i++) {
            if (allRegions[i].id !== "MyRegion") {
              markers.set(
                allRegions[i].content?.textContent || "",
                allRegions[i].start
              );
            }
          }
          await updateAudioClipInfo(
            clipType,
            clipName,
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
    let markerExist: boolean = false;

    for (let i = 1; i < allRegions.length; i++) {
      if (allRegions[i].content?.textContent === markerContent) {
        markerExist = true;
      }
    }

    const random = (min: number, max: number) =>
      Math.random() * (max - min) + min;
    const randomColor = () =>
      `rgba(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)}, 0.5)`;
    if (regionsPlugin && waveform && markerContent !== "" && !markerExist) {
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
      setIsPlayingRegion(false);
      waveformRef.current.play();
    }
  };

  const handleRegionPlay = () => {
    const regionsPlugin = regionsPluginRef.current;
    const allRegions = regionsPluginRef.current?.getRegions() || [];
    if (allRegions[0]) {
      setIsPlayingRegion(true);
      allRegions[0].play();
    } else {
      console.log("Aucune région n'est présente.");
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
      <button onClick={handleRegionPlay}>PlayRegion</button> || <br />
      <button onClick={handlePause}> Pause</button> ||
      <button onClick={handleMakeMarker}> Make Marker</button> ||
      <input
        type="text"
        value={markerContent}
        onChange={(e) => setMarkerContent(e.target.value)}
        placeholder="Enter marker content"
      />
      <button onClick={removeMarker}> Remove All Markers</button> || <br />
      <button onClick={handleRegion}> Update Region</button> ||
      <button onClick={unloadClip}>Unload clip</button>
      <div id="waveform" />
    </div>
  );
};

export default WaveSurferPlayerComponent;
