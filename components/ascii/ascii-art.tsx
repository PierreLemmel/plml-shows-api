//@see: https://dev.to/patopitaluga/ascii-art-pixel-art-in-js-2oij

import { inverseLerp } from "@/lib/services/core/mathf";
import { mean, getStats, Stats } from "@/lib/services/core/stats";
import { RgbColor } from "@/lib/services/core/types";
import { createArray, flattenArray, mergeClasses } from "@/lib/services/core/utils";
import { useWindowSize } from "@/lib/services/layout/responsive";
import { useEffect, useRef, useState } from "react";

export interface AsciiArtProps extends React.HTMLAttributes<HTMLDivElement> {
    opacityCharset?: keyof typeof opacityCharMaps;
    textMode?: TextMode;
    text?: string;
    pixelColorTransformation?: (keyof typeof pixelColorTransformationMap) | ColorTransformation;
    textColorTransformation?: (keyof typeof textColorTransformationMap) | ColorTransformation;
    letterTransformation?: (keyof typeof letterTransformationsMap) | LetterTransformation;
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
}

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
    "fixed-white": () => RgbColor.white(),
    "fixed-red": () => RgbColor.red(),
    "fixed-green": () => RgbColor.green(),
    "fixed-blue": () => RgbColor.blue(),
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

interface AsciiBitmapStats {
    gray: Stats;
    red: Stats;
    green: Stats;
    blue: Stats;
}

const opacityCharMaps = {
    default: ' .:;+=xX$',
    complex: ' .`^",:;Il!i><~+_-?][}{1)(|tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$',
    squares: ' ░▒▓',
}

const AsciiArt = (props: AsciiArtProps) => {
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
        ...props,
    }

    const windowSize = useWindowSize();

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imgCanvasRef = useRef<HTMLCanvasElement>(null);
    const divRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    const [bitmap, setBitmap] = useState<AsciiBitmap>();

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
            canvasWidth: containerWidth,
            canvasHeight: containerWidth / imgRatio
        } :
        { 
            canvasWidth: containerHeight * imgRatio,
            canvasHeight: containerHeight
        }


    useEffect(() => {

        const img = imgRef.current;
        const imgCanvas = imgCanvasRef.current;
        const ctx = imgCanvas?.getContext('2d');
        const container = divRef.current;

        if (img && imgCanvas && ctx && container) {
            
            
            const widthInChars = Math.floor(canvasWidth / pixelSize);
            const heightInChars = Math.floor(canvasHeight / pixelSize);
            
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

    }, [src, pixelSize, containerWidth, containerHeight])

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

            canvas.font = `${charSize}px ${bold ? 'bold ' : ''}${italic ? 'italic ' : ''}${fontFamily}`;
            const charH = charSize;

            const textColorTransformer: ColorTransformation = typeof textColorTransformation === 'function' ? textColorTransformation : textColorTransformationMap[textColorTransformation];

            const pixelColorTransformer: ColorTransformation = typeof pixelColorTransformation === 'function' ? pixelColorTransformation : pixelColorTransformationMap[pixelColorTransformation];

            const letterTransformer: LetterTransformation = typeof letterTransformation === 'function' ? letterTransformation : letterTransformationsMap[letterTransformation];


            const letters = opacityCharMaps[opacityCharset as keyof typeof opacityCharMaps];

            const unspacedText = text.replace(/\s+/g, '');

            for (let row = 0, y = 0, textIndex=0; row < heightInChars; row++, y += pixelH) {
                
                for (let col = 0, x = 0; col < widthInChars; col++, x += pixelW, textIndex++) {

                    const rawColor = pixels[col][row];
                    
                    if (pixelsOpacity > 0) {
                        const { r, g, b } = pixelColorTransformer(rawColor, stats);

                        canvas.fillStyle = `rgb(${r}, ${g}, ${b}, ${pixelsOpacity})`;
                        canvas.fillRect(x, y, pixelW, pixelH);
                    }
                    
                    if (textOpacity > 0) {
                        const { r, g, b } = textColorTransformer(rawColor, stats);

                        canvas.strokeStyle = `rgb(${r}, ${g}, ${b}, ${textOpacity})`;

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
                    
                        canvas.strokeText(letter, x + pixelW / 2 - charW /2, y + pixelH - (pixelH - charH));
                    }
                }
            }
        }

    }, [containerWidth, containerHeight, bitmap, textMode, text, opacityCharset, backgroundColor, pixelColorTransformation, textColorTransformation, src, pixelSize, charSize, fontFamily, bold, italic, baseImageOpacity, pixelsOpacity, textOpacity])

    return <div className={mergeClasses("full", className)}>
        <div className="full relative" ref={divRef}>
            <div className="absolute top-0 left-0 full center-child">
                <canvas className="" width={canvasWidth} height={canvasHeight} ref={canvasRef} />
            </div>
            <canvas className="absolute top-0 left-0 full hidden" width={containerWidth} height={containerHeight} ref={imgCanvasRef} />
            <img className="absolute top-0 left-0 hidden" src={src} ref={imgRef} />
        </div>
    </div>
}

export default AsciiArt;