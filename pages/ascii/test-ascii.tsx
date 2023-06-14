import { AleasButton } from '@/components/aleas/aleas-buttons';
import AleasHead from '@/components/aleas/aleas-head'
import AsciiArt, { AsciiArtRef, AsciiBitmapStats } from '@/components/ascii/ascii-art';
import { inverseLerp } from '@/lib/services/core/mathf';
import { mean } from '@/lib/services/core/stats';
import { RgbColor } from '@/lib/services/core/types';
import { randomBool, sequence } from '@/lib/services/core/utils';
import { useCallback, useMemo, useRef } from 'react';

const TestAscii = () => {

	const text = useMemo(() => sequence(1000).map(() => randomBool() ? 1 : 0).join(""), [])
	const colorTransformer = useCallback((color: RgbColor, stats: AsciiBitmapStats) => {

		const { gray: { min, max } } = stats;
		const { r, g, b } = color;
		const gray = mean(r, g, b);

		const a0 = 20;
		const a1 = 100;

		if (gray < a0) {
			return RgbColor.black;
		}
		else {
			const framed = 255 * inverseLerp(gray, min, max);
			return RgbColor.grayLevel(framed);
		}
	}, []);

	const asciiArtRef = useRef<AsciiArtRef>(null);

	return <>
		<AleasHead title='Test Ascii' />
		<main className="fullscreen relative overflow-hidden bg-slate-900">
			<AsciiArt
				ref={asciiArtRef}
				className='p-0 full top-0 left-0 absolute'

				textMode="RawText"
				// textMode="OpacityLetters"
				text={text}

				// opacityCharset="complex"
				// src='/img/aleas-1200x1200.jpg'
				// src='/test/sysex.jpg'
				src='/test/test-aleas.jpg'

				pixelSize={9}
				charSize={8}
				baseImageOpacity={0.05}
				pixelsOpacity={0.15}

				pixelColorTransformation="none"
				// textColorTransformation="none"
				textColorTransformation={colorTransformer}
				letterTransformation="framed" />
			<AleasButton
				onClick={asciiArtRef.current?.downloadImage}
				className='left-3 bottom-3 absolute scale-75 hover:scale-[80%]'
			>
				Download
			</AleasButton>
		</main>
	</>;
}

export default TestAscii;