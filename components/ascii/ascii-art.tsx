//@see: https://dev.to/patopitaluga/ascii-art-pixel-art-in-js-2oij

import { inverseLerp } from "@/lib/services/core/mathf";
import { mean, getStats, Stats } from "@/lib/services/core/stats";
import { RgbColor } from "@/lib/services/core/types";
import { createArray, flattenArray, mergeClasses } from "@/lib/services/core/utils";
import { useWindowSize } from "@/lib/services/layout/responsive";
import { useEffect, useRef, useState } from "react";

export interface AsciiArtProps extends React.HTMLAttributes<HTMLDivElement> {
    charset?: keyof typeof brightnessCharMap;
    colorTransformation?: (keyof typeof colorTransformationsMap) | ColorTransformation;
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

export type ColorTransformation = (color: RgbColor, stats: AsciiBitmapStats) => RgbColor

const colorTransformationsMap = {
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

const brightnessCharMap = {
    default: ' .:;+=xX$',
    complex: ' .`^",:;Il!i><~+_-?][}{1)(|tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$',
    squares: ' ░▒▓█',
}

const AsciiArt = (props: AsciiArtProps) => {
    const {
        charset,
        className,
        backgroundColor,
        colorTransformation,
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
        charset: "default",
        backgroundColor: 'black',
        colorTransformation: colorTransformationsMap['none'],
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

            canvas.clearRect(0, 0, containerWidth, containerHeight);

            canvas.fillStyle = backgroundColor;
            canvas.fillRect(0, 0, containerWidth, containerHeight);

            if (baseImageOpacity > 0) {
                
                canvas.drawImage(img, 0, 0, containerWidth, containerHeight);
            }

            const { widthInChars, heightInChars, pixels, stats } = bitmap;

            const pixelW = canvasWidth / widthInChars;
            const pixelH = canvasHeight / heightInChars;

            canvas.font = `${bold ? 'bold' : ''} ${italic ? 'italic' : ''} ${fontFamily} ${charSize}px`;
            const charH = charSize;

            const transormer: ColorTransformation = typeof colorTransformation === 'function' ? colorTransformation : colorTransformationsMap[colorTransformation];

            for (let row = 0, y = 0; row < heightInChars; row++, y += pixelH) {
                
                for (let col = 0, x = 0; col < widthInChars; col++, x += pixelW) {

                    const color = transormer(pixels[col][row], stats);

                    const { r, g, b } = color;

                    if (pixelsOpacity > 0) {
                        canvas.fillStyle = `rgb(${r}, ${g}, ${b}, ${pixelsOpacity})`;
                        canvas.fillRect(x, y, pixelW, pixelH);
                    }

                    if (textOpacity > 0) {

                        canvas.strokeStyle = `rgb(${r}, ${g}, ${b}, ${textOpacity})`;
                        const letter = "$";

                        const { width: charW } = canvas.measureText(letter);
                    
                        canvas.strokeText(letter, x + pixelW / 2 - charW /2, y + pixelH - (pixelH - charH));
                    }
                }
            }
        }

    }, [bitmap, containerWidth, containerHeight, backgroundColor, bold, italic, fontFamily, charSize, baseImageOpacity, pixelsOpacity, textOpacity, colorTransformation])


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