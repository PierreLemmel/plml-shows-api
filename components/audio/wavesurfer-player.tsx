import React, { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { getAudioClip, updateAudioClipInfo } from "@/lib/services/api/audio";
import { AudioClipData } from "@/lib/services/audio/audioControl";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions";
import { AleasButton } from "../aleas-components/aleas-buttons";
import { AleasDropdownInput } from "../aleas-components/aleas-dropdowns";
import AleasTextField from "../aleas-components/aleas-textfield";

interface WaveSurferPlayerProps {
  clipName: string;
  clipType: string;
}

export const WaveSurferPlayer: React.FC<WaveSurferPlayerProps> = ({
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
    isPlayingRegionRef.current = isPlayingRegion;
  }, [isPlayingRegion]);

  useEffect(() => {
    const fetchData = async () => {
      if (!waveformRef.current) {
        const waveform = WaveSurfer.create({
          container: "#waveform",
          waveColor: "rgb(196, 196, 196)",
          progressColor: "rgb(122, 250, 250)",
        });
        waveformRef.current = waveform;
        const regionsPlugin = waveform.registerPlugin(RegionsPlugin.create());
        const audioClipData = await getAudioClip(clipType, clipName);

        const response = await fetch(audioClipData.url);
        const audioBlob = await response.blob();
        waveformRef.current.loadBlob(audioBlob);

        if (regionsPlugin) {
          regionsPluginRef.current = regionsPlugin;
        }

        if (waveform) {
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
    const validationId = "validRegion";
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
          activeRegion.id == validationId
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

    const setStart = audioClipData.info.start ?? 0;
    const setEnd = audioClipData.info.start ?? 10;

    const regioncolor = "rgb(196, 196, 196, 50%)";
    const markercolor = "rgb(0,0,0)";

    if (waveform && regionsPlugin) {
      regionsPlugin.addRegion({
        id: "validRegion",
        start: setStart,
        end: setEnd,
        resize: true,
        drag: true,
        content: "Region",
        color: regioncolor,
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
            color: markercolor,
          });
        }
      }
    }
  };

  const handleRegion = async () => {
    const invalidRegion = 0.001;
    const allRegions = regionsPluginRef.current?.getRegions() || [];
    if (allRegions.length > 0 && allRegions[0].start !== invalidRegion) {
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
          const validationId = "validRegion";

          allRegions
            .filter((region) => region.id !== validationId)
            .forEach((region) => {
              markers.set(region.content?.textContent || "", region.start);
            });

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
    }
  };

  const handleMakeMarker = () => {
    const regionsPlugin = regionsPluginRef.current;
    const waveform = waveformRef.current;
    const allRegions = regionsPluginRef.current?.getRegions() || [];

    const markerExist = allRegions
      .slice(1)
      .some((region) => region.content?.textContent === markerContent);

    if (regionsPlugin && waveform && markerContent !== "" && !markerExist) {
      regionsPlugin.addRegion({
        id: "Marker",
        drag: true,
        start: 10,
        content: markerContent,
        color: "rgb(0,0,0)",
      });
    }
  };

  const removeMarker = () => {
    const validationId = "validRegion";
    const allRegions = regionsPluginRef.current?.getRegions() || [];

    allRegions
      .filter((region) => region.id !== validationId)
      .forEach((region) => region.remove());
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
    <div className="flex flex-col gap-4">
      <div className="flex flex-row gap-2">
        <AleasButton onClick={handlePlay}>Play</AleasButton>
        <AleasButton onClick={handleRegionPlay}>PlayRegion</AleasButton>
      </div>
      <div className="flex flex-row gap-2">
        <AleasButton onClick={handlePause}> Pause</AleasButton>
        <AleasButton onClick={handleMakeMarker}> Make Marker</AleasButton>
      </div>
      <AleasTextField
        value={markerContent}
        onValueChange={newVal => setMarkerContent(newVal)}
        placeholder="Enter marker content"
      />
      <div className="flex flex-row gap-2">
        <AleasButton onClick={removeMarker}> Remove All Markers</AleasButton>{" "}
        <AleasButton onClick={handleRegion}> Update Region</AleasButton>
        <AleasButton onClick={unloadClip}>Unload clip</AleasButton>
      </div>
      <div id="waveform" />
    </div>
  );
};

export default WaveSurferPlayer;
