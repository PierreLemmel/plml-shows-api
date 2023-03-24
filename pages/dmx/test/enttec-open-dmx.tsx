import AleasBackground from '@/components/aleas/aleas-background';
import { AleasButton, AleasRoundButton } from '@/components/aleas/aleas-buttons';
import AleasHead from '@/components/aleas/aleas-head';
import { AleasMainContainer, AleasTitle } from '@/components/aleas/aleas-layout';
import StandardConsole from '@/components/dmx/standard-console';
import { useDmxWriter } from '@/lib/services/dmx/hooks';

const TestOpenDmx = () => {

    const dmxWriter = useDmxWriter();

    const hasOpenDmx = dmxWriter !== null;
    const state = dmxWriter?.state;

    const canOpen = hasOpenDmx && dmxWriter.canOpen;
    const canClose = hasOpenDmx && dmxWriter.canClose;

    const onOpenClicked = () => dmxWriter?.open();
    const onCloseClicked = () => dmxWriter?.close();

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
                    <StandardConsole width={16} />
                    <div>{dmxWriter?.state ?? "Not found"}</div>
                    <div>{dmxWriter?.lastChangeTime ?? "No time"}</div>
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