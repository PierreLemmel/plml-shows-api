import { getAleasCodeFiles } from "@/lib/services/aleas/aleas-api";
import { AleasCodeFile } from "@/lib/services/aleas/aleas-code-display";
import { useEffectAsync } from "@/lib/services/core/hooks";
import { MinMax } from "@/lib/services/core/types/utils";
import { mergeClasses, randomRange } from "@/lib/services/core/utils";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

const Display = () => {

    const [files, setFiles] = useState<AleasCodeFile[]>([]);

    useEffectAsync(async () => {
        const codeFiles = await getAleasCodeFiles();
        setFiles(codeFiles);
    }, []);

    const syntaxStyle = useMemo(() => {
        const style = { ...vscDarkPlus };

        style['pre[class*="language-"]'].background = 'none';
        style['pre[class*="language-"]'].overflow = 'visible';

        return style;
    }, []);

    return <div className={mergeClasses(
        "w-screen h-screen overflow-hidden relative",
        "flex flex-row items-start justify-center",
        "bg-[#1E1E1E] p-0"
    )}>
        {files.map((file, i) => <CodeFileDisplay
            syntaxStyle={syntaxStyle}
            key={`${i} - ${file.path}`}
            file={file}
        />)}
    </div>
}


const opacityRange: MinMax = { min: 0.35, max: 0.8 };
const rotationRange: MinMax = { min: -8, max: 8 };

const durationRange: MinMax = { min: 180, max: 260 };
const delayRange: MinMax = { min: 10, max: 40 };

const xOffsetRange: MinMax = { min: -3, max: 12 };
const scaleRange: MinMax = { min: 0.85, max: 1.2 };

interface CodeFileDisplayProps {
    file: AleasCodeFile;
    syntaxStyle: { [key: string]: React.CSSProperties }
}

const CodeFileDisplay = (props: CodeFileDisplayProps) => {

    const { file, syntaxStyle } = props;

    const opacity = useMemo(() => randomRange(opacityRange.min, opacityRange.max), []);
    const rotation = useMemo(() => randomRange(rotationRange.min, rotationRange.max), []);

    const xOffset = useMemo(() => randomRange(xOffsetRange.min, xOffsetRange.max), []);

    const duration = useMemo(() => randomRange(durationRange.min, durationRange.max), []);
    const delay = useMemo(() => randomRange(delayRange.min, delayRange.max), []);

    const scale = useMemo(() => randomRange(scaleRange.min, scaleRange.max), []);
    const initialDelay = useMemo(() => Math.random() * delay, []);

    return <motion.div
        className="absolute top-0 left-0 overflow-visible"
        style={{
            rotate: rotation,
            translateX: `${xOffset}vw`,
            scale: `${scale * 100}%`
        }}
    >
        <motion.div
            className="overflow-visible"
            initial={{
                translateY: '-110%'
            }}
            animate={{
                translateY: '110%'
            }}
            transition={{
                repeat: Infinity,
                repeatType: 'loop',
                ease: 'linear',
                duration,
                repeatDelay: delay,
                delay: initialDelay
            }}
            style={{
                opacity
            }}
        >
            <SyntaxHighlighter
                language={file.language}
                className="w-screen mt-0 overflow-visible"
                wrapLines wrapLongLines
                style={syntaxStyle}
            >
                {file.code}
            </SyntaxHighlighter>
        </motion.div>
    </motion.div>
}

export default Display;