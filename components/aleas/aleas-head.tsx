import Head from "next/head";

export type AleasHeadProps = {
    title?: string;
    description?: string;
}

const AleasHead = (props: AleasHeadProps) => {
    const { title, description } = {
        title: "Aléas",
        description: "Aléas, Improvisation aléatoire", 
        ...props
    }

    return <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title}/>
        <meta property="og:description" content={description}/>
        <meta property="og:image" content="https://aleas-spectacle.fr/img/aleas-1200x630.jpg"/>
        <meta property="og:image:width" content="1200"/>
        <meta property="og:image:height" content="630"/>
        <meta property="og:image" content="https://aleas-spectacle.fr/img/aleas-1200x1200.jpg"/>
        <meta property="og:image:width" content="1200"/>
        <meta property="og:image:height" content="1200"/>
        <link rel="icon" href="/favicon.ico" />
    </Head>
}

export default AleasHead;