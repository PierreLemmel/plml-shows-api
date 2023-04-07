//@see: https://dev.to/patopitaluga/ascii-art-pixel-art-in-js-2oij

import { useWindowSize } from "@/lib/services/layout/responsive";
import { useEffect, useRef, useState } from "react";

export interface AsciiArtProps extends React.HTMLAttributes<HTMLDivElement> {
    charset?: keyof typeof brightnessCharMap;
    backgroundColor?: string;
    imgFit?: ImageFit;
    src: string;
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
        src
    } = {
        charset: "default",
        backgroundColor: 'black',
        imgFit: "Fit",
        ...props,
    }

    const windowSize = useWindowSize();

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const divRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    const { clientWidth: containerWidth, clientHeight: containerHeight } = divRef.current
        || { clientWidth:0, clientHeight: 0 };

    useEffect(() => {
        
        const canvas = canvasRef.current?.getContext('2d');
        const img = imgRef.current;
        
        if (canvas && img) {

            canvas.fillStyle = backgroundColor;
            canvas.fillRect(0, 0, containerWidth, containerHeight);

            const {
                width: imgWidth,
                height: imgHeight
            } = img;

            let sx = 0;
            let sy = 0;
            let sw = imgWidth;
            let sh = imgHeight;

            let dx = 0;
            let dy = 0;
            let dw = containerWidth;
            let dh = containerHeight;

            const imgRatio = imgWidth / imgHeight;
            const canvasRatio = containerWidth / containerHeight;

            switch (imgFit) {
                case "Fit":

                    if (imgRatio > canvasRatio) {
                        dh = containerWidth * imgRatio;
                        dw = containerWidth;

                        dy = (containerHeight - dh) / 2;
                    }
                    else {
                        dw = containerHeight / imgRatio;
                        dh = containerHeight;

                        dx = (containerWidth - dw) / 2;
                    }
                    
                    break;

                case "Cover":

                    if (imgRatio > canvasRatio) {
                        sw = imgWidth * canvasRatio;
                        sx = (imgWidth - sw) / 2;
                    }
                    else {
                        sh = imgHeight / canvasRatio;
                        sy = (imgHeight - sh) / 2;
                    }
                    
                    break;
            }

            canvas.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
        }

    }, [containerWidth, containerHeight, backgroundColor, imgFit])

    return <div className={"full" + " " + (className ?? "")}>
        <div className="full relative" ref={divRef}>
            <canvas className="absolute top-0 left-0 full" width={containerWidth} height={containerHeight} ref={canvasRef} />
            <img className="absolute top-0 left-0 hidden" src={src} ref={imgRef} />
        </div>
    </div>
}

export default AsciiArt;