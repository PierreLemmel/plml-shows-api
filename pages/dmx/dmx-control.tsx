import AleasBackground from '@/components/aleas/aleas-background';
import { AleasButton } from '@/components/aleas/aleas-buttons';
import AleasHead from '@/components/aleas/aleas-head';
import { AleasMainContainer, AleasTitle } from '@/components/aleas/aleas-layout';
import DmxButton from '@/components/dmx/dmx-button';
import DmxSlider from '@/components/dmx/dmx-slider';
import DmxToggle from '@/components/dmx/dmx-toggle';
import StandardConsole from '@/components/dmx/standard-console';
import { DmxControlContext, useDmxControl } from '@/lib/services/dmx/dmxControl';

const TestDmxControl = () => {

    const dmxControl = useDmxControl();

    const {
        master, setMaster,
        blackout, setBlackout,
        fade, setFade,
        clear,
        writer: {
            state, canOpen, canClose, open, close
        }
    } = dmxControl;

    return <DmxControlContext.Provider value={dmxControl}>
        <AleasHead />
        
        <main className="fullscreen relative overflow-hidden">
            
            <AleasBackground />
            <div
                className="absolute top-0 left-0 full center-child"
            >
                <AleasMainContainer>
                    <AleasTitle>
                        Dmx Control
                    </AleasTitle>
                    <div className="flex flex-row gap-3 items-center">
                        <StandardConsole width={16} displayValues={true} />
                        <div className="flex flex-col gap-3 items-center">
                            <div>Fade</div>
                            <DmxSlider value={fade} setValue={setFade} sliderType="Value" />
                            <DmxToggle className="mt-2" toggled={false} onClick={clear}>
                                Clear
                            </DmxToggle>
                        </div>
                        <div className="flex flex-col gap-3 items-center">
                            <div>Master</div>
                            <DmxSlider value={master} setValue={setMaster} sliderType="Percent" />
                            <DmxToggle className="mt-2" toggled={blackout} onClick={() => setBlackout(!blackout)}>
                                B.O.
                            </DmxToggle>
                        </div>
                    </div>
                    <div>{state}</div>
                    <div className="centered-row gap-6">
                        <AleasButton
                            onClick={open}
                            spinning={state === "Opening" ? true : undefined}
                            disabled={!canOpen}
                        >
                            Open
                        </AleasButton>
                        <AleasButton
                            onClick={close}
                            spinning={state === "Closing" ? true : undefined}
                            disabled={!canClose}
                        >
                            Close
                        </AleasButton>
                    </div>
                </AleasMainContainer>
            </div>            
        </main>
    </DmxControlContext.Provider>
}

export default TestDmxControl;