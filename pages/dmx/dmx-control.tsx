import { AleasButton } from '@/components/aleas/aleas-buttons';
import { AleasMainLayout } from '@/components/aleas/aleas-layout';
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
    } = dmxControl;

    return <DmxControlContext.Provider value={dmxControl}>
        <AleasMainLayout title="Dmx Control">

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

        </AleasMainLayout>
        
    </DmxControlContext.Provider>
}

export default TestDmxControl;