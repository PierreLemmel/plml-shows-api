//@see: https://dev.to/patopitaluga/ascii-art-pixel-art-in-js-2oij

export interface AsciiArtProps {
    charset?: BrightnessCharset;
}

const brightnessCharMap = {
    default: ' .`^",:;Il!i><~+_-?][}{1)(|tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$'
}

type BrightnessCharset = keyof typeof brightnessCharMap;

const AsciiArt = (props: AsciiArtProps) => {
    const { charset } = {
        ...props,
        charset: "default"
    }
}

export default AsciiArt;