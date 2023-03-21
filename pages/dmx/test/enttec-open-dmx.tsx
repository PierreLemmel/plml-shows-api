import AleasBackground from '@/components/aleas/aleas-background';
import { AleasButton, AleasRoundButton } from '@/components/aleas/aleas-buttons';
import AleasHead from '@/components/aleas/aleas-head';
import { AleasMainContainer, AleasTitle } from '@/components/aleas/aleas-layout';
import DmxSlider from '@/components/dmx/dmx-slider';
import { sequence } from '@/lib/services/core/utils';
import { useEnttecOpenDmx } from '@/lib/services/dmx/hooks';
import { useState } from 'react';
import ReactSlider from 'react-slider';

const TestOpenDmx = () => {

    const openDmx = useEnttecOpenDmx();

    const hasOpenDmx = openDmx !== null;
    const state = openDmx?.state;

    const canOpen = hasOpenDmx && openDmx.canOpen;
    const canClose = hasOpenDmx && openDmx.canClose;

    const onOpenClicked = () => openDmx?.open();
    const onCloseClicked = () => openDmx?.close();

    const [slider, setSlider] = useState<number>(100);

    return <>
        <AleasHead />
        
        <main className="fullscreen relative overflow-hidden">
            
            <AleasBackground />
            <div
                className="absolute top-0 left-0 full center-child"
            >
                <AleasMainContainer>
                    <AleasTitle>
                        Test Enttec
                    </AleasTitle>
                    <div className="centered-row w-full">
                        {sequence(512).map(i => <DmxSlider
                            key={`dmx-slider-${i + 1}`}
                            value={slider}
                            setValue={setSlider}
                            label={(i + 1).toString()}
                        />)}
                        <DmxSlider value={slider} setValue={setSlider} />
                    </div>
                    <div>{openDmx?.state ?? "Not found"}</div>
                    <div className="centered-row gap-6">
                        <AleasButton
                            onClick={onOpenClicked}
                            spinning={state === "Opening" ? true : undefined}
                            disabled={!canOpen}
                        >
                            Open
                        </AleasButton>
                        <AleasButton
                            onClick={onCloseClicked}
                            spinning={state === "Closing" ? true : undefined}
                            disabled={!canClose}
                        >
                            Close
                        </AleasButton>
                    </div>
                </AleasMainContainer>
            </div>            
        </main>
    </>
}

export default TestOpenDmx;