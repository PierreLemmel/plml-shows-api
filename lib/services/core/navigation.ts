import { NextRouter, useRouter } from "next/router"
import { useCallback, useEffect, useState } from "react";

export interface NavigationProps {
    router: NextRouter;
    navigateToRelativeUrl: (relativePath: string) => void;
    setQueryParameter: (key: string, value: string|undefined) => void;
    back: () => void;
    isPageLoaded: boolean;
}

export interface QueryParameter {
    key: string;
    value: string;
}

export const useNavigation = (): NavigationProps => {

    const router = useRouter();

    const isPageLoaded = !router.asPath.includes("[");
    useEffect(() => {
        if (isPageLoaded) {
            const chunks = router.asPath.split("?");
            console.log(chunks)
            if (chunks.length > 1) {
                const parameters = chunks[1].split("&")
                    .map<QueryParameter>(elt => {
                        const [key, value] = elt.split("=");
                        return { key, value }
                    })
                console.log(parameters)
                setQueryParameters(parameters);
            }
        }
    }, [isPageLoaded])


    const [queryParameters, setQueryParameters] = useState<QueryParameter[]>([]);
    useEffect(() => {

        if (isPageLoaded) {
            const routePath = getRoutePath();
        
            const path = queryParameters.length > 0 ?
                `${routePath}?${queryParameters.map(({ key: k, value: v }) => `${k}=${v}`).join("&")}` :
                routePath;
            console.log(path)
            console.log(queryParameters)
            router.replace(path);
        }

    }, [queryParameters, isPageLoaded])

    const getRoutePath = () => router.asPath.split("?")[0];

    const navigateToRelativeUrl = useCallback((relativePath: string) => {

        const path = `${getRoutePath()}/${relativePath}`.replace("//", "/");
        
        router.push(path);
    }, [router])    

    const setQueryParameter = useCallback(isPageLoaded ? (key: string, value: string|undefined) => {

        if (isPageLoaded) {
            
            const parameters = [
                    ...queryParameters.filter(queryParam => {
                        return queryParam.key !== key;
                })
            ]

            if (value !== undefined) {
                parameters.push({ key, value})
            }
            
            setQueryParameters(parameters);
        }
    } : () => {}, [isPageLoaded]);

    return {
        router,
        navigateToRelativeUrl,
        setQueryParameter,
        back: router.back,
        isPageLoaded
    }
}