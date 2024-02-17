import React, { useState } from "react";
import { getAudioClip } from "@/lib/services/api/audio";
import { WaveSurferPlayerComponent } from "@/components/audio/wavesurfer-player-component";

const AudioPlayer = () => {
  const [clipName, setClipName] = useState<string>("");
  const [clipType, setClipType] = useState<string>("");
  const [clipLoaded, setClipLoaded] = useState<boolean>(false);

  const handleGetClip = async () => {
    try {
      
      setClipName(clipName);
      setClipType(clipType);
      await getAudioClip(clipType, clipName);
      setClipLoaded(true); 
    } catch (error) {
      console.error("Error while uploading clip, check the ClipName and ClipType :", error);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={clipName}
        onChange={(e) => setClipName(e.target.value)}
        placeholder="Nom du clip"
      />
      <input
        type="text"
        value={clipType}
        onChange={(e) => setClipType(e.target.value)}
        placeholder="Type du clip"
      />
      <button onClick={handleGetClip}>Upload Clip</button>
      {clipLoaded && (
        <WaveSurferPlayerComponent clipName={clipName} clipType={clipType} />
      )}
    </div>
  );
};

export default AudioPlayer;
