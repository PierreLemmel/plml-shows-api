import { GetStaticProps, InferGetStaticPropsType } from 'next';
import AleasBackground from "@/components/aleas/aleas-background";
import AleasHead from "@/components/aleas/aleas-head";
import { AleasMainContainer, AleasTitle } from "@/components/aleas/aleas-layout";
import { Album, getAlbum, listAlbums, Photo } from '@/lib/services/api/photos';
import React, { useState } from "react";
import Gallery from '@/components/gallery';
import { motion } from 'framer-motion';
import Image from "next/image";
import { Carousel } from 'react-responsive-carousel';

import "react-responsive-carousel/lib/styles/carousel.min.css";

interface GalleryProps {
    album: Album
}

export const getStaticProps: GetStaticProps<GalleryProps> = async () => {

    const albums = await listAlbums();
    const albumId = albums[0];
    const album = await getAlbum(albumId);

    return {
        props: {
            album
        }
    }
}

export default function PhotoGallery(props: InferGetStaticPropsType<typeof getStaticProps>) {

    const { album: { photos } } = props;

    const [displayedPhoto, setDisplayedPhoto] = useState<number>(0);
    const [showOverlay, setShowOverlay] = useState<boolean>(false);

    const photoClicked = (i: number, photo: Photo) => {
        setDisplayedPhoto(i);
        setShowOverlay(true);
    }

    return <>
        <AleasHead />

        <main className="fullscreen relative overflow-hidden">

            <AleasBackground />
            <div className="absolute top-0 left-0 full center-child">
                <AleasMainContainer overflow={true}>
                    <AleasTitle>Galerie Photos</AleasTitle>

                    <div className='flex-grow w-full center-child'>
                        <Gallery photos={photos} photoClicked={photoClicked} />
                    </div>
                </AleasMainContainer>
            </div>

            {/* Overlay */}
            <motion.div
                className="absolute top-0 left-0 full center-child bg-slate-800/80"
                variants={{
                    show: {
                        scale: 1,
                        opacity: 1
                    },
                    hide: {
                        scale: 0,
                        opacity: .2
                    }
                }}
                animate={showOverlay ? "show" : "hide"}
                initial="hide"
                transition={{
                    duration: showOverlay ? 0.8 : 1.1,
                    type: 'spring'
                }}
                onClick={() => setShowOverlay(false)}
            >
                <div className="
                    absolute
                    top-4 right-4
                    text-white text-2xl
                    hover:scale-125 hover:cursor-pointer
                    transition-all duration-300
                ">
                    x
                </div>
                <Carousel
                    selectedItem={displayedPhoto}
                    showThumbs={false}
                    className="w-11/12 h-11/12"
                >
                    {photos.map((photo, i) => {
                        const {
                            width, height,
                            url: src,
                            name: alt
                        } = photo;

                        return <div
                            key={`photo-${i}`}
                            onClick={e => e.stopPropagation()}
                        >
                            <Image 
                            key={`photo-${i}`} 
                            className="rounded-lg"
                            onClick={e => e.stopPropagation()}
                            {...{width, height, src, alt}} />
                        </div>
                    })}
                </Carousel>
            </motion.div>
        </main>
    </>
}