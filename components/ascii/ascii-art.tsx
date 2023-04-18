//@see: https://dev.to/patopitaluga/ascii-art-pixel-art-in-js-2oij

import { RgbColor } from "@/lib/services/core/types";
import { createArray, mergeClasses } from "@/lib/services/core/utils";
import { useWindowSize } from "@/lib/services/layout/responsive";
import { useEffect, useRef, useState } from "react";

export interface AsciiArtProps extends React.HTMLAttributes<HTMLDivElement> {
    charset?: keyof typeof brightnessCharMap;
    backgroundColor?: string;
    src: string;
    charSize?: number;
}

interface AsciiBitmap {
    widthInChars: number;
    heightInChars: number;
    pixels: RgbColor[][];
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
        src,
        charSize
    } = {
        charset: "default",
        backgroundColor: 'black',
        charSize: 12,
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

            const widthInChars = Math.floor(canvasWidth / charSize);
            const heightInChars = Math.floor(canvasHeight / charSize);

            ctx.clearRect(0, 0, imgCanvas.width, imgCanvas.height);

            ctx.drawImage(img, 0, 0, widthInChars, heightInChars);

            const pixels = createArray<RgbColor[]>(widthInChars, () => new Array<RgbColor>(heightInChars));
            for (let row = 0; row < heightInChars; row++) {
                
                for (let col = 0; col < widthInChars; col++) {

                    const { data } = ctx.getImageData(col, row, 1, 1);
                    pixels[col][row] = new RgbColor(data[0], data[1], data[2]);
                }
            }

            setBitmap({ widthInChars, heightInChars, pixels });
        }

    }, [src, charSize, containerWidth, containerHeight])

    useEffect(() => {
        
        const canvas = canvasRef.current?.getContext('2d');
        const img = imgRef.current;
        
        if (canvas && img && bitmap) {

            canvas.clearRect(0, 0, containerWidth, containerHeight);

            canvas.fillStyle = backgroundColor;
            canvas.fillRect(0, 0, containerWidth, containerHeight);

            const { widthInChars, heightInChars, pixels } = bitmap;

            const charW = canvasWidth / widthInChars;
            const charH = canvasHeight / heightInChars;

            for (let row = 0, y = 0; row < heightInChars; row++, y += charH) {
                
                for (let col = 0, x = 0; col < widthInChars; col++, x += charW) {

                    const color = pixels[col][row];
                    canvas.fillStyle = color.toRgbString();
                    // canvas.fillRect(x, y, charSize, charSize);

                    // canvas.strokeStyle = color.toGrayLevel().toRgbString();
                    canvas.strokeStyle = color.toRgbString();
                    canvas.strokeText("@", x, y)
                }
            }
        }

    }, [bitmap, containerWidth, containerHeight, backgroundColor])


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