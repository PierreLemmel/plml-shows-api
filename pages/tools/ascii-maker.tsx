import { AleasButton } from '@/components/aleas/aleas-buttons';
import AleasFileUpload from '@/components/aleas/aleas-file-upload';
import AleasHead from '@/components/aleas/aleas-head'
import AleasSlider from '@/components/aleas/aleas-slider';
import AsciiArt, { AsciiArtRef, AsciiBitmapStats } from '@/components/ascii/ascii-art';
import { inverseLerp } from '@/lib/services/core/maths';
import { mean } from '@/lib/services/core/stats';
import { RgbColor } from '@/lib/services/core/types';
import { randomBool, sequence } from '@/lib/services/core/utils';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const TestAscii = () => {

	const [threshold, setThreshold] = useState<number>(8);
	const [floor, setFloor] = useState<number>(20);

	const text = useMemo(() => sequence(1000).map(() => randomBool() ? 1 : 0).join(""), [])
	const colorTransformer = useCallback((color: RgbColor, stats: AsciiBitmapStats) => {

		const { gray: { min, max } } = stats;
		const { r, g, b } = color;
		const gray = mean(r, g, b);


		if (gray < threshold) {
			return RgbColor.black;
		}
		else {
			const framed = floor + (255 - floor) * inverseLerp(gray, min, max);
			return RgbColor.grayLevel(framed);
		}
	}, [threshold, floor]);

	const asciiArtRef = useRef<AsciiArtRef>(null);

	const [size, setSize] = useState<number>(5);
	const [scale, setScale] = useState<number>(3);

	const [baseImageOpacity, setBaseImageOpacity] = useState<number>(0.20);
	const [pixelsOpacity, setPixelsOpacity] = useState<number>(0.10);

	const [image, setImage] = useState<string|null>(null);

	const onImageUpload = useCallback((files: FileList | null) => {
		if (files && files.length > 0) {
			const file = files[0];
			
			if (file.type.startsWith("image")) {
				const url = URL.createObjectURL(file);
				setImage(url);
			}
		}
		
	}, [])

	const lastImageRef = useRef<string|null>(null);
	useEffect(() => {
		if (lastImageRef.current) {
			URL.revokeObjectURL(lastImageRef.current);
		}
		lastImageRef.current = image;
	}, [image])

	return <>
		<AleasHead title="Ascii Maker" />
		<main className="fullscreen overflow-hidden bg-slate-900 flex flex-row justify-between items-center gap-8">
			<div className='p-3 centered-col gap-2'>
				<div className='text-white'>Size: {size}</div>
				<AleasSlider
					orientation='horizontal'
					className='mb-4'
					value={size}
					setValue={setSize}
					min={1.5}
					max={10}
					step={0.5}
				/>
				<div className='text-white'>Base image opacity: {baseImageOpacity}</div>
				<AleasSlider
					orientation='horizontal'
					className='mb-4'
					value={baseImageOpacity}
					setValue={setBaseImageOpacity}
					min={0}
					max={1}
					step={0.05}
				/>
				<div className='text-white'>Pixels Opacity: {pixelsOpacity}</div>
				<AleasSlider
					orientation='horizontal'
					className='mb-4'
					value={pixelsOpacity}
					setValue={setPixelsOpacity}
					min={0}
					max={1}
					step={0.05}
				/>
				<div className='text-white'>Threshold: {threshold}</div>
				<AleasSlider
					orientation='horizontal'
					className='mb-4'
					value={threshold}
					setValue={setThreshold}
					min={0}
					max={50}
					step={2}
				/>
				<div className='text-white'>Floor: {floor}</div>
				<AleasSlider
					orientation='horizontal'
					className='mb-4'
					value={floor}
					setValue={setFloor}
					min={0}
					max={150}
					step={5}
				/>
				<div className='text-white'>Scale : {scale}</div>
				<AleasSlider
					orientation='horizontal'
					className='mb-4'
					value={scale}
					setValue={setScale}
					min={1}
					max={5}
					step={0.5}
				/>
				<AleasButton
					onClick={() => asciiArtRef.current?.downloadImage("ascii")}
					className='scale-75 hover:scale-[80%]'
					disabled={image === null}
				>
					Download
				</AleasButton>
			</div>

			<div className="flex-grow full">
				{image ? <div className="full centered-col gap-4 py-6">
					<AsciiArt
						ref={asciiArtRef}
						className="flex-grow"

						textMode="RawText"
						text={text}

						src={image}

						pixelSize={size}
						charSize={size - 1}
						baseImageOpacity={baseImageOpacity}
						pixelsOpacity={pixelsOpacity}

						pixelColorTransformation="none"
						textColorTransformation={colorTransformer}
						letterTransformation="framed"

						scale={scale}
					/>
					<AleasButton onClick={() => setImage(null)}>Delete</AleasButton>
				</div>
				 : 
				<div className="full center-child text-white font-consolas">
					<AleasFileUpload text="Uploadez une image à transformer" onUpload={onImageUpload} multiple={false} />
				</div>}
			</div>
			
		</main>
	</>;
}

export default TestAscii;