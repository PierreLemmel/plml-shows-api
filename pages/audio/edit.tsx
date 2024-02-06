import React, { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions";
import {
  getAudioClip,
  getAudioClipCollection,
  updateAudioClipInfo,
} from "@/lib/services/api/audio";
import {
  AudioClipData,
  AudioClipInfo,
} from "@/lib/services/audio/audioControl";
import { error } from "console";
import { WaveSurferPlayerComponent } from "@/components/audio/wavesurfer-player-component";

const AudioPlayer = () => {
  const [isPlayingRegion, setIsPlayingRegion] = useState<boolean | null>(null);
  const waveformRef = useRef<WaveSurfer | null>(null);
  const regionsPluginRef = useRef<RegionsPlugin | null>(null);
  const [isClipLoaded, setIsClipLoaded] = useState<boolean>(false);
  const [currentRegionIndex, setCurrentRegionIndex] = useState<number | null>(
    null
  );
  const [clipName, setClipName] = useState<string>("");

  useEffect(() => {
    const waveform = WaveSurfer.create({
      container: "#waveform",
      waveColor: "rgb(200, 0, 200)",
      progressColor: "rgb(100, 0, 100)",
    });

    const regionsPlugin = waveform.registerPlugin(RegionsPlugin.create());

    if (waveform != null) {
      waveformRef.current = waveform;
    }

    if (regionsPlugin != null) {
      regionsPluginRef.current = regionsPlugin;
    }
  }, []);

  useEffect(() => {
    const regionsPlugin = regionsPluginRef.current;

    if (regionsPlugin && waveformRef.current && isPlayingRegion === true) {
      regionsPlugin.on("region-out", (region) => {
        if (isPlayingRegion === true && waveformRef.current) {
          waveformRef.current.pause();
        }
      });
    }
  }, [isPlayingRegion]);

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

    if (waveform && regionsPlugin && allRegions.length < 1) {
      const random = (min: number, max: number) =>
        Math.random() * (max - min) + min;
      const randomColor = () =>
        `rgba(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)}, 0.5)`;
console.log(regionsPlugin)
      waveform.on("decode", () => {
        regionsPlugin.addRegion({
          id: "MyRegion",
          start: SetStart,
          end: SetEnd,
          resize: true,
          drag: true,
          content: "test",
          color: randomColor(),
        });
      });
    }
  };

  const handleGetClip = async () => {
    try {
      if (isClipLoaded) {
        throw new Error(
          "Un clip est déjà chargé. Déchargez le clip actuel avant d'en charger un nouveau."
        );
      }

      const audioClipData = await getAudioClip("human", clipName);

      if (waveformRef.current) {
        const response = await fetch(audioClipData.url);
        const audioBlob = await response.blob();

        waveformRef.current.loadBlob(audioBlob);
        setIsClipLoaded(true);
        handleMakeRegion(audioClipData);
      }
    } catch (error: any) {
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
        for (let i = 0; i < allRegions.length; i++) {
          allRegions[i].remove();
        }
        regionsPlugin.clearRegions(); // Clear all regions
        setTimeout(() => {
          const remainingRegions = regionsPlugin.getRegions();
        }, 1000);
      }

      waveformRef.current.empty();

      setCurrentRegionIndex(null);
      setIsClipLoaded(false);
      window.location.reload();
    }
  };

  const handleRegion = async () => {
    const allRegions = regionsPluginRef.current?.getRegions() || [];

    if (allRegions.length > 0 && allRegions[0].start != 0.001) {
      const firstRegionStartTime = allRegions[0].start;
      const firstRegionEndTime = allRegions[0].end;
      try {
        if (clipName) {
          await updateAudioClipInfo(
            "human",
            clipName,
            firstRegionStartTime,
            firstRegionEndTime
          );
        }
      } catch (e) {
        console.error(e);
      }
    } else {
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

  return (
    <div>
      {" "}
    
      <WaveSurferPlayerComponent clipName="Sinik" clipType="human" />
     
      {/* <input type="file" onChange={handleFileChange} accept="audio/*" />
      <br />
      <input type="file" onChange={handleFileChange} accept="audio/*" />
      <br />
      <button onClick={handlePlay}>Play</button>
      <br />
      <button onClick={handleRegionPlay}>PlayRegion</button>
      <br />
      
      <input
        type="text"
        value={clipName}
        onChange={(e) => setClipName(e.target.value)}
        placeholder="Nom de la musique"
      />
      <button onClick={handleGetClip}>Get Audio Clip</button>
      <br />
      <button onClick={handleUnloadClip}>Unload Clip</button>
      <br />
      <button onClick={handleRegion}>Save Start/End point</button>
      <div id="waveform" /> */}
    </div>
  );
};

export default AudioPlayer;
