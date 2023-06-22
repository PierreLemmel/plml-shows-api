import { Photo } from "@/lib/services/api/photos"
import Image from "next/image";

interface GalleryProps extends React.HTMLAttributes<HTMLDivElement> {
    photos: Photo[];
    photoClicked?: (index: number, photo: Photo) => void;
}

const Gallery = (props: GalleryProps) => {

    const { photos, photoClicked } = props;

    return <div className={`
        w-full overflow-y-auto overflow-x-hidden
        grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4
        gap-2 lg:gap-3 xl:gap-4

    ` + (props.className ?? "")}>
        {photos.map((photo, i) => {

            const { name, url, width, height } = photo;

            return <div
                key={`photo-${i}`}
                className="
                    overflow-visible center-child
                "
                onClick={() => {
                    if (photoClicked) {
                        photoClicked(i, photo)
                    }
                }}
            >
                <Image className="
                    rounded-md lg:rounded-lg bg-slate-400
                    transition-all duration-500
                    hover:scale-[1.017] hover:cursor-pointer 
                    brightness-75 hover:brightness-100
                    h-[98%] w-[98%]
                " src={url} alt={name} width={width} height={height} />
            </div>
        })}
    </div>
}

export default Gallery