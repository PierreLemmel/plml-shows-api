import AleasBackground from '@/components/aleas/aleas-background';
import { AleasButton, AleasRoundButton } from '@/components/aleas/aleas-buttons';
import AleasHead from '@/components/aleas/aleas-head';
import { AleasMainContainer, AleasTitle } from '@/components/aleas/aleas-layout';

export default function BilletReduc() {


    const canPlay = true;
    const canStop = true;

    const onPlayClicked = () => {
        console.log("Play")
    }

    const onStopClicked = () => {
        console.log("Stop")
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
                    <div className="centered-row gap-6">
                        <AleasButton
                            onClick={onPlayClicked}
                            disabled={!canPlay}
                        >
                            Play
                        </AleasButton>
                        <AleasButton
                            onClick={onStopClicked}
                            disabled={!canStop}
                        >
                            Stop
                        </AleasButton>
                    </div>
                </AleasMainContainer>
            </div>            
        </main>
    </>
}