import React, { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions";
import { getAudioClip, getAudioClipCollection } from "@/lib/services/api/audio";

const AudioPlayer = () => {
  const waveformRef = useRef<WaveSurfer | null>(null);
  const regionsPluginRef = useRef<RegionsPlugin | null>(null);
  const [loop, setLoop] = useState<boolean>(true);
  const [currentRegionIndex, setCurrentRegionIndex] = useState<number | null>(
    null
  );

  useEffect(() => {
    const waveform = WaveSurfer.create({
      container: "#waveform",
      waveColor: "rgb(200, 0, 200)",
      progressColor: "rgb(100, 0, 100)",
    });

    const regionsPlugin = waveform.registerPlugin(RegionsPlugin.create());

    const random = (min, max) => Math.random() * (max - min) + min;
    const randomColor = () =>
      `rgba(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)}, 0.5)`;

    waveform.on("decode", () => {
      regionsPlugin.addRegion({
        id: "MyRegion",
        start: 0,
        end: 10,
        content: "Cramped region",
        color: randomColor(),
        minLength: 1,
        maxLength: 10000,
      });
    });


    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      if (file) {
        if (waveformRef.current) {
          waveformRef.current.loadBlob(file);
        }
      }
    };
    

    if (waveform != null) {
      waveformRef.current = waveform;
    }
    
    if (regionsPlugin != null) {
      regionsPluginRef.current = regionsPlugin;
    }
    
    

    return () => {
      waveform.destroy();
    };
    }, [loop]);
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      
      if (file) {
      if (waveformRef.current) {
        waveformRef.current.loadBlob(file);
      }
    }
  };

  const handleRegion = () => {
    const allRegions = regionsPluginRef.current?.getRegions() || [];
    
    if (allRegions.length > 0) {
      const firstRegionStartTime = allRegions[0].start;
      const firstRegionEndTime = allRegions[0].end
      console.log("Start Time of the first region:", firstRegionStartTime);
      console.log("End Time of the first region:", firstRegionEndTime);

    } else {
      console.log("Aucune région n'est présente.");
    }
  };

  const handleGetClip = async (clipName: string) => {
    try {
      const audioClipData = await getAudioClip("human", clipName);
      console.log('audioclap final' , audioClipData.url)

      if (waveformRef.current) {
         const response = await fetch(audioClipData.url)
         const audioBlob = await response.blob();

          waveformRef.current.loadBlob(audioBlob);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du clip audio :", error);
    }
  };
  
  const handlePlay = () => {
    if (waveformRef.current) {
      waveformRef.current.playPause();
    }
  };
  
  
  return (
    <div>
      <input type="file" onChange={handleFileChange} accept="audio/*" />
      <button onClick={handlePlay}>Play</button>
      <button onClick={handleRegion}>GetRegion</button>
      <button onClick={() => handleGetClip("Kirby")}>
        Get Audio Clip
      </button>

      <div id="waveform" />
    </div>
  );
};

export default AudioPlayer;
