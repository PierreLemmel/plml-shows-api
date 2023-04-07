import AleasHead from '@/components/aleas/aleas-head'
import AsciiArt from '@/components/ascii/ascii-art';

const TestAscii = () => <>
	<AleasHead />
	<main className="fullscreen relative overflow-hidden bg-slate-900">
		<AsciiArt
			charset="default"
			className='p-0'
			imgFit='Cover'
			src='/test/sysex.jpg'
		/>
	</main>
</>

export default TestAscii;