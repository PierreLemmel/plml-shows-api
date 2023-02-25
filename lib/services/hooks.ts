import { useEffect, useState } from "react";

export type WindowSize = {
    windowWidth: number|undefined,
    windowHeight: number|undefined,
    screenSize: "small"|"normal"|undefined
};

export function useWindowSize(): WindowSize {

    const [windowSize, setWindowSize] = useState<WindowSize>({
        windowWidth: undefined,
        windowHeight: undefined,
        screenSize: undefined
    });

    useEffect(() => {

        if (typeof window !== 'undefined') {

            const handleResize = () => {

                setWindowSize({
                    windowWidth: window.innerWidth,
                    windowHeight: window.innerHeight,
                    screenSize: window.innerWidth <= 768 ? "small" : "normal"
                });
            }
            
            window.addEventListener("resize", handleResize);
            
            handleResize();
            
            return () => window.removeEventListener("resize", handleResize);
        }

    }, []);

    return windowSize;
}