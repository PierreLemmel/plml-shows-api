import AleasHead from '@/components/aleas/aleas-head'
import AsciiArt from '@/components/ascii/ascii-art';

const TestAscii = () => <>
	<AleasHead />
	<main className="fullscreen relative overflow-hidden bg-slate-900">
		<AsciiArt
			charset="default"
			className='p-0'
			imgFit='Fit'
			src='/test/sysex.jpg'
			charSize={12}
		/>
	</main>
</>

export default TestAscii;