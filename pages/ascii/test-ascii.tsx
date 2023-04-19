import AleasHead from '@/components/aleas/aleas-head'
import AsciiArt from '@/components/ascii/ascii-art';

const TestAscii = () => <>
	<AleasHead title='Test Ascii' />
	<main className="fullscreen relative overflow-hidden bg-slate-900">
		<AsciiArt
			charset="default"
			className='p-0'
			src='/test/sysex.jpg'
			pixelSize={15}
			charSize={11}
			baseImageOpacity={0.3}
			pixelsOpacity={0.3}
			colorTransformation="none"
		/>
	</main>
</>

export default TestAscii;