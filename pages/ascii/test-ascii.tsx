import AleasHead from '@/components/aleas/aleas-head'
import AsciiArt from '@/components/ascii/ascii-art';

const TestAscii = () => <>
	<AleasHead title='Test Ascii' />
	<main className="fullscreen relative overflow-hidden bg-slate-900">
		<AsciiArt
			opacityCharset="complex"
			className='p-0'
			textMode="RawText"
			// src='/img/aleas-1200x1200.jpg'
			src='/test/sysex.jpg'
			pixelSize={15}
			charSize={10}
			baseImageOpacity={0.2}
			pixelsOpacity={0}
			pixelColorTransformation="none"
			textColorTransformation="none"
			letterTransformation="framed"
		/>
	</main>
</>

export default TestAscii;