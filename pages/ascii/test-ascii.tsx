import AleasHead from '@/components/aleas/aleas-head'
import AsciiArt from '@/components/ascii/ascii-art';

const TestAscii = () => <>
	<AleasHead title='Test Ascii' />
	<main className="fullscreen relative overflow-hidden bg-slate-900">
		<AsciiArt
			className='p-0'

			textMode="RawText"
			text="Ce projet s’intéresse à expérimenter le hasard en théâtre improvisé en faisant usage des nouvelles technologies.
			Il se place dans une période où les nouvelles technologies et notamment les intelligences artificielles génératives prennent une part de plus en plus importante dans le domaine artistique (génération de textes, d’images, de musiques…). Cela suscite de nombreuses interrogations sur le rôle des artistes dans différents domaines et sur le futur de la création artistique.
			Dans ce contexte, il s’agira de mettre ces nouvelles technologies à profit afin de créer un environnement sonore et lumineux - aléatoire ou pseudo-aléatoire - dans lequel les comédien-ne-s improvisateur-ice-s peuvent expérimenter et auxquels ils doivent s’adapter. 
			Nous pensons que le hasard étant par nature quelque chose d’incontrolable, il peut être une source d’imprévus et de création extraordinaire. Il nous ramène à une forme d’improvisation la plus brute et la plus pure qui soit. L’objectif de ce projet est à la fois de développer différents dispositifs techniques à mettre au service des artistes ainsi que de créer collectivement - avec différents artistes venus d’expériences et de domaines divers - de nouvelles façons d’aborder la scène en s’abandonnant complètement au hasard.
			"

			// textMode="OpacityLetters"
			// opacityCharset="complex"

			// src='/img/aleas-1200x1200.jpg'
			// src='/test/sysex.jpg'
			src='/test/test-aleas.jpg'
			
			pixelSize={9}
			charSize={8}
			baseImageOpacity={0.05}
			pixelsOpacity={0.15}
			
			pixelColorTransformation="none"
			textColorTransformation="none"
			letterTransformation="framed"

			// noiseFunction={() => Math.max(1 + 0.3 * 2 * (Math.random()- 0.5), 1)}
			// noiseFunction={(color, row, col, t, info) => Math.max(1 + 0.25 * Math.sin(row + col + 1.2 * t / 1000), 0.1)}
			// refreshRate={30}
		/>
	</main>
</>

export default TestAscii;