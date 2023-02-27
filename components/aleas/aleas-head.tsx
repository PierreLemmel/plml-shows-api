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
        <link rel="icon" href="/favicon.ico" />
    </Head>
}

export default AleasHead;