import { mergeClasses } from '@/lib/services/core/utils';
import { motion } from 'framer-motion';
import React from 'react';

export interface AleasSpinningLoaderProps extends React.HTMLAttributes<HTMLDivElement> {

}

const AleasSpinningLoader = (props: AleasSpinningLoaderProps) => {

    const { className } = props;

    return <div className="w-16 h-16">
        <svg className={mergeClasses(
            "full",
            "animate-spin transition-300",
            "stroke-2 stroke-blue-500/80 fill-none",
            className
        )} viewBox="0 0 24 24">
            <motion.circle
                cx="12" cy="12" r="9.5"
                transition={{ 
                    times: [0, 0.475, 0.96, 1],
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: 'loop'
                }}
                animate={{
                    strokeDasharray: ["0 150", "42 150", "42 150"],
                    strokeDashoffset: [0, -16, -59]
                }}>
            </motion.circle>
        </svg>
    </div>
};

export default AleasSpinningLoader;
