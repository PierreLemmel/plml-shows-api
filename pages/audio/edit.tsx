import React, { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions";
import {
  getAudioClip,
  getAudioClipCollection,
  updateAudioClipInfo,
} from "@/lib/services/api/audio";
import { AudioClipData, AudioClipInfo } from "@/lib/services/audio/audioControl";
import { error } from "console";

const AudioPlayer = () => {
  const waveformRef = useRef<WaveSurfer | null>(null);
  const regionsPluginRef = useRef<RegionsPlugin | null>(null);
  const [loop, setLoop] = useState<boolean>(true);
  const [isClipLoaded, setIsClipLoaded] = useState<boolean>(false);
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
    //   const random = (min, max) => Math.random() * (max - min) + min;
    //   const randomColor = () =>
    //     `rgba(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)}, 0.5)`;

    //   waveform.on("decode", () => {
    //     regionsPlugin.addRegion({
    //       id: "MyRegion",
    //       start: 0,
    //       end: 10,
    //       content: "Cramped region",
    //       color: randomColor(),
    //       minLength: 1,
    //       maxLength: 10000,
    //     });
    //   });
    // }

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
  }, [loop]);
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      if (waveformRef.current) {
        waveformRef.current.loadBlob(file);
      }
    }
  };

  const handleMakeRegion = (audioClipData: AudioClipData) => {
    const regionsPlugin = regionsPluginRef.current;
    const allRegions = regionsPluginRef.current?.getRegions() || [];


    if (regionsPlugin && allRegions.length < 1) {
      const random = (min, max) => Math.random() * (max - min) + min;
      const randomColor = () =>
        `rgba(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)}, 0.5)`;

      regionsPlugin.addRegion({
        id: "MyRegion",
        start: 12,
        end: 100,
        content: "Cramped region",
        color: randomColor(),
        minLength: 1,
        maxLength: 10000,
      });
    }
  };

  const handleGetClip = async (clipName: string) => {
    try {
      if (isClipLoaded) {
        throw new Error(
          "Un clip est déjà chargé. Déchargez le clip actuel avant d'en charger un nouveau."
        );
      }

      const audioClipData = await getAudioClip("human", clipName);
      console.log("audioclap final", audioClipData.info.start);

      if (waveformRef.current) {
        const response = await fetch(audioClipData.url);
        const audioBlob = await response.blob();

        waveformRef.current.loadBlob(audioBlob);
        setIsClipLoaded(true); // Mettez à jour l'état pour indiquer que le clip est chargé
        handleMakeRegion(audioClipData)
      }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération du clip audio :",
        error.message
        );
      }
  };

  const handleUnloadClip = () => {
    if (waveformRef.current) {
      const regionsPlugin = regionsPluginRef.current;

      if (regionsPlugin) {
        const allRegions = regionsPlugin.getRegions();
        allRegions.forEach((region) => region.remove());
      }

      waveformRef.current.empty(); // Déchargez le clip actuel
      setCurrentRegionIndex(null); // Réinitialisez l'index de la région actuelle
      setIsClipLoaded(false); // Mettez à jour l'état pour indiquer que le clip est déchargé
    }
  };

  const handleRegion = async () => {
    const allRegions = regionsPluginRef.current?.getRegions() || [];

    if (allRegions.length > 0) {
      const firstRegionStartTime = allRegions[0].start;
      const firstRegionEndTime = allRegions[0].end;
      try {
        await updateAudioClipInfo("human", "Sinik", firstRegionStartTime);
      } catch (e) {
        console.error(e);
      }
      console.log("Start Time of the first region:", firstRegionStartTime);
      console.log("End Time of the first region:", firstRegionEndTime);
    } else {
      console.log("Aucune région n'est présente.");
    }
  };

  const handlePlay = () => {
    if (waveformRef.current) {
      waveformRef.current.playPause();
    }
  };

  return (
    <div>      <input type="file" onChange={handleFileChange} accept="audio/*" />

      <br/>
      <button onClick={handlePlay}>Play</button>
      <br/>
      <button onClick={() => handleGetClip("Sinik")}>Get Audio Clip</button>
      <br/>
      {/* <button onClick={handleMakeRegion}>make Region</button> */}
      <br/>
      <button onClick={handleUnloadClip}>Unload Clip</button>
      <br/>
      <button onClick={handleRegion}>Save Start/End point</button>

      <div id="waveform" />
    </div>
  );
};

export default AudioPlayer;
