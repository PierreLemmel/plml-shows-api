import { mergeClasses, sequence } from '@/lib/services/core/utils';
import { motion } from 'framer-motion';
import React from 'react';

export interface AleasSkeletonLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
    lines?: number;
}

const AleasSkeletonLoader = (props: AleasSkeletonLoaderProps) => {

    const {
        className,
        lines = 8
     } = props;

    return <div className={mergeClasses(
        className,
        "w-full flex flex-col items-center gap-3"
    )}>
        {sequence(lines).map(i => 
            <div key={`skeleton-line-${i}`}
                className={mergeClasses(
                    "w-full h-4 mb-2",
                    "relative rounded overflow-hidden"
            )}>
                <motion.div
                    className="absolute top-0 left-0 w-full h-full bg-gray-300"
                    initial={{ opacity: 0.7 }}
                    animate={{ opacity: 0.5 }}
                    transition={{
                        duration: 1.6,
                        repeat: Infinity,
                        repeatType: 'reverse'
                    }}
                >
                    <motion.div
                        className={mergeClasses(
                            "absolute top-0 h-full w-[50%]",
                            "rounded animate-pulse opacity-75",
                            "from-gray-300 via-gray-400 to-gray-400 bg-gradient-to-r"
                        )}
                        initial={{ transform: 'translateX(-240%)' }}
                        animate={{ transform: 'translateX(240%)' }}
                        transition={{
                            duration: 2.4,
                            repeat: Infinity,
                            repeatType: 'loop',
                            delay: i * i * 0.02
                        }}
                        
                    />
                </motion.div>
        </div>)}
    </div>
};

export default AleasSkeletonLoader;
