import { useInterval, useTimeout } from "@/lib/services/core/hooks";
import { inverseLerp } from "@/lib/services/core/maths";
import { mean, getStats, Stats } from "@/lib/services/core/stats";
import { RgbColor } from "@/lib/services/core/types";
import { createArray, flattenArray, mergeClasses } from "@/lib/services/core/utils";
import { forwardRef, Ref, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import Image from "next/image";

export interface AsciiArtProps extends React.HTMLAttributes<HTMLDivElement> {
    opacityCharset?: keyof typeof opacityCharMaps;
    textMode?: TextMode;
    text?: string;
    pixelColorTransformation?: (keyof typeof pixelColorTransformationMap) | ColorTransformation;
    textColorTransformation?: (keyof typeof textColorTransformationMap) | ColorTransformation;
    letterTransformation?: (keyof typeof letterTransformationsMap) | LetterTransformation;
    noiseFunction?: NoiseFunction;

    backgroundColor?: string;
    src: string;
    pixelSize?: number;
    charSize?: number;
    fontFamily?: string;
    bold?: boolean;
    italic?: boolean;
    baseImageOpacity?: number;
    pixelsOpacity?: number;
    textOpacity?: number;

    refreshRate?: number;
    scale?: number;
}

export type NoiseFunction = (color: RgbColor, row: number, col: number, t: number, info: AsciiBitmapInfo) => number;

export type TextMode = "OpacityLetters"|"RawText"

export type ColorTransformation = (color: RgbColor, stats: AsciiBitmapStats) => RgbColor

const pixelColorTransformationMap = {
    'none': (color: RgbColor) => color,
    'red': (color: RgbColor) => color.redComponent(),
    'red-framed': (color: RgbColor, stats: AsciiBitmapStats) => {

        const { red: { min, max }} = stats;
        const framed = 255 * inverseLerp(color.r, min, max);

        return new RgbColor(framed, 0, 0);
    },
    'green': (color: RgbColor) => color.greenComponent(),
    'green-framed': (color: RgbColor, stats: AsciiBitmapStats) => {

        const { green: { min, max }} = stats;
        const framed = 255 * inverseLerp(color.g, min, max);

        return new RgbColor(0, framed, 0);
    },
    'blue': (color: RgbColor) => color.blueComponent(),
    'blue-framed': (color: RgbColor, stats: AsciiBitmapStats) => {

        const { blue: { min, max }} = stats;
        const framed = 255 * inverseLerp(color.b, min, max);

        return new RgbColor(0, 0, framed);
    },
    'blackAndWhite': (color: RgbColor) => color.toGrayLevel(),
    'blackAndWhite-framed': (color: RgbColor, stats: AsciiBitmapStats) => {
        
        const { gray: { min, max }} = stats;
        const { r, g, b } = color;
        const gray = mean(r, g, b);

        const framed = 255 * inverseLerp(gray, min, max);
        return RgbColor.grayLevel(framed);
    },
}

const textColorTransformationMap = {
    ...pixelColorTransformationMap,
    "fixed-white": () => RgbColor.white,
    "fixed-red": () => RgbColor.red,
    "fixed-green": () => RgbColor.green,
    "fixed-blue": () => RgbColor.blue,
}

const defaultText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

export type LetterTransformation = (color: RgbColor, stats: AsciiBitmapStats) => number;

const letterTransformationsMap = {
    "none": (color: RgbColor) => {
        const { r, g, b }= color;
        const gray = mean(r, g, b);

        return gray / 255;
    },
    "framed": (color: RgbColor, stats: AsciiBitmapStats) => {
        const { r, g, b } = color;

        const gray = mean(r, g, b);

        const { gray: { min, max }} = stats;

        return inverseLerp(gray, min, max);
    },
}

interface AsciiBitmap {
    widthInChars: number;
    heightInChars: number;
    pixels: RgbColor[][];
    stats: AsciiBitmapStats;
}

export interface AsciiBitmapStats {
    gray: Stats;
    red: Stats;
    green: Stats;
    blue: Stats;
}

interface AsciiBitmapInfo {
    stats: AsciiBitmapStats;
    widthInChars: number;
    heightInChars: number;
}

const opacityCharMaps = {
    default: ' .:;+=xX$',
    complex: ' .`^",:;Il!i><~+_-?][}{1)(|tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$',
    squares: ' ░▒▓',
}

export interface AsciiArtRef {
    downloadImage: (name?: string) => void;
}

const AsciiArt = (props: AsciiArtProps, ref: Ref<AsciiArtRef>) => {
    const {
        opacityCharset,
        className,
        textMode,
        text,
        backgroundColor,
        pixelColorTransformation,
        textColorTransformation,
        letterTransformation,
        src,
        pixelSize,
        charSize,
        fontFamily,
        bold,
        italic,
        baseImageOpacity,
        pixelsOpacity,
        textOpacity,
        noiseFunction,
        refreshRate,
        scale
    } = {
        opacityCharset: "default",
        backgroundColor: 'black',
        textMode: "OpacityLetter" as TextMode,
        text: defaultText,
        pixelColorTransformation: pixelColorTransformationMap['none'],
        textColorTransformation: pixelColorTransformationMap['none'],
        letterTransformation: letterTransformationsMap['framed'],
        pixelSize: 15,
        charSize: 12,
        fontFamily: 'Consolas',
        bold: false,
        italic: false,
        baseImageOpacity: 0,
        pixelsOpacity: 0,
        textOpacity: 1,
        noiseFunction: () => 1,
        refreshRate: 0,
        scale: 1,
        ...props,
    }

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imgCanvasRef = useRef<HTMLCanvasElement>(null);
    const divRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    const downloadImage = useCallback((name?: string) => {
        if (canvasRef.current) {
            const url = canvasRef.current.toDataURL("image/jpg");
            const link = document.createElement("a");
            link.download = name ? `${name}-ascii.jpg` : "ascii-art.jpg";
            link.href = url;
            link.click();
            link.remove();
        }
    }, [])

    useImperativeHandle(ref, () => ({ downloadImage }))
    

    const [bitmap, setBitmap] = useState<AsciiBitmap>();
    const [time, setTime] = useState<number>(0);
    const [imgLoaded, setImgLoaded] = useState<boolean>(false);

    useInterval(({ time: newTime }) => {
        setTime(newTime)
    }, 1000 / refreshRate, [refreshRate], refreshRate !== undefined && refreshRate !== 0)

    useTimeout(() => setImgLoaded(true), 100)

    const {
        clientWidth: containerWidth,
        clientHeight: containerHeight
    } = divRef.current ?? { clientWidth: 0, clientHeight: 0 };

    const {
        width: imgWidth,
        height: imgHeight
    } = imgRef.current ?? { width: 100, height: 100 };

    const imgRatio = imgWidth / imgHeight;
    const containerRatio = containerWidth / containerHeight;

    const { canvasWidth, canvasHeight } = imgRatio > containerRatio ? 
        { 
            canvasWidth: scale * containerWidth,
            canvasHeight: scale * containerWidth / imgRatio
        } :
        { 
            canvasWidth: scale * containerHeight * imgRatio,
            canvasHeight: scale * containerHeight
        }

    useEffect(() => {
        const img = imgRef.current;
        const imgCanvas = imgCanvasRef.current;
        const ctx = imgCanvas?.getContext('2d');
        const container = divRef.current;

        if (img && imgCanvas && ctx && container) {
            
            
            const widthInChars = Math.floor(canvasWidth / (scale * pixelSize));
            const heightInChars = Math.floor(canvasHeight / (scale * pixelSize));
            
            if (widthInChars === 0 || heightInChars === 0) {
                return;
            }
            
            ctx.clearRect(0, 0, imgCanvas.width, imgCanvas.height);
            ctx.drawImage(img, 0, 0, widthInChars, heightInChars);

            const pixels = createArray<RgbColor[]>(widthInChars, () => new Array<RgbColor>(heightInChars));

            for (let row = 0; row < heightInChars; row++) {
                
                for (let col = 0; col < widthInChars; col++) {

                    const { data } = ctx.getImageData(col, row, 1, 1);
                    pixels[col][row] = new RgbColor(data[0], data[1], data[2]);
                }
            }

            const flattened = flattenArray(pixels);

            const stats: AsciiBitmapStats = {
                gray: getStats(flattened.map(({ r, g, b }) => Math.round((r + g + b) / 3))),
                red: getStats(flattened.map(({ r, g, b}) => r)),
                green: getStats(flattened.map(({ r, g, b}) => g)),
                blue: getStats(flattened.map(({ r, g, b}) => b)),
            }

            setBitmap({ widthInChars, heightInChars, pixels, stats });
        }

    }, [src, pixelSize, containerWidth, containerHeight, canvasWidth, canvasHeight, scale, imgLoaded])

    useEffect(() => {
        const canvas = canvasRef.current?.getContext('2d');
        const img = imgRef.current;
        
        if (canvas && img && bitmap) {

            canvas.clearRect(0, 0, canvasWidth, canvasHeight);

            canvas.fillStyle = backgroundColor;
            canvas.fillRect(0, 0, canvasWidth, canvasHeight);

            if (baseImageOpacity > 0) {
                canvas.globalAlpha = baseImageOpacity;
                canvas.drawImage(img, 0, 0, canvasWidth, canvasHeight);
                canvas.globalAlpha = 1;
            }

            const { widthInChars, heightInChars, pixels, stats } = bitmap;

            const pixelW = canvasWidth / widthInChars;
            const pixelH = canvasHeight / heightInChars;

            const charH = scale * charSize;
            canvas.font = `${charH}pt ${bold === true ? 'bold ' : ''}${italic === true ? 'italic ' : ''}${fontFamily}`;

            const textColorTransformer: ColorTransformation = typeof textColorTransformation === 'function' ? textColorTransformation : textColorTransformationMap[textColorTransformation];

            const pixelColorTransformer: ColorTransformation = typeof pixelColorTransformation === 'function' ? pixelColorTransformation : pixelColorTransformationMap[pixelColorTransformation];

            const letterTransformer: LetterTransformation = typeof letterTransformation === 'function' ? letterTransformation : letterTransformationsMap[letterTransformation];


            const letters = opacityCharMaps[opacityCharset as keyof typeof opacityCharMaps];

            const unspacedText = text.replace(/\s+/g, '');

            const bmpInfo: AsciiBitmapInfo = {
                stats,
                widthInChars,
                heightInChars
            }
            for (let row = 0, y = 0, textIndex=0; row < heightInChars; row++, y += pixelH) {
                
                for (let col = 0, x = 0; col < widthInChars; col++, x += pixelW, textIndex++) {

                    const rawColor = pixels[col][row];
                    const noise = noiseFunction(rawColor, row, col, time, bmpInfo)
                    
                    if (pixelsOpacity > 0) {
                        const { r, g, b } = RgbColor.multiply(noise, pixelColorTransformer(rawColor, stats));

                        canvas.fillStyle = `rgb(${r}, ${g}, ${b}, ${pixelsOpacity})`;
                        canvas.fillRect(x, y, pixelW, pixelH);
                    }
                    
                    if (textOpacity > 0) {
                        const { r, g, b } = RgbColor.multiply(noise, textColorTransformer(rawColor, stats));

                        canvas.fillStyle = `rgb(${r}, ${g}, ${b}, ${textOpacity})`;

                        let letter;
                        if (textMode === "OpacityLetters") {
                            const letterIndex = Math.round(letterTransformer(rawColor, stats) * (letters.length - 1));
                            letter = letters[letterIndex];
                        }
                        else {
                            if (textIndex >= unspacedText.length) {
                                textIndex = 0;
                            }
                            letter = unspacedText[textIndex];
                        }

                        const { width: charW } = canvas.measureText(letter);
                    
                        canvas.fillText(letter, x + pixelW / 2 - charW /2, y + pixelH - (pixelH - charH));
                    }
                }
            }
        }
    }, [containerWidth, containerHeight, bitmap, textMode, text, opacityCharset, backgroundColor, pixelColorTransformation, textColorTransformation, src, pixelSize, charSize, fontFamily, bold, italic, baseImageOpacity, pixelsOpacity, textOpacity, noiseFunction, time, letterTransformation, canvasWidth, canvasHeight, scale, imgLoaded])

    

    return <div className={mergeClasses("full", className)}>
        <div className="full relative" ref={divRef}>
            <div className="absolute top-0 left-0 full center-child">
                <canvas className="" width={canvasWidth} height={canvasHeight} ref={canvasRef} style={{
                    transform: `scale(${1/scale})`
                }}/>
            </div>
            <canvas className="absolute top-0 left-0 full hidden" width={containerWidth} height={containerHeight} ref={imgCanvasRef} />
            <Image className="absolute top-0 left-0 hidden" src={src} alt="" ref={imgRef} />
        </div>
    </div>
}



export default forwardRef(AsciiArt);