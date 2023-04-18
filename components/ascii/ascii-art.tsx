//@see: https://dev.to/patopitaluga/ascii-art-pixel-art-in-js-2oij

import { useEffectAsync } from "@/lib/services/core/hooks";
import { RgbColor } from "@/lib/services/core/types";
import { mergeClasses } from "@/lib/services/core/utils";
import { useWindowSize } from "@/lib/services/layout/responsive";
import { useEffect, useRef, useState } from "react";

export interface AsciiArtProps extends React.HTMLAttributes<HTMLDivElement> {
    charset?: keyof typeof brightnessCharMap;
    backgroundColor?: string;
    imgFit?: ImageFit;
    src: string;
    charSize?: number;
}

interface AsciiBitmap {
    widthInChars: number;
    heightInChars: number;
    pixels: RgbColor[][];
}

export type ImageFit = "Stretch"|"Fit"|"Cover";

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
        imgFit,
        src,
        charSize
    } = {
        charset: "default",
        backgroundColor: 'black',
        imgFit: "Fit",
        charSize: 12,
        ...props,
    }

    const windowSize = useWindowSize();

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imgCanvasRef = useRef<HTMLCanvasElement>(null);
    const divRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    const [bitmap, setBitmap] = useState<AsciiBitmap>();

    useEffect(() => {

        const img = imgRef.current;
        const imgCanvas = imgCanvasRef.current;
        const ctx = imgCanvas?.getContext('2d');
        const container = divRef.current;

        if (img && imgCanvas && ctx && container) {

            const { clientWidth: containerWidth, clientHeight: containerHeight } = container;

            const widthInChars = Math.floor(img.width / charSize);
            const heightInChars = Math.floor(img.height / charSize);

            ctx.clearRect(0, 0, imgCanvas.width, imgCanvas.height);

            ctx.drawImage(img, 0, 0, widthInChars, heightInChars);

            const pixels = new Array<RgbColor[]>(heightInChars)
            for (let i = 0; i < heightInChars; i++) {
                
                pixels[i] = new Array<RgbColor>(widthInChars);
                for (let j = 0; j < widthInChars; j++) {

                    const { data } = ctx.getImageData(i, j, 1, 1);
                    pixels[i][j] = new RgbColor(data[0], data[1], data[2]);
                }
            }

            setBitmap({ widthInChars, heightInChars, pixels });
        }

    }, [src, charSize, containerWidth, containerHeight])

    useEffect(() => {
        
        const canvas = canvasRef.current?.getContext('2d');
        const img = imgRef.current;
        
        if (canvas && img && bitmap) {

            canvas.fillStyle = backgroundColor;
            canvas.fillRect(0, 0, containerWidth, containerHeight);

            const {
                width: imgWidth,
                height: imgHeight
            } = img;

            let srcX0 = 0;
            let srcY0 = 0;
            let srcW = imgWidth;
            let srcH = imgHeight;

            let x0 = 0;
            let y0 = 0;
            let w = containerWidth;
            let h = containerHeight;

            const imgRatio = imgWidth / imgHeight;
            const canvasRatio = containerWidth / containerHeight;

            switch (imgFit) {
                case "Fit":

                    if (imgRatio > canvasRatio) {
                        h = containerWidth / imgRatio;
                        w = containerWidth;

                        y0 = (containerHeight - h) / 2;
                    }
                    else {
                        w = containerHeight * imgRatio;
                        h = containerHeight;

                        x0 = (containerWidth - w) / 2;
                    }
                    
                    break;

                case "Cover":

                    if (imgRatio > canvasRatio) {
                        srcW = imgWidth * canvasRatio;
                        srcX0 = (imgWidth - srcW) / 2;
                    }
                    else {
                        srcH = imgHeight / canvasRatio;
                        srcY0 = (imgHeight - srcH) / 2;
                    }
                    
                    break;
            }

            // canvas.drawImage(img, srcX0, srcY0, srcW, srcH, x0, y0, w, h);

            const { widthInChars, heightInChars, pixels } = bitmap;

            console.log({ widthInChars, heightInChars })

            for (let i = 0, y = 0; i < heightInChars; i++, y += charSize) {
                
                for (let j = 0, x = 0; j < widthInChars; j++, x += charSize) {

                    const color = pixels[i][j];
                    canvas.fillStyle = color.toRgbString();
                    canvas.fillRect(x, y, charSize, charSize);
                }
            }
        }

    }, [bitmap, containerWidth, containerHeight, backgroundColor, imgFit])


    return <div className={mergeClasses("full", className)}>
        <div className="full relative" ref={divRef}>
            <canvas className="absolute top-0 left-0 full" width={containerWidth} height={containerHeight} ref={canvasRef} />
            <canvas className="absolute top-0 left-0 full hidden" width={containerWidth} height={containerHeight} ref={imgCanvasRef} />
            <img className="absolute top-0 left-0 hidden" src={src} ref={imgRef} />
        </div>
    </div>
}

export default AsciiArt;