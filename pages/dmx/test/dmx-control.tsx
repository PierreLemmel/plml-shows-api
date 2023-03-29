import AleasBackground from '@/components/aleas/aleas-background';
import { AleasButton } from '@/components/aleas/aleas-buttons';
import AleasHead from '@/components/aleas/aleas-head';
import { AleasMainContainer, AleasTitle } from '@/components/aleas/aleas-layout';
import DmxSlider from '@/components/dmx/dmx-slider';
import StandardConsole from '@/components/dmx/standard-console';
import { DmxControlContext, useDmxControler } from '@/lib/services/dmx/dmxControl';

const TestDmxControl = () => {

    const dmxControl = useDmxControler();

    const { master, setMaster, blackout, setBlackout } = dmxControl;

    return <DmxControlContext.Provider value={dmxControl}>
        <AleasHead />
        
        <main className="fullscreen relative overflow-hidden">
            
            <AleasBackground />
            <div
                className="absolute top-0 left-0 full center-child"
            >
                <AleasMainContainer>
                    <AleasTitle>
                        Test dmx Control
                    </AleasTitle>
                    
                    <div className="flex flex-row items-center">
                        <DmxSlider value={master} setValue={setMaster} sliderType="Percent" />
                    </div>
                </AleasMainContainer>
            </div>            
        </main>
    </DmxControlContext.Provider>
}

export default TestDmxControl;