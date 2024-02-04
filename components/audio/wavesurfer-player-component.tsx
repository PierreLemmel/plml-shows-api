import React, { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { getAudioClip } from "@/lib/services/api/audio";
import { AudioClipData } from "@/lib/services/audio/audioControl";

export const WaveSurferPlayerComponent = (clipName: string, clipType: string) => {
  const [clipData, setClipData] = useState<AudioClipData | null>(null);
  const waveformRef = useRef<WaveSurfer | null>(null);

  useEffect(() => {
    const loadAudioClip = async () => {
      try {
        const audioClipData = await getAudioClip("human", "Sinik");
        //setClipData(audioClipData);
        console.log("clipData!!! =>", audioClipData);
      } catch (e) {
        console.error(e);
      }
    };
    console.log("I have been called 1");
    console.log('name =>',clipName);
    console.log('type =>',clipType);
    console.log('ClipData =>>', clipData);
    loadAudioClip();
  }, [clipName]);

  useEffect(() => {
    if (clipData && waveformRef.current) {
      const waveform = WaveSurfer.create({
        container: "#waveform",
        waveColor: "rgb(200, 0, 200)",
        progressColor: "rgb(100, 0, 100)",
      });

      const loadAudioBlob = async () => {
        try {
          console.log("I have been called ");
          const response = await fetch(clipData.url);
          const audioBlob = await response.blob();
          waveform.loadBlob(audioBlob);
        } catch (error) {
          console.error("Error loading audio blob:", error);
        }
      };

      loadAudioBlob();

      return () => {
        waveform.destroy();
      };
    }
  }, [clipData]);

  return <div id="waveform" />;
};

export default WaveSurferPlayerComponent;
