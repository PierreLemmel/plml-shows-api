import React, { useMemo, useState } from "react";
import { getAudioClip } from "@/lib/services/api/audio";
import { WaveSurferPlayer } from "@/components/audio/wavesurfer-player";
import { AleasDropdownButton, DropdownOption } from "@/components/aleas-components/aleas-dropdowns";
import AleasTextField from "@/components/aleas-components/aleas-textfield";
import { audioSources } from "@/lib/services/audio/audio";

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
      console.error(
        "Error while uploading clip, check the ClipName and ClipType :",
        error
      );
    }
  };

  const sourceOptions = useMemo<DropdownOption<string>[]>(
    () => audioSources.map((source) => ({ label: source, value: source })),
    []
  );

    

  return (
    <div>
      <AleasDropdownButton
        options={sourceOptions}
        onValueChanged={setClipType}
        value={clipType}
        />
      <AleasTextField
        value={clipName}
        onValueChange={setClipName}
        placeholder="Nom du clip"
      />

      <button onClick={handleGetClip}>Upload Clip</button>
      {clipLoaded && (
        <WaveSurferPlayer clipName={clipName} clipType={clipType} />
      )}
    </div>
  );
};

export default AudioPlayer;
