import { GetStaticProps, InferGetStaticPropsType } from 'next';
import { useCallback, useEffect, useRef, useState } from "react";
import { randomInt, } from '@/lib/services/core/utils';
import { motion } from 'framer-motion';
import AleasBackground from '@/components/aleas-components/aleas-background';
import { AleasButton } from '@/components/aleas-components/aleas-buttons';
import AleasHead from '@/components/aleas-components/aleas-head';
import { AleasModalContainer, AleasTitle } from '@/components/aleas-components/aleas-layout';
import { AleasToastContainer, toast } from '@/components/aleas-components/aleas-toast-container';
import { useEffectOnce } from '@/lib/services/core/hooks';
import { getThanksMessages } from '@/lib/services/aleas/misc/aleas-thanks';
import { flattenArray } from '@/lib/services/core/arrays';

interface ThanksProps {
    messages: string[],
}

export const getStaticProps: GetStaticProps<ThanksProps> = async () => {

    const collections = await getThanksMessages();
    const messages = flattenArray(collections.map(f => f.messages));

    return {
        props: {
            messages,
        }
    }
}

export default function ThanksDisplay(props: InferGetStaticPropsType<typeof getStaticProps>) {

    const { messages } = props;

    const [index, setIndex] = useState<number>(0);
    const [fadeIn, setFadeIn] = useState<boolean>(true);
    const fadeTimeout = useRef<NodeJS.Timeout|undefined>(undefined);

    const fadeDuration = 0.4;

    const review = messages[index];

    const onRegenerate = useCallback(() => {
        setFadeIn(false);
        fadeTimeout.current = setTimeout(() => {
            let newIndex = index;
            while (newIndex === index) {
                newIndex = randomInt(0, messages.length - 1);
            }

            setIndex(newIndex);
            setFadeIn(true);
        }, fadeDuration * 1000)
        
    }, [fadeDuration, index, messages.length]);

    useEffectOnce(onRegenerate);

    const onCopied = () => {
        navigator.clipboard.writeText(review)
        toast('Ajouté au presse-papier')
    }

    return <>
        <AleasHead />
        
        <main className="fullscreen relative overflow-hidden">
            
            <AleasBackground />
            <div className="absolute top-0 left-0 full center-child">
                <AleasModalContainer>
                    <AleasTitle>
                        Remerciements aléatoires
                    </AleasTitle>
                    <motion.div
                        className="
                            text-center overflow-y-auto overflow-x-hidden
                            sm:max-h-4/5
                            md:max-h-3/4
                            lg:max-h-[66%]
                            leading-normal
                            sm:text-lg
                            md:text-xl 
                            lg:text-xl
                            2xl:text-2xl 2xl:leading-relaxed
                        "
                        animate={{
                            opacity: fadeIn ? 1 : 0
                        }}
                        initial={{
                            opacity: 0
                        }}
                        transition={{
                            duration: fadeDuration,
                            type: "spring"
                        }}
                    >
                        <div className="w-full min-h-full center-child">
                            {review}
                        </div>
                    </motion.div>
                    <div className="
                        w-full flex items-center
                        flex-row justify-around gap-4
                        sm:flex-col sm:items-stretch
                        sm:mt-4
                    ">
                        <AleasButton onClick={onRegenerate}>
                            Une autre !
                        </AleasButton>
                        <AleasButton onClick={onCopied}>
                            Copier
                        </AleasButton>
                    </div>
                </AleasModalContainer>
            </div>
            <AleasToastContainer />
            
        </main>
        
    </>
}