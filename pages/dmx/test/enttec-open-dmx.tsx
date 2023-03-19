import AleasBackground from '@/components/aleas/aleas-background';
import { AleasButton, AleasRoundButton } from '@/components/aleas/aleas-buttons';
import AleasHead from '@/components/aleas/aleas-head';
import { AleasMainContainer, AleasTitle } from '@/components/aleas/aleas-layout';
import { useEnttecOpenDmx } from '@/lib/services/dmx/hooks';

const TestOpenDmx = () => {

    const openDmx = useEnttecOpenDmx();

    const hasOpenDmx = openDmx !== null;
    const state = openDmx?.state;

    const canOpen = hasOpenDmx && openDmx.canOpen;
    const canClose = hasOpenDmx && openDmx.canClose;

    const onOpenClicked = async () => {
        openDmx?.open();
    }

    const onCloseClicked = async () => {
        openDmx?.close();
    }


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
                    <div>{openDmx ? "Device found" : "No device"}</div>
                    <div>{openDmx?.state ?? "Not found"}</div>
                    <div className="centered-row gap-6">
                        <AleasButton
                            onClick={onOpenClicked}
                            spinning={state === "Opening"}
                            disabled={!canOpen}
                        >
                            Open
                        </AleasButton>
                        <AleasButton
                            onClick={onCloseClicked}
                            spinning={state === "Closing"}
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