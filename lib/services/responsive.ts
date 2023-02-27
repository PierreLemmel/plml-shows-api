import { useEffect, useState } from "react";

export type ScreenSize = "sm"|"md"|"lg"|"xl"|"2xl"

export type WindowSize = {
    windowWidth?: number,
    windowHeight?: number,
    screenSize?: ScreenSize
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

                const {
                    innerWidth: windowWidth,
                    innerHeight: windowHeight
                } = window;

                let screenSize: ScreenSize;
                if (windowWidth < 768) {
                    screenSize = "sm"
                }
                else if (windowWidth < 1024) {
                    screenSize = "md"
                }
                else if (windowWidth < 1280) {
                    screenSize = "lg"
                }
                else if (windowWidth < 1556) {
                    screenSize = "xl"
                }
                else {
                    screenSize = "2xl"
                }

                setWindowSize({
                    windowWidth,
                    windowHeight,
                    screenSize
                });
            }
            
            window.addEventListener("resize", handleResize);
            
            handleResize();
            
            return () => window.removeEventListener("resize", handleResize);
        }

    }, []);

    return windowSize;
}

const ssValueMap = {
    "sm": 0,
    "md": 1,
    "lg": 2,
    "xl": 3,
    "2xl": 4
}

export function greaterThanOrEqual(lhs: ScreenSize, rhs: ScreenSize): boolean {
    return ssValueMap[lhs] >= ssValueMap[rhs];
}